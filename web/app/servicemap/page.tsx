'use client';

import { useEffect, useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface ServiceNode {
    service: string;
    total_requests: number;
    avg_latency: number;
    errors: number;
    success_count: number;
}

export default function ServiceMapPage() {
    const [services, setServices] = useState<ServiceNode[]>([]);

    async function fetchData() {
        try {
            const res = await fetch(`${API}/api/query/servicemap`);
            const data = await res.json();
            setServices(Array.isArray(data.data) ? data.data.filter((d: any) => typeof d === 'object') : []);
        } catch (err) {
            console.error('Service map error:', err);
        }
    }

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 10000);
        return () => clearInterval(interval);
    }, []);

    const healthColor = (errors: number, total: number) => {
        if (total === 0) return 'var(--text-muted)';
        const errorRate = errors / total;
        if (errorRate > 0.1) return 'var(--danger)';
        if (errorRate > 0.05) return 'var(--warning)';
        return 'var(--success)';
    };

    const latencyColor = (ms: number) => {
        if (ms > 2000) return 'var(--danger)';
        if (ms > 500) return 'var(--warning)';
        return 'var(--success)';
    };

    const nodeColors = ['#6366f1', '#8b5cf6', '#a78bfa', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

    return (
        <div className="fade-in">
            <div className="page-header">
                <h2>🗺️ Service Map</h2>
                <p>Real-time service topology with latency and error rates</p>
            </div>

            <div className="card" style={{ minHeight: '400px', position: 'relative' }}>
                <div className="card-header">
                    <span className="card-title">Service Topology</span>
                    <div className="status-bar">
                        <span className="live-dot"></span>
                        Live
                    </div>
                </div>

                {services.length > 0 ? (
                    <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '24px',
                        justifyContent: 'center',
                        padding: '40px 20px',
                        position: 'relative'
                    }}>
                        {services.map((svc, i) => {
                            const errorRate = svc.total_requests > 0 ? (svc.errors / svc.total_requests * 100) : 0;
                            const color = nodeColors[i % nodeColors.length];
                            const size = Math.max(120, Math.min(200, 100 + svc.total_requests * 2));

                            return (
                                <div key={i} style={{
                                    width: `${size}px`,
                                    height: `${size}px`,
                                    borderRadius: '50%',
                                    background: `radial-gradient(circle at 30% 30%, ${color}40, ${color}10)`,
                                    border: `2px solid ${healthColor(svc.errors, svc.total_requests)}`,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 0.3s ease',
                                    cursor: 'pointer',
                                    boxShadow: `0 0 20px ${color}20`
                                }}>
                                    <div style={{ fontWeight: 700, fontSize: '0.9em', marginBottom: '4px' }}>{svc.service}</div>
                                    <div style={{ fontSize: '0.75em', color: latencyColor(typeof svc.avg_latency === 'number' ? svc.avg_latency : 0) }}>
                                        {typeof svc.avg_latency === 'number' ? svc.avg_latency.toFixed(0) : svc.avg_latency}ms avg
                                    </div>
                                    <div style={{ fontSize: '0.7em', color: 'var(--text-secondary)', marginTop: '2px' }}>
                                        {svc.total_requests} req
                                    </div>
                                    {svc.errors > 0 && (
                                        <div style={{ fontSize: '0.7em', color: 'var(--danger)', marginTop: '2px', fontWeight: 600 }}>
                                            ⚠ {errorRate.toFixed(1)}% errors
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="empty-state">
                        <div className="icon">🗺️</div>
                        <p>No service data. Send traces via POST /api/ingest/traces</p>
                    </div>
                )}
            </div>

            <div className="card" style={{ marginTop: '20px' }}>
                <div className="card-header">
                    <span className="card-title">Service Health Table</span>
                </div>
                {services.length > 0 ? (
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Service</th>
                                    <th>Requests</th>
                                    <th>Avg Latency</th>
                                    <th>Errors</th>
                                    <th>Error Rate</th>
                                    <th>Health</th>
                                </tr>
                            </thead>
                            <tbody>
                                {services.map((svc, i) => {
                                    const errorRate = svc.total_requests > 0 ? (svc.errors / svc.total_requests * 100) : 0;
                                    return (
                                        <tr key={i}>
                                            <td style={{ fontWeight: 700 }}>{svc.service}</td>
                                            <td>{svc.total_requests}</td>
                                            <td style={{ color: latencyColor(typeof svc.avg_latency === 'number' ? svc.avg_latency : 0), fontWeight: 600 }}>
                                                {typeof svc.avg_latency === 'number' ? svc.avg_latency.toFixed(0) : svc.avg_latency}ms
                                            </td>
                                            <td style={{ color: svc.errors > 0 ? 'var(--danger)' : 'var(--success)' }}>{svc.errors}</td>
                                            <td>{errorRate.toFixed(1)}%</td>
                                            <td>
                                                <span className={`badge ${errorRate > 10 ? 'badge-danger' : errorRate > 5 ? 'badge-warning' : 'badge-success'}`}>
                                                    {errorRate > 10 ? 'Critical' : errorRate > 5 ? 'Degraded' : 'Healthy'}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : null}
            </div>
        </div>
    );
}
