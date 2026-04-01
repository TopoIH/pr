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

    // Modern Professional Styles
    const cardStyle = { background: 'white', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0', padding: '24px' };
    const inputStyle = { padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', width: '100%', fontSize: '14px', outline: 'none' };

    // Function to copy all sources with the __SEP__ divider
    const copyAllToClipboard = () => {
        if (emails.length === 0) return;
        const allSource = emails.map(msg => msg.source).join('\n__SEP__\n');
        navigator.clipboard.writeText(allSource);
        alert(`Copied ${emails.length} emails with __SEP__ divider!`);
    };

    // Step 1 handler: Connect and fetch real labels
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
        } catch (err) { 
            alert("Connection Error: " + err.message); 
        }
        setLoading(false);
    }

    // Password Protection Screen
   if (!isLoggedIn) {
        return (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100vh', 
                backgroundColor: '#f1f5f9', // Light grey-blue background
                fontFamily: 'system-ui, -apple-system, sans-serif'
            }}>
                <div style={{ 
                    background: 'white', 
                    borderRadius: '16px', 
                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)', 
                    padding: '40px', 
                    width: '100%', 
                    maxWidth: '400px', 
                    textAlign: 'center' 
                }}>
                    {/* Lock Icon matching the image */}
                    <div style={{ fontSize: '48px', marginBottom: '20px' }}>🔐</div>
                    
                    <h2 style={{ 
                        marginBottom: '24px', 
                        color: '#1e293b', 
                        fontSize: '28px', 
                        fontWeight: '600',
                        letterSpacing: '-0.025em'
                    }}>Admin Access</h2>
                    
                    <div style={{ textAlign: 'left', marginBottom: '20px' }}>
                        <input 
                            type="password" 
                            placeholder="Enter Password" 
                            onKeyDown={(e) => e.key === 'Enter' && e.target.value === 'CMH14' && setIsLoggedIn(true)} 
                            style={{
                                ...inputStyle,
                                padding: '12px 16px',
                                fontSize: '16px',
                                border: '1px solid #e2e8f0',
                                backgroundColor: '#fcfcfc'
                            }} 
                        />
                    </div>

                    <button 
                        onClick={(e) => {
                            const val = e.target.previousSibling.firstChild.value;
                            val === 'CMH14' ? setIsLoggedIn(true) : alert('Access Denied');
                        }} 
                        style={{ 
                            width: '100%', 
                            padding: '12px', 
                            backgroundColor: '#4f46e5', // Brand Indigo
                            color: 'white', 
                            border: 'none', 
                            borderRadius: '8px', 
                            fontWeight: '600', 
                            fontSize: '16px',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s'
                        }}
                    >
                        Unlock Dashboard
                    </button>
                </div>
            </div>
        );
    }
