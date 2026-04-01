'use client'
import { useState } from 'react';
import { getLabels, fetchEmails } from './actions';

export default function EmailExtractor() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [step, setStep] = useState(1); 
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [labels, setLabels] = useState([]);
    const [selectedLabel, setSelectedLabel] = useState('INBOX');
    const [emails, setEmails] = useState([]);
    const [loading, setLoading] = useState(false);

    const cardStyle = { background: 'white', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0', padding: '24px' };
    const inputStyle = { padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', width: '100%', fontSize: '14px' };

    const copyAllToClipboard = () => {
        if (emails.length === 0) return;
        const allSource = emails.map(msg => msg.source).join('\n__SEP__\n');
        navigator.clipboard.writeText(allSource);
        alert(`Copied ${emails.length} emails with __SEP__ divider!`);
    };

    async function handleConnect(e) {
        e.preventDefault();
        setLoading(true);
        const fd = new FormData(e.target);
        const email = fd.get('email');
        const pass = fd.get('password');
        try {
            const fetchedLabels = await getLabels(email, pass);
            setLabels(fetchedLabels);
            setCredentials({ email, password: pass });
            setStep(2);
        } catch (err) { alert(err.message); }
        setLoading(false);
    }

    if (!isLoggedIn) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f1f5f9' }}>
                <div style={{ ...cardStyle, width: '350px', textAlign: 'center' }}>
                    <h2 style={{ marginBottom: '20px' }}>Admin Access</h2>
                    <input type="password" placeholder="Password" onKeyDown={(e) => e.key === 'Enter' && e.target.value === 'CMH14' && setIsLoggedIn(true)} style={inputStyle} />
                    <button onClick={(e) => e.target.previousSibling.value === 'CMH14' ? setIsLoggedIn(true) : alert('Denied')} style={{ width: '100%', marginTop: '10px', padding: '10px', backgroundColor: '#4f46e5', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Unlock</button>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', padding: '40px', fontFamily: 'sans-serif' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                    <h1 style={{ fontSize: '22px', fontWeight: 'bold', margin: 0 }}>Extractor<span style={{color:'#4f46e5'}}>Pro</span></h1>
                    <button onClick={() => { setIsLoggedIn(false); setStep(1); }} style={{ color: '#64748b', background: 'none', border: '1px solid #ddd', padding: '6px 16px', borderRadius: '6px', cursor: 'pointer' }}>Logout</button>
                </div>

                {step === 1 && (
                    <div style={cardStyle}>
                        <h3 style={{ marginBottom: '20px', fontSize: '15px', color: '#475569' }}>Step 1: Connect to Account</h3>
                        <form onSubmit={handleConnect} style={{ display: 'flex', gap: '15px' }}>
                            <input name="email" type="email" placeholder="Gmail Address" required style={inputStyle} />
                            <input name="password" type="password" placeholder="App Password" required style={inputStyle} />
                            <button type="submit" disabled={loading} style={{ padding: '10px 30px', backgroundColor: '#4f46e5', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                                {loading ? 'Connecting...' : 'Connect'}
                            </button>
                        </form>
                    </div>
                )}

                {step === 2 && (
                    <>
                        <div style={cardStyle}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                                <h3 style={{ fontSize: '15px', color: '#475569' }}>Step 2: Configuration</h3>
                                <button onClick={() => setStep(1)} style={{ fontSize: '12px', color: '#4f46e5', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600' }}>Switch Account</button>
                            </div>
                            <form action={async (fd) => {
                                setLoading(true);
                                fd.append('email', credentials.email);
                                fd.append('password', credentials.password);
                                try { setEmails(await fetchEmails(fd)); } catch (err) { alert(err.message); }
                                setLoading(false);
                            }} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '15px', alignItems: 'end' }}>
                                <div>
                                    <label style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', display: 'block', marginBottom: '8px' }}>LABEL</label>
                                    <select name="folder" value={selectedLabel} onChange={(e) => setSelectedLabel(e.target.value)} style={inputStyle}>
                                        {labels.map(l => <option key={l} value={l}>{l}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', display: 'block', marginBottom: '8px' }}>START FROM</label>
                                    <input name="start" type="number" defaultValue="1" style={inputStyle} />
                                </div>
                                <div>
                                    <label style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', display: 'block', marginBottom: '8px' }}>QUANTITY</label>
                                    <input name="count" type="number" defaultValue="5" style={inputStyle} />
                                </div>
                                <button type="submit" disabled={loading} style={{ padding: '10px', backgroundColor: '#0f172a', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                                    {loading ? 'Processing...' : 'Fetch Emails'}
                                </button>
                            </form>
                        </div>

                        {emails.length > 0 && (
                            <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 10px' }}>
                                <h4 style={{ margin: 0, color: '#475569', fontSize: '14px' }}>Found {emails.length} Emails</h4>
                                <button onClick={copyAllToClipboard} style={{ padding: '8px 20px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>
                                    📋 Copy All with __SEP__
                                </button>
                            </div>
                        )}

                        <div style={{ marginTop: '15px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {emails.map((msg) => (
                                <div key={msg.id} style={{ ...cardStyle, display: 'flex', height: '400px', padding: 0, overflow: 'hidden' }}>
                                    <div style={{ width: '320px', minWidth: '320px', padding: '24px', borderRight: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', backgroundColor: '#fdfdfd' }}>
                                        <div>
                                            <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#4f46e5', marginBottom: '4px' }}>SENDER</div>
                                            <div style={{ fontSize: '13px', fontWeight: '600', color: '#1e293b', marginBottom: '16px', wordBreak: 'break-all' }}>{msg.from}</div>
                                            <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', marginBottom: '4px' }}>SUBJECT</div>
                                            <div style={{ fontSize: '12px', color: '#475569', lineHeight: '1.4', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: '3', WebkitBoxOrient: 'vertical' }}>{msg.subject}</div>
                                        </div>
                                        <button onClick={() => {navigator.clipboard.writeText(msg.source); alert('Copied');}} style={{ width: '100%', padding: '10px', fontSize: '12px', cursor: 'pointer', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', fontWeight: '600' }}>
                                            Copy Single Source
                                        </button>
                                    </div>
                                    <div style={{ flex: 1, backgroundColor: '#0f172a', height: '100%' }}>
                                        <pre style={{ margin: 0, height: '100%', padding: '20px', color: '#38bdf8', fontSize: '12px', overflow: 'auto', whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>{msg.source}</pre>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
