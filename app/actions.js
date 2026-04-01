'use server'
import { ImapFlow } from 'imapflow';

export async function getLabels(email, password) {
    const client = new ImapFlow({
        host: 'imap.gmail.com',
        port: 993,
        secure: true,
        auth: { user: email, pass: password.replace(/\s/g, '') },
        logger: false,
        tls: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        const folders = await client.list();
        await client.logout();
        return folders.map(f => f.path);
    } catch (err) {
        throw new Error("Connection Failed: " + err.message);
    }
}

export async function fetchEmails(formData) {
    const email = formData.get('email');
    const password = formData.get('password').replace(/\s/g, '');
    const folder = formData.get('folder');
    const count = parseInt(formData.get('count')) || 5;
    const startOffset = parseInt(formData.get('start')) || 1;

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
        const end = total - (startOffset - 1);
        const start = Math.max(1, end - (count - 1));

        const emails = [];
        if (total > 0) {
            for await (let msg of client.fetch(`${start}:${end}`, { source: true, envelope: true })) {
                emails.push({
                    id: msg.seq,
                    subject: msg.envelope.subject,
                    from: msg.envelope.from[0].address,
                    date: msg.envelope.date.toLocaleString(),
                    source: msg.source.toString()
                });
            }
        }
        lock.release();
        await client.logout();
        return emails.reverse();
    } catch (err) {
        throw new Error(err.message);
    }
}
