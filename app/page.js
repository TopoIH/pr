'use client'
import { useState } from 'react';
import { fetchEmails, getLabels } from './actions';

export default function EmailExtractor() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [emails, setEmails] = useState([]);
    const [loading, setLoading] = useState(false);
    const [cleanMode, setCleanMode] = useState(false);
    const [labels, setLabels] = useState([]);
    const [step, setStep] = useState(1); // 1: Login/Connect, 2: Fetching
    const [creds, setCreds] = useState({ email: '', pass: '' });

    const inputStyle = { width: '100%', padding: '10px 12px', fontSize: '14px', border: '1px solid #cbd5e1', borderRadius: '8px', outline: 'none', backgroundColor: 'white', boxSizing: 'border-box' };
    const labelStyle = { display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748b', marginBottom: '5px', textTransform: 'uppercase' };

    async function handleConnection(e) {
        e.preventDefault();
        setLoading(true);
        const fd = new FormData(e.target);
        const email = fd.get('email');
        const pass = fd.get('password');
        try {
            const fetchedLabels = await getLabels(email, pass);
            setLabels(fetchedLabels);
            setCreds({ email, pass });
            setStep(2);
        } catch (err) { alert(err.message); }
        setLoading(false);
    }

    // Fixed Login Card Layout
    if (!isLoggedIn) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#fefdf5', fontFamily: 'system-ui, sans-serif' }}>
                <div style={{ backgroundColor: '#475569', borderRadius: '12px', padding: '40px 30px', width: '100%', maxWidth: '480px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '25px', color: 'white' }}>
                        <span style={{ fontSize: '24px' }}>🔐</span>
                        <h2 style={{ fontSize: '22px', fontWeight: '600', margin: 0 }}>Enter Access Code</h2>
                    </div>
                    <input 
                        type="password" 
                        placeholder="Access Code" 
                        onKeyDown={(e) => e.key === 'Enter' && e.target.value === 'CMH14' && setIsLoggedIn(true)} 
                        style={{ ...inputStyle, padding: '14px', fontSize: '16px', marginBottom: '20px' }} 
                    />
                    <button 
                        onClick={(e) => { const val = e.target.parentElement.querySelector('input').value; val === 'CMH14' ? setIsLoggedIn(true) : alert('Access Denied'); }} 
                        style={{ width: '100%', padding: '14px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '16px', cursor: 'pointer' }}
                    >
                        Enter
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f1f5f9', padding: '40px', fontFamily: 'system-ui, sans-serif' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h1 style={{ fontSize: '22px', fontWeight: 'bold' }}>Extractor<span style={{color:'#4f46e5'}}>Pro</span></h1>
                    <button onClick={() => { setIsLoggedIn(false); setStep(1); }} style={{ color: '#64748b', background: 'white', border: '1px solid #e2e8f0', padding: '6px 15px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>Logout</button>
                </div>

                {step === 1 ? (
                    <form onSubmit={handleConnection} style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', display: 'flex', gap: '15px', alignItems: 'flex-end', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                        <div style={{ flex: 2 }}><label style={labelStyle}>Gmail Email</label><input name="email" type="email" required placeholder="example@gmail.com" style={inputStyle} /></div>
                        <div style={{ flex: 2 }}><label style={labelStyle}>App Password</label><input name="password" type="password" required style={inputStyle} /></div>
                        <button type="submit" disabled={loading} style={{ backgroundColor: '#4f46e5', color: 'white', border: 'none', padding: '12px 30px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>{loading ? '...' : 'Connect'}</button>
                    </form>
                ) : (
                    <form action={async (formData) => {
                        setLoading(true);
                        formData.append('email', creds.email);
                        formData.append('password', creds.pass);
                        formData.append('cleanMode', cleanMode);
                        try { const data = await fetchEmails(formData); setEmails(data); } catch (err) { alert(err.message); }
                        setLoading(false);
                    }} style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', display: 'flex', gap: '15px', alignItems: 'flex-end', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', marginBottom: '30px' }}>
                        <div style={{ flex: 2 }}>
                            <label style={labelStyle}>Select Label</label>
                            <select name="folder" style={inputStyle}>
                                {labels.map(l => <option key={l} value={l}>{l}</option>)}
                            </select>
                        </div>
                        <div style={{ width: '80px' }}><label style={labelStyle}>Start</label><input name="start" type="number" defaultValue="1" style={inputStyle} /></div>
                        <div style={{ width: '80px' }}><label style={labelStyle}>Count</label><input name="count" type="number" defaultValue="5" style={inputStyle} /></div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '80px', paddingBottom: '5px' }}>
                            <label style={labelStyle}>Clean</label>
                            <input type="checkbox" checked={cleanMode} onChange={(e) => setCleanMode(e.target.checked)} style={{ width: '20px', height: '20px', cursor: 'pointer' }} />
                        </div>
                        <button type="submit" disabled={loading} style={{ backgroundColor: '#0f172a', color: 'white', border: 'none', padding: '12px 25px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>{loading ? '...' : 'Fetch'}</button>
                        <button type="button" onClick={() => setStep(1)} style={{ backgroundColor: '#f1f5f9', color: '#64748b', border: 'none', padding: '12px 15px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>Reset</button>
                    </form>
                )}

                {/* Results Section */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {emails.length > 0 && (
                        <button onClick={() => { const allSource = emails.map(msg => msg.source).join('\n__SEP__\n'); navigator.clipboard.writeText(allSource); alert('Copied!'); }} style={{ alignSelf: 'flex-end', padding: '10px 20px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>📋 Copy All with __SEP__</button>
                    )}
                    {emails.map((msg) => (
                        <div key={msg.id} style={{ backgroundColor: 'white', borderRadius: '12px', display: 'flex', height: '400px', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                            <div style={{ width: '300px', padding: '20px', borderRight: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                <div><p style={labelStyle}>Sender</p><p style={{ fontSize: '13px', fontWeight: '600', wordBreak: 'break-all', color: '#1e293b' }}>{msg.from}</p></div>
                                <button onClick={() => { navigator.clipboard.writeText(msg.source); alert('Copied!'); }} style={{ width: '100%', padding: '10px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#f8fafc', color: '#475569' }}>Copy Source</button>
                            </div>
                            <div style={{ flex: 1, backgroundColor: '#0f172a', padding: '20px', overflow: 'auto' }}>
                                <pre style={{ margin: 0, color: '#38bdf8', fontSize: '12px', whiteSpace: 'pre-wrap', fontFamily: 'monospace', lineHeight: '1.5' }}>{msg.source}</pre>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
