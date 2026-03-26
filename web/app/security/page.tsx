'use client';

import { useEffect, useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function SecurityPage() {
    const [logs, setLogs] = useState<any[]>([]);
    const [threats, setThreats] = useState(0);
    const [blocked, setBlocked] = useState(0);

    async function fetchData() {
        try {
            const res = await fetch(`${API}/api/query/logs?limit=100`);
            const data = await res.json();
            const rows = Array.isArray(data.data) ? data.data.filter((d: any) => typeof d === 'object') : [];
            setLogs(rows);
            setThreats(rows.filter((l: any) => l.level === 'error').length);
            setBlocked(rows.filter((l: any) => l.message?.includes('Rate limit') || l.message?.includes('Failed')).length);
        } catch (err) {
            console.error('Security fetch error:', err);
        }
    }

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, []);

    const securityEvents = logs.filter(l => l.level === 'error' || l.level === 'warn');
    const riskScore = threats > 5 ? 'High' : threats > 2 ? 'Medium' : 'Low';
    const riskColor = threats > 5 ? 'var(--danger)' : threats > 2 ? 'var(--warning)' : 'var(--success)';

    return (
        <div className="fade-in">
            <div className="page-header">
                <h2>🛡️ Security Monitoring</h2>
                <p>Threat detection, security events, and access pattern analysis</p>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-label">Risk Level</div>
                    <div className="stat-value" style={{ color: riskColor }}>{riskScore}</div>
                    <div className="stat-change" style={{ color: riskColor }}>Based on recent events</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Threats Detected</div>
                    <div className="stat-value" style={{ color: threats > 0 ? 'var(--danger)' : 'var(--success)' }}>{threats}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Blocked Requests</div>
                    <div className="stat-value" style={{ color: 'var(--warning)' }}>{blocked}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Security Events</div>
                    <div className="stat-value">{securityEvents.length}</div>
                </div>
            </div>

            <div className="grid-2">
                <div className="card">
                    <div className="card-header">
                        <span className="card-title">🚨 Threat Feed</span>
                        <div className="status-bar"><span className="live-dot"></span> Live</div>
                    </div>
                    {securityEvents.length > 0 ? (
                        <div>
                            {securityEvents.slice(0, 15).map((evt, i) => (
                                <div key={i} style={{
                                    padding: '12px',
                                    borderLeft: `3px solid ${evt.level === 'error' ? 'var(--danger)' : 'var(--warning)'}`,
                                    marginBottom: '8px',
                                    background: 'var(--bg-input)',
                                    borderRadius: '0 var(--radius-sm) var(--radius-sm) 0'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                        <span className={`badge ${evt.level === 'error' ? 'badge-danger' : 'badge-warning'}`}>
                                            {evt.level === 'error' ? '🚨 THREAT' : '⚠️ WARN'}
                                        </span>
                                        <span style={{ fontSize: '0.75em', color: 'var(--text-muted)' }}>
                                            {new Date(evt.timestamp).toLocaleTimeString()}
                                        </span>
                                    </div>
                                    <div style={{ fontSize: '0.85em', marginTop: '4px' }}>{evt.message}</div>
                                    <div style={{ fontSize: '0.75em', color: 'var(--text-muted)', marginTop: '2px' }}>
                                        Source: {evt.service} • Host: {evt.host}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state"><div className="icon">✅</div><p>No threats detected — all clear</p></div>
                    )}
                </div>

                <div className="card">
                    <div className="card-header"><span className="card-title">🔒 Security Rules</span></div>
                    {[
                        { rule: 'Rate Limiting', desc: 'Block IPs exceeding 1000 req/min', status: 'active', severity: 'medium' },
                        { rule: 'Failed Auth Detection', desc: 'Alert on 5+ failed logins', status: 'active', severity: 'high' },
                        { rule: 'SQL Injection Guard', desc: 'Block suspicious query patterns', status: 'active', severity: 'critical' },
                        { rule: 'DDoS Protection', desc: 'Auto-scale under attack', status: 'active', severity: 'critical' },
                        { rule: 'Anomaly Detection', desc: 'ML-based traffic analysis', status: 'active', severity: 'medium' },
                        { rule: 'Geo-Blocking', desc: 'Block traffic from restricted regions', status: 'inactive', severity: 'low' }
                    ].map((rule, i) => (
                        <div key={i} style={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            padding: '12px', borderBottom: '1px solid var(--border)'
                        }}>
                            <div>
                                <div style={{ fontWeight: 600, fontSize: '0.9em' }}>{rule.rule}</div>
                                <div style={{ fontSize: '0.8em', color: 'var(--text-muted)' }}>{rule.desc}</div>
                            </div>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <span className={`badge ${rule.severity === 'critical' ? 'badge-danger' : rule.severity === 'high' ? 'badge-warning' : 'badge-info'}`}>
                                    {rule.severity}
                                </span>
                                <span className={`badge ${rule.status === 'active' ? 'badge-success' : 'badge-warning'}`}>
                                    {rule.status}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
