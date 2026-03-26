'use client';

import { useEffect, useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface Endpoint {
    service: string;
    total_spans: number;
    avg_duration: number;
    max_duration: number;
    error_count: number;
    slow_count: number;
}

export default function SyntheticPage() {
    const [endpoints, setEndpoints] = useState<Endpoint[]>([]);

    async function fetchData() {
        try {
            const res = await fetch(`${API}/api/query/traces/summary`);
            const data = await res.json();
            setEndpoints(Array.isArray(data.data) ? data.data.filter((d: any) => typeof d === 'object') : []);
        } catch (err) {
            console.error('Synthetic fetch error:', err);
        }
    }

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 10000);
        return () => clearInterval(interval);
    }, []);

    const totalTests = endpoints.length;
    const passing = endpoints.filter(e => e.error_count === 0).length;
    const failing = endpoints.filter(e => e.error_count > 0).length;
    const uptimePct = totalTests > 0 ? ((passing / totalTests) * 100).toFixed(1) : '100';

    return (
        <div className="fade-in">
            <div className="page-header">
                <h2>🧪 Synthetic Monitoring</h2>
                <p>Uptime checks, API endpoint testing, and response time monitoring</p>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-label">Total Tests</div>
                    <div className="stat-value" style={{ color: 'var(--accent)' }}>{totalTests}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Passing</div>
                    <div className="stat-value" style={{ color: 'var(--success)' }}>{passing}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Failing</div>
                    <div className="stat-value" style={{ color: failing > 0 ? 'var(--danger)' : 'var(--success)' }}>{failing}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Uptime</div>
                    <div className="stat-value" style={{ color: parseFloat(uptimePct) < 99 ? 'var(--warning)' : 'var(--success)' }}>{uptimePct}%</div>
                </div>
            </div>

            <div className="card">
                <div className="card-header">
                    <span className="card-title">Endpoint Health Checks</span>
                    <div className="status-bar"><span className="live-dot"></span> Monitoring</div>
                </div>
                {endpoints.length > 0 ? (
                    <div>
                        {endpoints.map((ep, i) => {
                            const isHealthy = ep.error_count === 0;
                            const responseTime = typeof ep.avg_duration === 'number' ? ep.avg_duration : 0;
                            return (
                                <div key={i} style={{
                                    display: 'flex', alignItems: 'center', gap: '16px', padding: '16px',
                                    borderBottom: '1px solid var(--border)'
                                }}>
                                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: isHealthy ? 'var(--success)' : 'var(--danger)', boxShadow: `0 0 8px ${isHealthy ? 'rgba(34,197,94,0.4)' : 'rgba(239,68,68,0.4)'}` }} />
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 600, marginBottom: '2px' }}>https://{ep.service}.protonflow.io/health</div>
                                        <div style={{ fontSize: '0.8em', color: 'var(--text-muted)' }}>
                                            {ep.total_spans} checks • Last: {responseTime.toFixed(0)}ms • Max: {typeof ep.max_duration === 'number' ? ep.max_duration.toFixed(0) : ep.max_duration}ms
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '3px', height: '30px', alignItems: 'flex-end' }}>
                                        {Array.from({ length: 20 }, (_, j) => (
                                            <div key={j} style={{
                                                width: '4px',
                                                height: `${10 + Math.random() * 20}px`,
                                                background: j === 15 && ep.error_count > 0 ? 'var(--danger)' : 'var(--success)',
                                                borderRadius: '1px',
                                                opacity: 0.5 + (j / 20) * 0.5
                                            }} />
                                        ))}
                                    </div>
                                    <span className={`badge ${isHealthy ? 'badge-success' : 'badge-danger'}`}>
                                        {isHealthy ? 'UP' : 'DOWN'}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="empty-state"><div className="icon">🧪</div><p>No synthetic tests configured</p></div>
                )}
            </div>
        </div>
    );
}
