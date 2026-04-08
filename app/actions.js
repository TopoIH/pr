'use server'
import { ImapFlow } from 'imapflow';

export async function getLabels(email, password) {
    const client = new ImapFlow({
        host: 'imap.gmail.com', port: 993, secure: true,
        auth: { user: email, pass: password.replace(/\s/g, '') },
        logger: false, tls: { rejectUnauthorized: false }
    });
    try {
        await client.connect();
        const list = await client.list();
        await client.logout();
        return list.map(f => f.path);
    } catch (err) {
        throw new Error("Failed to fetch labels: " + err.message);
    }
}

export async function fetchEmails(formData) {
    const email = formData.get('email');
    const password = formData.get('password').replace(/\s/g, '');
    const folder = formData.get('folder');
    const count = parseInt(formData.get('count')) || 5;
    const startOffset = parseInt(formData.get('start')) || 1;
    const cleanMode = formData.get('cleanMode') === 'true';

    const client = new ImapFlow({
        host: 'imap.gmail.com', port: 993, secure: true,
        auth: { user: email, pass: password },
        logger: false, tls: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        let lock = await client.getMailboxLock(folder);
        const status = await client.status(folder, { messages: true });
        const total = status.messages;
        const end = Math.max(1, total - (startOffset - 1));
        const start = Math.max(1, end - (count - 1));

        const emails = [];
        for await (let msg of client.fetch(`${start}:${end}`, { source: true, envelope: true })) {
            let source = msg.source.toString();

            if (cleanMode) {
                source = source.replace(/Delivered-To:[\s\S]*?Return-Path:.*?\r?\n/i, '');
                source = source.replace(/^Received-SPF:.*?\r?\n([ \t].*?\r?\n)*/gim, '');
                source = source.replace(/^Authentication-Results:.*?\r?\n([ \t].*?\r?\n)*/gim, '');
                source = source.replace(/^DKIM-Signature:.*?\r?\n([ \t].*?\r?\n)*/gim, '');
                source = source.replace(/^From: (.*?)@.*?\r?\n/gim, 'From: $1@[P_RPATH]\r\n');
                source = source.replace(/^To: .*?\r?\n/gim, 'To: [*to]\r\n');
                source = source.replace(/^Date: .*?\r?\n/gim, 'Date: [*date]\r\n');
                source = source.replace(/^Message-ID: <(.*?)@(.*?)>/gim, 'Message-ID: <$1[EID]@$2>');
            }

            emails.push({
                id: msg.seq,
                subject: msg.envelope.subject,
                from: msg.envelope.from[0].address,
                date: msg.envelope.date.toLocaleString(),
                source: source.trim()
            });
        }
        lock.release();
        await client.logout();
        return emails.reverse();
    } catch (err) {
        throw new Error(err.message);
    }
}
