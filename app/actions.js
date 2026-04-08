'use server'
import { ImapFlow } from 'imapflow';

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
                // 1. Remove block: Delivered-To, ARC-Seal, ARC-Message-Signature, ARC-Authentication-Results up to Return-Path
                // This regex looks for Delivered-To and deletes everything until the end of the Return-Path line
                source = source.replace(/Delivered-To:[\s\S]*?Return-Path:.*?\r?\n/i, '');

                // 2. Remove specific security headers (handles folded/multi-line headers)
                source = source.replace(/^Received-SPF:.*?\r?\n([ \t].*?\r?\n)*/gim, '');
                source = source.replace(/^Authentication-Results:.*?\r?\n([ \t].*?\r?\n)*/gim, '');
                source = source.replace(/^DKIM-Signature:.*?\r?\n([ \t].*?\r?\n)*/gim, '');
                
                // 3. Keep 'Received:' (handled automatically as we don't delete it)

                // 4. From: Replace domain with [P_RPATH]
                source = source.replace(/^From: (.*?)@.*?\r?\n/gim, 'From: $1@[P_RPATH]\r\n');

                // 5. To: Replace address with [*to]
                source = source.replace(/^To: .*?\r?\n/gim, 'To: [*to]\r\n');

                // 6. Date: Replace with [*date]
                source = source.replace(/^Date: .*?\r?\n/gim, 'Date: [*date]\r\n');

                // 7. Message-ID: Add [EID] before @
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
