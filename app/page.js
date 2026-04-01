'use client'
import { useState } from 'react';
import { fetchEmails } from './actions';

export default function EmailExtractor() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [emails, setEmails] = useState([]);
    const [loading, setLoading] = useState(false);

    // Styling constants for a professional look
    const cardStyle = { background: 'white', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: '1px solid #e2e8f0' };
    const inputStyle = { padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', width: '100%', outline: 'none' };

    if (!isLoggedIn) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f1f5f9' }}>
                <div style={{ ...cardStyle, padding: '40px', width: '350px', textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', marginBottom: '20px' }}>🔐</div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1e293b', marginBottom: '24px' }}>Admin Access</h2>
                    <input type="password" placeholder="Enter Password" onKeyDown={(e) => e.key === 'Enter' && e.target.value === 'CMH14' && setIsLoggedIn(true)} style={inputStyle} />
                    <button onClick={(e) => e.target.previousSibling.value === 'CMH14' ? setIsLoggedIn(true) : alert('Access Denied')} 
                            style={{ width: '100%', marginTop: '16px', padding: '10px', backgroundColor: '#4f46e5', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}>
                        Unlock Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', color: '#1e293b', fontFamily: 'Inter, system-ui, sans-serif' }}>
            {/* Navbar */}
            <nav style={{ backgroundColor: 'white', borderBottom: '1px solid #e2e8f0', padding: '16px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '20px' }}>📨</span>
                    <h1 style={{ fontSize: '18px', fontWeight: '700', margin: 0, color: '#0f172a' }}>Extractor<span style={{color: '#4f46e5'}}>Pro</span></h1>
                </div>
                <button onClick={() => setIsLoggedIn(false)} style={{ color: '#64748b', background: 'none', border: '1px solid #e2e8f0', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>Logout</button>
            </nav>

            <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '32px' }}>
                {/* Control Panel */}
                <div style={{ ...cardStyle, padding: '24px', marginBottom: '32px' }}>
                    <form action={async (formData) => {
                        setLoading(true);
                        try { setEmails(await fetchEmails(formData)); } catch (err) { alert(err.message); }
                        setLoading(false);
                    }} style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 2fr 0.5fr 0.5fr 1fr', gap: '16px', alignItems: 'end' }}>
                        
                        <div>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#64748b', marginBottom: '6px' }}>GMAIL ADDRESS</label>
                            <input name="email" type="email" placeholder="user@gmail.com" required style={inputStyle} />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#64748b', marginBottom: '6px' }}>SELECT LABEL</label>
                            <select name="folder" style={inputStyle}>
                                <option value="INBOX">Inbox</option>
                                <option value="[Gmail]/Spam">Spam</option>
                                <option value="[Gmail]/All Mail">All Mail</option>
                                <option value="[Gmail]/Sent Mail">Sent</option>
                                <option value="[Gmail]/Trash">Trash</option>
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#64748b', marginBottom: '6px' }}>APP PASSWORD</label>
                            <input name="password" type="password" placeholder="•••• •••• •••• ••••" required style={inputStyle} />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#64748b', marginBottom: '6px' }}>START</label>
                            <input name="start" type="number" defaultValue="1" style={inputStyle} />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#64748b', marginBottom: '6px' }}>GET</label>
                            <input name="count" type="number" defaultValue="5" style={inputStyle} />
                        </div>

                        <button type="submit" disabled={loading} style={{ backgroundColor: loading ? '#94a3b8' : '#4f46e5', color: 'white', border: 'none', padding: '10px', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', transition: 'background 0.2s' }}>
                            {loading ? 'Fetching...' : 'Fetch Source'}
                        </button>
                    </form>
                </div>

                {/* Results List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {emails.length === 0 && !loading && (
                        <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>
                            No emails fetched yet. Enter your credentials above.
                        </div>
                    )}

                    {emails.map((msg) => (
                        <div key={msg.id} style={{ ...cardStyle, display: 'flex', overflow: 'hidden', height: '350px' }}>
                            <div style={{ width: '300px', padding: '24px', backgroundColor: '#fdfdfd', borderRight: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column' }}>
                                <div style={{ fontSize: '11px', fontWeight: '700', color: '#4f46e5', textTransform: 'uppercase', marginBottom: '8px' }}>Sender</div>
                                <div style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b', marginBottom: '16px', wordBreak: 'break-all' }}>{msg.from}</div>
                                
                                <div style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>Subject</div>
                                <div style={{ fontSize: '13px', color: '#475569', marginBottom: 'auto' }}>{msg.subject}</div>
                                
                                <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '16px' }}>{msg.date}</div>
                                
                                <button onClick={() => {navigator.clipboard.writeText(msg.source); alert('Source Copied');}} 
                                        style={{ width: '100%', padding: '8px', backgroundColor: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', color: '#475569' }}>
                                    Copy Raw Source
                                </button>
                            </div>
                            <div style={{ flex: 1, backgroundColor: '#0f172a', position: 'relative' }}>
                                <pre style={{ margin: 0, height: '100%', padding: '20px', color: '#38bdf8', fontSize: '12px', fontFamily: '"Fira Code", monospace', overflow: 'auto', whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>
                                    {msg.source}
                                </pre>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
