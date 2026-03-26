'use client';

import { useEffect, useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface HostInfo {
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

export default function InfrastructurePage() {
    const [hosts, setHosts] = useState<HostInfo[]>([]);
    const [loading, setLoading] = useState(true);

    async function fetchData() {
        try {
            const res = await fetch(`${API}/api/query/infrastructure`);
            const data = await res.json();
            setHosts(Array.isArray(data.data) ? data.data.filter((d: any) => typeof d === 'object') : []);
        } catch (err) {
            console.error('Infrastructure fetch error:', err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, []);

    const cpuColor = (val: number) => val > 80 ? 'var(--danger)' : val > 60 ? 'var(--warning)' : 'var(--success)';
    const memColor = (val: number) => val > 85 ? 'var(--danger)' : val > 70 ? 'var(--warning)' : 'var(--success)';

    return (
        <div className="fade-in">
            <div className="page-header">
                <h2>🖥️ Infrastructure</h2>
                <p>Host and container monitoring — CPU, memory, disk, network</p>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-label">Total Hosts</div>
                    <div className="stat-value">{new Set(hosts.map(h => h.host)).size}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Containers</div>
                    <div className="stat-value">{hosts.filter(h => h.container_name).length}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Avg CPU</div>
                    <div className="stat-value" style={{ color: cpuColor(hosts.reduce((a, h) => a + (typeof h.avg_cpu === 'number' ? h.avg_cpu : 0), 0) / Math.max(hosts.length, 1)) }}>
                        {hosts.length > 0 ? (hosts.reduce((a, h) => a + (typeof h.avg_cpu === 'number' ? h.avg_cpu : 0), 0) / hosts.length).toFixed(1) : '0'}%
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Avg Memory</div>
                    <div className="stat-value" style={{ color: memColor(hosts.reduce((a, h) => a + (typeof h.avg_memory === 'number' ? h.avg_memory : 0), 0) / Math.max(hosts.length, 1)) }}>
                        {hosts.length > 0 ? (hosts.reduce((a, h) => a + (typeof h.avg_memory === 'number' ? h.avg_memory : 0), 0) / hosts.length).toFixed(1) : '0'}%
                    </div>
                </div>
            </div>

            <div className="card">
                <div className="card-header">
                    <span className="card-title">Host Map</span>
                    <div className="status-bar">
                        <span className="live-dot"></span>
                        Live
                    </div>
                </div>
                {hosts.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                        {hosts.map((host, i) => (
                            <div key={i} style={{
                                background: 'var(--bg-input)',
                                border: '1px solid var(--border)',
                                borderRadius: 'var(--radius-sm)',
                                padding: '20px',
                                transition: 'var(--transition)'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: '1em' }}>🖥️ {host.host}</div>
                                        {host.container_name && <div style={{ fontSize: '0.8em', color: 'var(--text-muted)' }}>📦 {host.container_name}</div>}
                                    </div>
                                    <span className={`badge ${host.status === 'running' ? 'badge-success' : 'badge-danger'}`}>
                                        {host.status}
                                    </span>
                                </div>

                                {/* CPU Bar */}
                                <div style={{ marginBottom: '12px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8em', marginBottom: '4px' }}>
                                        <span style={{ color: 'var(--text-secondary)' }}>CPU</span>
                                        <span style={{ color: cpuColor(typeof host.avg_cpu === 'number' ? host.avg_cpu : 0), fontWeight: 600 }}>
                                            {typeof host.avg_cpu === 'number' ? host.avg_cpu.toFixed(1) : host.avg_cpu}%
                                        </span>
                                    </div>
                                    <div style={{ height: '6px', background: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
                                        <div style={{
                                            width: `${Math.min(typeof host.avg_cpu === 'number' ? host.avg_cpu : 0, 100)}%`,
                                            height: '100%',
                                            background: cpuColor(typeof host.avg_cpu === 'number' ? host.avg_cpu : 0),
                                            borderRadius: '3px',
                                            transition: 'width 0.5s ease'
                                        }} />
                                    </div>
                                </div>

                                {/* Memory Bar */}
                                <div style={{ marginBottom: '12px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8em', marginBottom: '4px' }}>
                                        <span style={{ color: 'var(--text-secondary)' }}>Memory</span>
                                        <span style={{ color: memColor(typeof host.avg_memory === 'number' ? host.avg_memory : 0), fontWeight: 600 }}>
                                            {typeof host.avg_memory === 'number' ? host.avg_memory.toFixed(1) : host.avg_memory}%
                                        </span>
                                    </div>
                                    <div style={{ height: '6px', background: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
                                        <div style={{
                                            width: `${Math.min(typeof host.avg_memory === 'number' ? host.avg_memory : 0, 100)}%`,
                                            height: '100%',
                                            background: memColor(typeof host.avg_memory === 'number' ? host.avg_memory : 0),
                                            borderRadius: '3px',
                                            transition: 'width 0.5s ease'
                                        }} />
                                    </div>
                                </div>

                                {/* Disk Bar */}
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8em', marginBottom: '4px' }}>
                                        <span style={{ color: 'var(--text-secondary)' }}>Disk</span>
                                        <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                                            {typeof host.avg_disk === 'number' ? host.avg_disk.toFixed(1) : host.avg_disk}%
                                        </span>
                                    </div>
                                    <div style={{ height: '6px', background: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
                                        <div style={{
                                            width: `${Math.min(typeof host.avg_disk === 'number' ? host.avg_disk : 0, 100)}%`,
                                            height: '100%',
                                            background: 'var(--info)',
                                            borderRadius: '3px',
                                            transition: 'width 0.5s ease'
                                        }} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">
                        <div className="icon">🖥️</div>
                        <p>No infrastructure data yet. Ingest via POST /api/ingest/infrastructure</p>
                    </div>
                )}
            </div>
        </div>
    );
}
