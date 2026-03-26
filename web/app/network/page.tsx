'use client';

import { useEffect, useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface NetworkData {
    host: string;
    container_name: string;
    avg_cpu: number;
    avg_memory: number;
    avg_disk: number;
    max_cpu: number;
    max_memory: number;
    status: string;
    samples: number;
}

export default function NetworkPage() {
    const [data, setData] = useState<NetworkData[]>([]);
    const [connections, setConnections] = useState<any[]>([]);

    async function fetchData() {
        try {
            const [infraRes, traceRes] = await Promise.all([
                fetch(`${API}/api/query/infrastructure`),
                fetch(`${API}/api/query/traces/summary`)
            ]);
            const infraData = await infraRes.json();
            setData(Array.isArray(infraData.data) ? infraData.data.filter((d: any) => typeof d === 'object') : []);
            const traceData = await traceRes.json();
            setConnections(Array.isArray(traceData.data) ? traceData.data.filter((d: any) => typeof d === 'object') : []);
        } catch (err) {
            console.error('Network fetch error:', err);
        }
    }

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, []);

    const totalRx = data.reduce((a, d) => a + (typeof d.avg_cpu === 'number' ? d.avg_cpu : 0), 0);
    const totalHosts = new Set(data.map(d => d.host)).size;

    return (
        <div className="fade-in">
            <div className="page-header">
                <h2>🌐 Network Monitoring</h2>
                <p>Network traffic, connections, and host communication patterns</p>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-label">Active Hosts</div>
                    <div className="stat-value" style={{ color: 'var(--accent)' }}>{totalHosts}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Active Connections</div>
                    <div className="stat-value" style={{ color: 'var(--success)' }}>{connections.length}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Network Services</div>
                    <div className="stat-value">{connections.length}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Avg Network Load</div>
                    <div className="stat-value" style={{ color: totalRx / Math.max(data.length, 1) > 60 ? 'var(--warning)' : 'var(--success)' }}>
                        {data.length > 0 ? (totalRx / data.length).toFixed(1) : '0'}%
                    </div>
                </div>
            </div>

            <div className="card" style={{ marginBottom: '20px' }}>
                <div className="card-header">
                    <span className="card-title">Network Flow Map</span>
                    <div className="status-bar"><span className="live-dot"></span> Live</div>
                </div>
                {connections.length > 0 ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', padding: '20px' }}>
                        {connections.map((conn: any, i: number) => (
                            <div key={i} style={{
                                background: 'var(--bg-input)',
                                border: '1px solid var(--border)',
                                borderRadius: 'var(--radius-sm)',
                                padding: '16px',
                                minWidth: '200px',
                                flex: '1'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <span style={{ fontWeight: 700 }}>🌐 {conn.service}</span>
                                    <span className={`badge ${conn.error_count > 0 ? 'badge-warning' : 'badge-success'}`}>
                                        {conn.error_count > 0 ? 'Issues' : 'Healthy'}
                                    </span>
                                </div>
                                <div style={{ fontSize: '0.8em', color: 'var(--text-secondary)' }}>
                                    <div>Spans: {conn.total_spans}</div>
                                    <div>Avg Latency: <span style={{ color: 'var(--accent)' }}>{typeof conn.avg_duration === 'number' ? conn.avg_duration.toFixed(0) : conn.avg_duration}ms</span></div>
                                    <div>Max Latency: {typeof conn.max_duration === 'number' ? conn.max_duration.toFixed(0) : conn.max_duration}ms</div>
                                    {conn.error_count > 0 && <div style={{ color: 'var(--danger)' }}>Errors: {conn.error_count}</div>}
                                </div>
                                <div style={{ height: '4px', background: 'var(--border)', borderRadius: '2px', marginTop: '8px', overflow: 'hidden' }}>
                                    <div style={{
                                        width: `${Math.min((typeof conn.avg_duration === 'number' ? conn.avg_duration : 0) / 20, 100)}%`,
                                        height: '100%',
                                        background: conn.error_count > 0 ? 'var(--warning)' : 'var(--accent)',
                                        transition: 'width 0.5s ease'
                                    }} />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-state"><div className="icon">🌐</div><p>No network data yet</p></div>
                )}
            </div>

            <div className="card">
                <div className="card-header"><span className="card-title">Host Network Table</span></div>
                {data.length > 0 ? (
                    <div className="table-container">
                        <table>
                            <thead><tr><th>Host</th><th>Container</th><th>CPU</th><th>Memory</th><th>Status</th><th>Samples</th></tr></thead>
                            <tbody>
                                {data.map((d, i) => (
                                    <tr key={i}>
                                        <td style={{ fontWeight: 600 }}>🖥️ {d.host}</td>
                                        <td>{d.container_name || '—'}</td>
                                        <td style={{ color: (typeof d.avg_cpu === 'number' ? d.avg_cpu : 0) > 80 ? 'var(--danger)' : 'var(--success)' }}>
                                            {typeof d.avg_cpu === 'number' ? d.avg_cpu.toFixed(1) : d.avg_cpu}%
                                        </td>
                                        <td>{typeof d.avg_memory === 'number' ? d.avg_memory.toFixed(1) : d.avg_memory}%</td>
                                        <td><span className={`badge ${d.status === 'running' ? 'badge-success' : 'badge-danger'}`}>{d.status}</span></td>
                                        <td>{d.samples}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="empty-state"><div className="icon">📡</div><p>No host data yet</p></div>
                )}
            </div>
        </div>
    );
}
