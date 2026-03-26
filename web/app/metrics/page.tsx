'use client';

import { useEffect, useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface MetricPoint {
    timestamp: string;
    metric_name: string;
    metric_value: number;
    host: string;
}

interface MetricSummary {
    metric_name: string;
    avg_val: number;
    max_val: number;
    min_val: number;
    sample_count: number;
}

export default function MetricsPage() {
    const [summary, setSummary] = useState<MetricSummary[]>([]);
    const [history, setHistory] = useState<MetricPoint[]>([]);
    const [loading, setLoading] = useState(true);

    async function fetchMetrics() {
        try {
            const [sRes, hRes] = await Promise.all([
                fetch(`${API}/api/query/metrics/summary`),
                fetch(`${API}/api/query/metrics?minutes=10`)
            ]);
            const sData = await sRes.json();
            setSummary(Array.isArray(sData.data) ? sData.data.filter((d: any) => typeof d === 'object') : []);
            const hData = await hRes.json();
            setHistory(Array.isArray(hData.data) ? hData.data.filter((d: any) => typeof d === 'object') : []);
        } catch (err) {
            console.error('Metrics fetch error:', err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchMetrics();
        const interval = setInterval(fetchMetrics, 5000);
        return () => clearInterval(interval);
    }, []);

    const metricColor = (name: string) => {
        if (name.includes('cpu')) return 'var(--accent)';
        if (name.includes('memory')) return 'var(--warning)';
        if (name.includes('disk')) return 'var(--danger)';
        return 'var(--info)';
    };

    const grouped = history.reduce<Record<string, MetricPoint[]>>((acc, pt) => {
        if (!acc[pt.metric_name]) acc[pt.metric_name] = [];
        acc[pt.metric_name].push(pt);
        return acc;
    }, {});

    return (
        <div className="fade-in">
            <div className="page-header">
                <h2>📈 Metrics Dashboard</h2>
                <p>Real-time system and application metrics</p>
            </div>

            <div className="stats-grid">
                {summary.map((m, i) => (
                    <div className="stat-card" key={i}>
                        <div className="stat-label">{m.metric_name}</div>
                        <div className="stat-value" style={{ color: metricColor(m.metric_name) }}>
                            {typeof m.avg_val === 'number' ? m.avg_val.toFixed(1) : m.avg_val}
                        </div>
                        <div style={{ display: 'flex', gap: '16px', fontSize: '0.8em', color: 'var(--text-secondary)' }}>
                            <span>Min: {typeof m.min_val === 'number' ? m.min_val.toFixed(1) : m.min_val}</span>
                            <span>Max: {typeof m.max_val === 'number' ? m.max_val.toFixed(1) : m.max_val}</span>
                            <span>Samples: {m.sample_count}</span>
                        </div>
                    </div>
                ))}
                {summary.length === 0 && !loading && (
                    <div className="stat-card">
                        <div className="empty-state">
                            <div className="icon">📈</div>
                            <p>No metrics yet</p>
                        </div>
                    </div>
                )}
            </div>

            <div className="card" style={{ marginBottom: '20px' }}>
                <div className="card-header">
                    <span className="card-title">📊 Metric History (Last 10 min)</span>
                    <div className="status-bar">
                        <span className="live-dot"></span>
                        Live
                    </div>
                </div>
                {Object.entries(grouped).length > 0 ? (
                    Object.entries(grouped).map(([name, points]) => (
                        <div key={name} style={{ marginBottom: '24px' }}>
                            <h4 style={{ color: metricColor(name), marginBottom: '8px' }}>{name}</h4>
                            <div style={{ display: 'flex', gap: '4px', alignItems: 'flex-end', height: '80px' }}>
                                {points.slice(-60).map((pt, i) => {
                                    const maxVal = Math.max(...points.map(p => p.metric_value), 1);
                                    const height = (pt.metric_value / maxVal) * 100;
                                    return (
                                        <div
                                            key={i}
                                            title={`${pt.metric_value.toFixed(2)} @ ${new Date(pt.timestamp).toLocaleTimeString()}`}
                                            style={{
                                                flex: 1,
                                                maxWidth: '8px',
                                                height: `${height}%`,
                                                background: metricColor(name),
                                                borderRadius: '2px 2px 0 0',
                                                opacity: 0.6 + (i / points.length) * 0.4,
                                                transition: 'var(--transition)'
                                            }}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="empty-state">
                        <div className="icon">📊</div>
                        <p>Ingest metrics via POST /api/ingest/metrics</p>
                    </div>
                )}
            </div>
        </div>
    );
}
