'use client'
import { useState } from 'react';
import { fetchEmails } from './actions';

export default function EmailExtractor() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [emails, setEmails] = useState([]);
    const [loading, setLoading] = useState(false);
    const [cleanMode, setCleanMode] = useState(false);

    const inputStyle = { width: '100%', padding: '8px', fontSize: '13px', border: '1px solid #cbd5e1', borderRadius: '6px', backgroundColor: '#fff', outline: 'none' };
    const labelStyle = { display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748b', marginBottom: '5px', textTransform: 'uppercase' };

    if (!isLoggedIn) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#fefdf5', fontFamily: 'system-ui, sans-serif' }}>
                <div style={{ backgroundColor: '#475569', borderRadius: '8px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)', padding: '30px', width: '100%', maxWidth: '480px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '20px', color: 'white' }}>
                        <span style={{ fontSize: '20px' }}>🔐</span>
                        <h2 style={{ fontSize: '20px', fontWeight: '600', margin: 0 }}>Enter Access Code</h2>
                    </div>
                    <div style={{ marginBottom: '15px' }}>
                        <input type="password" placeholder="Access Code" onKeyDown={(e) => e.key === 'Enter' && e.target.value === 'CMH14' && setIsLoggedIn(true)} style={{ ...inputStyle, padding: '12px', fontSize: '15px' }} />
                    </div>
                    <button onClick={(e) => { const val = e.target.parentElement.querySelector('input').value; val === 'CMH14' ? setIsLoggedIn(true) : alert('Access Denied'); }} style={{ width: '100%', padding: '12px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '700', fontSize: '16px', cursor: 'pointer' }}>Enter</button>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f1f5f9', padding: '40px', fontFamily: 'system-ui, sans-serif' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h1 style={{ fontSize: '22px', fontWeight: 'bold', color: '#1e293b' }}>Extractor<span style={{color:'#4f46e5'}}>Pro</span></h1>
                    <button onClick={() => setIsLoggedIn(false)} style={{ color: '#64748b', background: 'white', border: '1px solid #e2e8f0', padding: '6px 15px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>Logout</button>
                </div>

                <form action={async (formData) => {
                    setLoading(true);
                    formData.append('cleanMode', cleanMode); // Ensure state is attached to the form
                    try {
                        const data = await fetchEmails(formData);
                        setEmails(data);
                    } catch (err) { alert(err.message); }
                    setLoading(false);
                }} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', display: 'flex', gap: '15px', alignItems: 'flex-end', marginBottom: '30px' }}>
                    <div style={{ flex: 2 }}><label style={labelStyle}>Gmail/Email:</label><input name="email" type="email" required placeholder="example@gmail.com" style={inputStyle} /></div>
                    <div style={{ flex: 1.5 }}><label style={labelStyle}>Label/Folder:</label><input name="folder" type="text" defaultValue="INBOX" style={inputStyle} /></div>
                    <div style={{ flex: 2 }}><label style={labelStyle}>App Password:</label><input name="password" type="password" required style={inputStyle} /></div>
                    <div style={{ width: '60px' }}><label style={labelStyle}>Start:</label><input name="start" type="number" defaultValue="1" style={inputStyle} /></div>
                    <div style={{ width: '60px' }}><label style={labelStyle}>Get:</label><input name="count" type="number" defaultValue="5" style={inputStyle} /></div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '100px', paddingBottom: '5px' }}>
                        <label style={{ ...labelStyle, marginBottom: '8px' }}>Cleaned</label>
                        <input type="checkbox" checked={cleanMode} onChange={(e) => setCleanMode(e.target.checked)} style={{ width: '20px', height: '20px', cursor: 'pointer' }} />
                    </div>

                    <button type="submit" disabled={loading} style={{ backgroundColor: '#0f172a', color: 'white', border: 'none', padding: '10px 25px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', height: '38px' }}>
                        {loading ? '...' : 'Fetch'}
                    </button>
                </form>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {emails.length > 0 && (
                        <button onClick={() => { const allSource = emails.map(msg => msg.source).join('\n__SEP__\n'); navigator.clipboard.writeText(allSource); alert('Copied!'); }} style={{ alignSelf: 'flex-end', padding: '10px 20px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>📋 Copy All with __SEP__</button>
                    )}
                    {emails.map((msg) => (
                        <div key={msg.id} style={{ backgroundColor: 'white', borderRadius: '12px', display: 'flex', height: '400px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                            <div style={{ width: '300px', padding: '20px', borderRight: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                <div><p style={labelStyle}>Sender</p><p style={{ fontSize: '13px', fontWeight: '600', wordBreak: 'break-all' }}>{msg.from}</p></div>
                                <button onClick={() => { navigator.clipboard.writeText(msg.source); alert('Copied!'); }} style={{ width: '100%', padding: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', border: '1px solid #e2e8f0', borderRadius: '6px', background: '#f8fafc' }}>Copy Source</button>
                            </div>
                            <div style={{ flex: 1, backgroundColor: '#0f172a', padding: '20px', overflow: 'auto' }}>
                                <pre style={{ margin: 0, color: '#38bdf8', fontSize: '12px', whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>{msg.source}</pre>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
