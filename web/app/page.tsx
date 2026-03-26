'use client';

import { useEffect, useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface MetricSummary {
    metric_name: string;
    avg_val: number;
    max_val: number;
    min_val: number;
    sample_count: number;
}

interface LogEntry {
    timestamp: string;
    level: string;
    service: string;
    message: string;
}

interface AlertEvent {
    timestamp: string;
    rule_name: string;
    severity: string;
    message: string;
}

export default function Dashboard() {
    const [health, setHealth] = useState<any>(null);
    const [metrics, setMetrics] = useState<MetricSummary[]>([]);
    const [recentLogs, setRecentLogs] = useState<LogEntry[]>([]);
    const [recentAlerts, setRecentAlerts] = useState<AlertEvent[]>([]);

    useEffect(() => {
        async function fetchData() {
            try {
                const [hRes, mRes, lRes, aRes] = await Promise.all([
                    fetch(`${API}/api/health`),
                    fetch(`${API}/api/query/metrics/summary`),
                    fetch(`${API}/api/query/logs?limit=5`),
                    fetch(`${API}/api/query/alerts/history?limit=5`)
                ]);
                setHealth(await hRes.json());
                const mData = await mRes.json();
                setMetrics(Array.isArray(mData.data) ? mData.data.filter((d: any) => typeof d === 'object') : []);
                const lData = await lRes.json();
                setRecentLogs(Array.isArray(lData.data) ? lData.data.filter((d: any) => typeof d === 'object') : []);
                const aData = await aRes.json();
                setRecentAlerts(Array.isArray(aData.data) ? aData.data.filter((d: any) => typeof d === 'object') : []);
            } catch (err) {
                console.error('Dashboard fetch error:', err);
            }
        }
        fetchData();
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, []);

    const levelBadge = (level: string) => {
        const map: Record<string, string> = { error: 'badge-danger', warn: 'badge-warning', info: 'badge-info', debug: 'badge-success' };
        return map[level] || 'badge-info';
    };

    return (
        <div className="fade-in">
            <div className="page-header">
                <h2>Dashboard</h2>
                <p>Real-time streaming analytics overview</p>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-label">Engine Status</div>
                    <div className="stat-value" style={{ color: health?.proton === 'connected' ? 'var(--success)' : 'var(--danger)' }}>
                        {health?.proton === 'connected' ? '● Online' : '○ Offline'}
                    </div>
                    <div className="stat-change positive">
                        Uptime: {health ? Math.floor(health.uptime) + 's' : '—'}
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Active Metrics</div>
                    <div className="stat-value">{metrics.length}</div>
                    <div className="stat-change positive">Last 5 minutes</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Recent Logs</div>
                    <div className="stat-value">{recentLogs.length}</div>
                    <div className="stat-change">Latest entries</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Alerts Fired</div>
                    <div className="stat-value" style={{ color: recentAlerts.length > 0 ? 'var(--warning)' : 'var(--success)' }}>
                        {recentAlerts.length}
                    </div>
                    <div className="stat-change">Recent events</div>
                </div>
            </div>

            <div className="grid-2">
                <div className="card">
                    <div className="card-header">
                        <span className="card-title">📈 Metric Summary</span>
                        <a href="/metrics" className="btn btn-ghost" style={{ padding: '6px 12px', fontSize: '0.8em' }}>View All →</a>
                    </div>
                    {metrics.length > 0 ? (
                        <div className="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Metric</th>
                                        <th>Avg</th>
                                        <th>Max</th>
                                        <th>Samples</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {metrics.map((m, i) => (
                                        <tr key={i}>
                                            <td style={{ fontWeight: 600 }}>{m.metric_name}</td>
                                            <td>{typeof m.avg_val === 'number' ? m.avg_val.toFixed(2) : m.avg_val}</td>
                                            <td>{typeof m.max_val === 'number' ? m.max_val.toFixed(2) : m.max_val}</td>
                                            <td>{m.sample_count}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="empty-state">
                            <div className="icon">📊</div>
                            <p>No metrics ingested yet</p>
                        </div>
                    )}
                </div>

                <div className="card">
                    <div className="card-header">
                        <span className="card-title">📋 Recent Logs</span>
                        <a href="/logs" className="btn btn-ghost" style={{ padding: '6px 12px', fontSize: '0.8em' }}>View All →</a>
                    </div>
                    {recentLogs.length > 0 ? (
                        <div className="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Level</th>
                                        <th>Service</th>
                                        <th>Message</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentLogs.map((log, i) => (
                                        <tr key={i}>
                                            <td><span className={`badge ${levelBadge(log.level)}`}>{log.level}</span></td>
                                            <td>{log.service}</td>
                                            <td style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{log.message}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="empty-state">
                            <div className="icon">📋</div>
                            <p>No logs ingested yet</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
