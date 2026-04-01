'use client'
import { useState } from 'react';
import { fetchEmails } from './actions';

export default function EmailExtractor() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [emails, setEmails] = useState([]);
    const [loading, setLoading] = useState(false);

    if (!isLoggedIn) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f8f9fa' }}>
                <div style={{ background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', width: '320px' }}>
                    <h4 style={{ textAlign: 'center', marginBottom: '20px' }}>Admin Access</h4>
                    <input type="password" placeholder="Password" onKeyDown={(e) => e.key === 'Enter' && e.target.value === 'CMH14' && setIsLoggedIn(true)} style={{ width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ddd' }} />
                    <button onClick={(e) => e.target.previousSibling.value === 'CMH14' ? setIsLoggedIn(true) : alert('Wrong')} style={{ width: '100%', padding: '10px', backgroundColor: '#0d6efd', color: 'white', border: 'none', borderRadius: '5px' }}>Unlock</button>
                </div>
            </div>
        );
    }

    return (
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'sans-serif', backgroundColor: '#f1f3f5', minHeight: '100vh' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                <h5 style={{ color: '#6c757d' }}>📧 Email Original Extractor</h5>
                <button onClick={() => setIsLoggedIn(false)} style={{ color: '#dc3545', background: 'none', border: '1px solid #dc3545', padding: '4px 10px', borderRadius: '4px' }}>Logout</button>
            </div>

            <form action={async (formData) => {
                setLoading(true);
                try { setEmails(await fetchEmails(formData)); } catch (err) { alert(err.message); }
                setLoading(false);
            }} style={{ backgroundColor: 'white', padding: '15px', borderRadius: '8px', display: 'flex', gap: '10px', alignItems: 'flex-end', marginBottom: '20px' }}>
                <div style={{ flex: 2 }}><label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold' }}>Gmail:</label>
                <input name="email" type="email" required style={{ width: '100%', padding: '6px', border: '1px solid #ccc' }} /></div>
                <div style={{ flex: 1 }}><label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold' }}>Label:</label>
                <input name="folder" type="text" defaultValue="INBOX" style={{ width: '100%', padding: '6px', border: '1px solid #ccc' }} /></div>
                <div style={{ flex: 1 }}><label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold' }}>App Password:</label>
                <input name="password" type="password" required style={{ width: '100%', padding: '6px', border: '1px solid #ccc' }} /></div>
                <div style={{ width: '50px' }}><label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold' }}>Start:</label>
                <input name="start" type="number" defaultValue="1" style={{ width: '100%', padding: '6px', border: '1px solid #ccc' }} /></div>
                <div style={{ width: '50px' }}><label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold' }}>Get:</label>
                <input name="count" type="number" defaultValue="5" style={{ width: '100%', padding: '6px', border: '1px solid #ccc' }} /></div>
                <button type="submit" disabled={loading} style={{ backgroundColor: '#2c5e8c', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '4px' }}>{loading ? '...' : 'Fetch'}</button>
            </form>

            {emails.map((msg) => (
                <div key={msg.id} style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #dee2e6', display: 'flex', height: '250px', marginBottom: '15px' }}>
                    <div style={{ width: '250px', padding: '15px', backgroundColor: '#fdfdfd' }}>
                        <div style={{ fontSize: '12px', fontWeight: 'bold' }}>{msg.from}</div>
                        <div style={{ fontSize: '11px', color: '#666' }}>{msg.subject}</div>
                        <button onClick={() => {navigator.clipboard.writeText(msg.source); alert('Copied');}} style={{ marginTop: '10px', width: '100%', fontSize: '11px' }}>Copy Source</button>
                    </div>
                    <div style={{ flex: 1, position: 'relative' }}>
                        <pre style={{ margin: 0, height: '100%', padding: '15px', backgroundColor: '#1e1e1e', color: '#d4d4d4', fontSize: '11px', overflow: 'auto', whiteSpace: 'pre-wrap' }}>{msg.source}</pre>
                    </div>
                </div>
            ))}
        </div>
    );
}
