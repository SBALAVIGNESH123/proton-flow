'use client';

import { useState } from 'react';

export default function LoginPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setTimeout(() => {
            localStorage.setItem('protonflow_user', JSON.stringify({ email, name: name || email.split('@')[0] }));
            window.location.href = '/';
        }, 1000);
    }

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #0a0a1a 0%, #1a1a3e 50%, #0a0a1a 100%)',
            fontFamily: "'Inter', -apple-system, sans-serif"
        }}>
            <div style={{
                width: '420px',
                padding: '40px',
                background: 'rgba(20, 20, 40, 0.8)',
                border: '1px solid rgba(99, 102, 241, 0.2)',
                borderRadius: '16px',
                backdropFilter: 'blur(20px)',
                boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5), 0 0 100px rgba(99, 102, 241, 0.1)'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{ fontSize: '3em', marginBottom: '8px' }}>⚡</div>
                    <h1 style={{ fontSize: '1.8em', fontWeight: 800, background: 'linear-gradient(135deg, #6366f1, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        ProtonFlow
                    </h1>
                    <p style={{ color: '#888', fontSize: '0.9em', marginTop: '4px' }}>
                        {isLogin ? 'Sign in to your account' : 'Create your account'}
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    {!isLogin && (
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', fontSize: '0.85em', color: '#aaa', marginBottom: '6px' }}>Full Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Bala Vignesh"
                                style={{
                                    width: '100%', padding: '12px 16px', background: 'rgba(30, 30, 60, 0.6)',
                                    border: '1px solid rgba(99, 102, 241, 0.3)', borderRadius: '8px',
                                    color: '#fff', fontSize: '0.95em', outline: 'none',
                                    transition: 'border-color 0.2s'
                                }}
                            />
                        </div>
                    )}
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', fontSize: '0.85em', color: '#aaa', marginBottom: '6px' }}>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@company.com"
                            required
                            style={{
                                width: '100%', padding: '12px 16px', background: 'rgba(30, 30, 60, 0.6)',
                                border: '1px solid rgba(99, 102, 241, 0.3)', borderRadius: '8px',
                                color: '#fff', fontSize: '0.95em', outline: 'none'
                            }}
                        />
                    </div>
                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', fontSize: '0.85em', color: '#aaa', marginBottom: '6px' }}>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            style={{
                                width: '100%', padding: '12px 16px', background: 'rgba(30, 30, 60, 0.6)',
                                border: '1px solid rgba(99, 102, 241, 0.3)', borderRadius: '8px',
                                color: '#fff', fontSize: '0.95em', outline: 'none'
                            }}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%', padding: '14px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                            color: 'white', border: 'none', borderRadius: '8px', fontSize: '1em',
                            fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
                            opacity: loading ? 0.7 : 1
                        }}
                    >
                        {loading ? '⏳ Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        style={{ background: 'none', border: 'none', color: '#6366f1', cursor: 'pointer', fontSize: '0.9em' }}
                    >
                        {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
                    </button>
                </div>

                <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: '24px', paddingTop: '20px' }}>
                    <button style={{
                        width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px',
                        color: '#ccc', cursor: 'pointer', fontSize: '0.9em'
                    }}>
                        🔑 Continue with SSO
                    </button>
                </div>
            </div>
        </div>
    );
}
