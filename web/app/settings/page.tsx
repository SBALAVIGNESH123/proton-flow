'use client';

import { useState, useEffect } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function SettingsPage() {
    const [theme, setTheme] = useState('dark');
    const [refreshInterval, setRefreshInterval] = useState('5');
    const [timezone, setTimezone] = useState('UTC');
    const [retention, setRetention] = useState('30');
    const [saved, setSaved] = useState(false);
    const [protonStatus, setProtonStatus] = useState<any>(null);

    useEffect(() => {
        fetch(`${API}/api/health`).then(r => r.json()).then(setProtonStatus).catch(() => {});
    }, []);

    function handleSave() {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    }

    return (
        <div className="fade-in">
            <div className="page-header">
                <h2>⚙️ Settings</h2>
                <p>Platform configuration and preferences</p>
            </div>

            <div className="grid-2">
                <div className="card">
                    <div className="card-header"><span className="card-title">🎨 Appearance</span></div>
                    <div style={{ padding: '16px' }}>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', fontSize: '0.85em', color: 'var(--text-secondary)', marginBottom: '8px' }}>Theme</label>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                {['dark', 'light', 'system'].map(t => (
                                    <button key={t} onClick={() => setTheme(t)} style={{
                                        padding: '10px 20px', borderRadius: '8px', cursor: 'pointer',
                                        background: theme === t ? 'var(--accent)' : 'var(--bg-input)',
                                        border: `1px solid ${theme === t ? 'var(--accent)' : 'var(--border)'}`,
                                        color: theme === t ? 'white' : 'var(--text-secondary)',
                                        fontWeight: 600, fontSize: '0.9em', textTransform: 'capitalize'
                                    }}>{t === 'dark' ? '🌙' : t === 'light' ? '☀️' : '💻'} {t}</button>
                                ))}
                            </div>
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', fontSize: '0.85em', color: 'var(--text-secondary)', marginBottom: '8px' }}>Dashboard Refresh Interval</label>
                            <select value={refreshInterval} onChange={(e) => setRefreshInterval(e.target.value)} style={{ padding: '10px', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-primary)', width: '100%' }}>
                                <option value="1">1 second</option>
                                <option value="5">5 seconds</option>
                                <option value="10">10 seconds</option>
                                <option value="30">30 seconds</option>
                                <option value="60">1 minute</option>
                            </select>
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', fontSize: '0.85em', color: 'var(--text-secondary)', marginBottom: '8px' }}>Timezone</label>
                            <select value={timezone} onChange={(e) => setTimezone(e.target.value)} style={{ padding: '10px', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-primary)', width: '100%' }}>
                                <option value="UTC">UTC</option>
                                <option value="IST">Asia/Kolkata (IST)</option>
                                <option value="PST">America/Los_Angeles (PST)</option>
                                <option value="EST">America/New_York (EST)</option>
                                <option value="CET">Europe/Berlin (CET)</option>
                                <option value="JST">Asia/Tokyo (JST)</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="card-header"><span className="card-title">🗄️ Data Management</span></div>
                    <div style={{ padding: '16px' }}>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', fontSize: '0.85em', color: 'var(--text-secondary)', marginBottom: '8px' }}>Data Retention Period</label>
                            <select value={retention} onChange={(e) => setRetention(e.target.value)} style={{ padding: '10px', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-primary)', width: '100%' }}>
                                <option value="7">7 days</option>
                                <option value="14">14 days</option>
                                <option value="30">30 days</option>
                                <option value="90">90 days</option>
                                <option value="365">1 year</option>
                            </select>
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', fontSize: '0.85em', color: 'var(--text-secondary)', marginBottom: '12px' }}>Export Data</label>
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                {['logs', 'metrics', 'traces', 'infrastructure', 'alert_events'].map(stream => (
                                    <button key={stream} onClick={() => window.open(`${API}/api/query/${stream === 'alert_events' ? 'alerts/history' : stream}?limit=10000`)} style={{
                                        padding: '8px 16px', background: 'var(--bg-input)', border: '1px solid var(--border)',
                                        borderRadius: '6px', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.8em'
                                    }}>📥 {stream}</button>
                                ))}
                            </div>
                        </div>

                        <div style={{ padding: '12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px' }}>
                            <div style={{ fontWeight: 600, color: 'var(--danger)', marginBottom: '4px' }}>⚠️ Danger Zone</div>
                            <div style={{ fontSize: '0.85em', color: 'var(--text-muted)', marginBottom: '8px' }}>Purge all data from streams. This cannot be undone.</div>
                            <button style={{ padding: '8px 16px', background: 'var(--danger)', border: 'none', borderRadius: '6px', color: 'white', cursor: 'pointer', fontSize: '0.85em', fontWeight: 600 }}>🗑 Purge All Data</button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card" style={{ marginTop: '20px' }}>
                <div className="card-header"><span className="card-title">🔌 System Status</span></div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px', padding: '16px' }}>
                    <div style={{ padding: '16px', background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                        <div style={{ fontSize: '0.8em', color: 'var(--text-muted)' }}>Proton Engine</div>
                        <div style={{ fontWeight: 700, color: protonStatus?.proton === 'connected' ? 'var(--success)' : 'var(--danger)', marginTop: '4px' }}>
                            ● {protonStatus?.proton === 'connected' ? 'Connected' : 'Disconnected'}
                        </div>
                    </div>
                    <div style={{ padding: '16px', background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                        <div style={{ fontSize: '0.8em', color: 'var(--text-muted)' }}>API Server</div>
                        <div style={{ fontWeight: 700, color: 'var(--success)', marginTop: '4px' }}>● Online</div>
                    </div>
                    <div style={{ padding: '16px', background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                        <div style={{ fontSize: '0.8em', color: 'var(--text-muted)' }}>Uptime</div>
                        <div style={{ fontWeight: 700, marginTop: '4px' }}>{protonStatus?.uptime ? Math.floor(protonStatus.uptime) + 's' : '—'}</div>
                    </div>
                    <div style={{ padding: '16px', background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                        <div style={{ fontSize: '0.8em', color: 'var(--text-muted)' }}>Version</div>
                        <div style={{ fontWeight: 700, marginTop: '4px' }}>v2.0.0</div>
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button className="btn btn-primary" onClick={handleSave}>
                    {saved ? '✅ Saved!' : '💾 Save Settings'}
                </button>
            </div>
        </div>
    );
}
