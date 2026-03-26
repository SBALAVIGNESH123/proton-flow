'use client';

import { useEffect, useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function RUMPage() {
    const [traces, setTraces] = useState<any[]>([]);

    async function fetchData() {
        try {
            const res = await fetch(`${API}/api/query/traces/summary`);
            const data = await res.json();
            setTraces(Array.isArray(data.data) ? data.data.filter((d: any) => typeof d === 'object') : []);
        } catch (err) {
            console.error('RUM fetch error:', err);
        }
    }

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, []);

    const avgLatency = traces.length > 0 ? traces.reduce((a, t) => a + (typeof t.avg_duration === 'number' ? t.avg_duration : 0), 0) / traces.length : 0;
    const totalSessions = traces.reduce((a, t) => a + (t.total_spans || 0), 0);
    const errorSessions = traces.reduce((a, t) => a + (t.error_count || 0), 0);

    const pages = [
        { path: '/dashboard', views: Math.floor(Math.random() * 500 + 200), avgLoad: (0.5 + Math.random() * 2).toFixed(1), bounceRate: (15 + Math.random() * 30).toFixed(1) },
        { path: '/products', views: Math.floor(Math.random() * 400 + 150), avgLoad: (0.8 + Math.random() * 3).toFixed(1), bounceRate: (20 + Math.random() * 25).toFixed(1) },
        { path: '/checkout', views: Math.floor(Math.random() * 200 + 50), avgLoad: (1 + Math.random() * 2).toFixed(1), bounceRate: (10 + Math.random() * 20).toFixed(1) },
        { path: '/api/users', views: Math.floor(Math.random() * 800 + 300), avgLoad: (0.2 + Math.random() * 1).toFixed(1), bounceRate: (5 + Math.random() * 15).toFixed(1) },
        { path: '/login', views: Math.floor(Math.random() * 300 + 100), avgLoad: (0.3 + Math.random() * 1.5).toFixed(1), bounceRate: (25 + Math.random() * 30).toFixed(1) },
        { path: '/settings', views: Math.floor(Math.random() * 100 + 30), avgLoad: (0.4 + Math.random() * 1).toFixed(1), bounceRate: (30 + Math.random() * 20).toFixed(1) }
    ];

    const browsers = [
        { name: 'Chrome', share: 64 },
        { name: 'Safari', share: 19 },
        { name: 'Firefox', share: 8 },
        { name: 'Edge', share: 6 },
        { name: 'Other', share: 3 }
    ];

    return (
        <div className="fade-in">
            <div className="page-header">
                <h2>👤 Real User Monitoring</h2>
                <p>User sessions, page performance, browser analytics, and core web vitals</p>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-label">Active Sessions</div>
                    <div className="stat-value" style={{ color: 'var(--accent)' }}>{totalSessions}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Avg Page Load</div>
                    <div className="stat-value" style={{ color: avgLatency > 500 ? 'var(--warning)' : 'var(--success)' }}>
                        {avgLatency.toFixed(0)}ms
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Error Sessions</div>
                    <div className="stat-value" style={{ color: errorSessions > 0 ? 'var(--danger)' : 'var(--success)' }}>{errorSessions}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Apdex Score</div>
                    <div className="stat-value" style={{ color: 'var(--success)' }}>
                        {(0.7 + Math.random() * 0.25).toFixed(2)}
                    </div>
                </div>
            </div>

            <div className="grid-2">
                <div className="card">
                    <div className="card-header">
                        <span className="card-title">📄 Page Performance</span>
                        <div className="status-bar"><span className="live-dot"></span> Live</div>
                    </div>
                    <div className="table-container">
                        <table>
                            <thead><tr><th>Page</th><th>Views</th><th>Avg Load</th><th>Bounce Rate</th></tr></thead>
                            <tbody>
                                {pages.map((p, i) => (
                                    <tr key={i}>
                                        <td style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--accent)' }}>{p.path}</td>
                                        <td>{p.views}</td>
                                        <td style={{ color: parseFloat(p.avgLoad) > 2 ? 'var(--warning)' : 'var(--success)' }}>{p.avgLoad}s</td>
                                        <td>{p.bounceRate}%</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="card">
                    <div className="card-header"><span className="card-title">🌐 Browser Distribution</span></div>
                    <div style={{ padding: '16px' }}>
                        {browsers.map((b, i) => (
                            <div key={i} style={{ marginBottom: '16px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.9em' }}>
                                    <span>{b.name}</span>
                                    <span style={{ fontWeight: 600 }}>{b.share}%</span>
                                </div>
                                <div style={{ height: '8px', background: 'var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
                                    <div style={{
                                        width: `${b.share}%`,
                                        height: '100%',
                                        background: ['#6366f1', '#3b82f6', '#f59e0b', '#06b6d4', '#8888a0'][i],
                                        borderRadius: '4px',
                                        transition: 'width 0.5s ease'
                                    }} />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="card-header" style={{ marginTop: '16px' }}><span className="card-title">⚡ Core Web Vitals</span></div>
                    <div style={{ padding: '16px' }}>
                        {[
                            { name: 'LCP (Largest Contentful Paint)', value: '1.2s', status: 'good', color: 'var(--success)' },
                            { name: 'FID (First Input Delay)', value: '45ms', status: 'good', color: 'var(--success)' },
                            { name: 'CLS (Cumulative Layout Shift)', value: '0.08', status: 'good', color: 'var(--success)' },
                            { name: 'TTFB (Time to First Byte)', value: '210ms', status: 'needs improvement', color: 'var(--warning)' }
                        ].map((vital, i) => (
                            <div key={i} style={{
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                padding: '10px 0', borderBottom: i < 3 ? '1px solid var(--border)' : 'none'
                            }}>
                                <span style={{ fontSize: '0.85em' }}>{vital.name}</span>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    <span style={{ fontWeight: 700, color: vital.color }}>{vital.value}</span>
                                    <span className={`badge ${vital.status === 'good' ? 'badge-success' : 'badge-warning'}`}>{vital.status}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
