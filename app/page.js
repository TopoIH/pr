'use client'
import { useState } from 'react';
import { getLabels, fetchEmails } from './actions';

export default function EmailExtractor() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [step, setStep] = useState(1); // 1: Login, 2: Select Label & Fetch
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [labels, setLabels] = useState([]);
    const [emails, setEmails] = useState([]);
    const [loading, setLoading] = useState(false);

    // Reusable styles
    const cardStyle = { background: 'white', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0', padding: '24px' };
    const inputStyle = { padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', width: '100%' };

    // Step 1: Connect to get labels
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
                    <button onClick={(e) => e.target.previousSibling.value === 'CMH14' ? setIsLoggedIn(true) : alert('No')} style={{ width: '100%', marginTop: '10px', padding: '10px', backgroundColor: '#4f46e5', color: 'white', border: 'none', borderRadius: '6px' }}>Unlock</button>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', padding: '40px', fontFamily: 'sans-serif' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
                    <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>Extractor<span style={{color:'#4f46e5'}}>Pro</span></h1>
                    <button onClick={() => { setIsLoggedIn(false); setStep(1); }} style={{ color: '#64748b', background: 'none', border: '1px solid #ddd', padding: '5px 15px', borderRadius: '6px' }}>Logout</button>
                </div>

                {/* STEP 1: CONNECT */}
                {step === 1 && (
                    <div style={cardStyle}>
                        <h3 style={{ marginBottom: '20px', fontSize: '16px' }}>Step 1: Connect to Gmail</h3>
                        <form onSubmit={handleConnect} style={{ display: 'flex', gap: '15px' }}>
                            <input name="email" type="email" placeholder="Gmail Address" required style={inputStyle} />
                            <input name="password" type="password" placeholder="App Password" required style={inputStyle} />
                            <button type="submit" disabled={loading} style={{ padding: '10px 30px', backgroundColor: '#4f46e5', color: 'white', border: 'none', borderRadius: '6px' }}>
                                {loading ? 'Connecting...' : 'Connect'}
                            </button>
                        </form>
                    </div>
                )}

                {/* STEP 2: CHOOSE LABEL AND FETCH */}
                {step === 2 && (
                    <>
                        <div style={cardStyle}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                                <h3 style={{ fontSize: '16px' }}>Step 2: Select Label & Extract</h3>
                                <button onClick={() => setStep(1)} style={{ fontSize: '12px', color: '#4f46e5', background: 'none', border: 'none', cursor: 'pointer' }}>Change Account</button>
                            </div>
                            <form action={async (fd) => {
                                setLoading(true);
                                fd.append('email', credentials.email);
                                fd.append('password', credentials.password);
                                try { setEmails(await fetchEmails(fd)); } catch (err) { alert(err.message); }
                                setLoading(false);
                            }} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '15px', alignItems: 'end' }}>
                                <div>
                                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b' }}>SELECT YOUR LABEL</label>
                                    <select name="folder" style={inputStyle}>
                                        {labels.map(l => <option key={l} value={l}>{l}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b' }}>START</label>
                                    <input name="start" type="number" defaultValue="1" style={inputStyle} />
                                </div>
                                <div>
                                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b' }}>COUNT</label>
                                    <input name="count" type="number" defaultValue="5" style={inputStyle} />
                                </div>
                                <button type="submit" disabled={loading} style={{ padding: '10px', backgroundColor: '#0f172a', color: 'white', border: 'none', borderRadius: '6px' }}>
                                    {loading ? 'Fetching...' : 'Extract Emails'}
                                </button>
                            </form>
                        </div>

                        {/* Results Scroll boxes */}
                        <div style={{ marginTop: '30px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {emails.map((msg) => (
                                <div key={msg.id} style={{ ...cardStyle, display: 'flex', height: '300px', padding: 0, overflow: 'hidden' }}>
                                    <div style={{ width: '300px', padding: '20px', borderRight: '1px solid #f1f5f9' }}>
                                        <div style={{ fontSize: '12px', fontWeight: 'bold' }}>{msg.from}</div>
                                        <div style={{ fontSize: '11px', color: '#64748b', margin: '10px 0' }}>{msg.subject}</div>
                                        <button onClick={() => {navigator.clipboard.writeText(msg.source); alert('Copied');}} style={{ width: '100%', padding: '8px', fontSize: '11px', cursor: 'pointer' }}>Copy Source</button>
                                    </div>
                                    <div style={{ flex: 1, backgroundColor: '#0f172a' }}>
                                        <pre style={{ margin: 0, height: '100%', padding: '20px', color: '#38bdf8', fontSize: '12px', overflow: 'auto', whiteSpace: 'pre-wrap' }}>{msg.source}</pre>
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
