'use client';

import { useEffect, useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface Pipeline {
    service: string;
    total_spans: number;
    avg_duration: number;
    max_duration: number;
    error_count: number;
    slow_count: number;
}

export default function CICDPage() {
    const [pipelines, setPipelines] = useState<Pipeline[]>([]);

    async function fetchData() {
        try {
            const res = await fetch(`${API}/api/query/traces/summary`);
            const data = await res.json();
            setPipelines(Array.isArray(data.data) ? data.data.filter((d: any) => typeof d === 'object') : []);
        } catch (err) {
            console.error('CI/CD fetch error:', err);
        }
    }

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 10000);
        return () => clearInterval(interval);
    }, []);

    const stageColors = ['#6366f1', '#8b5cf6', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];
    const totalPipelines = pipelines.length;
    const failedPipelines = pipelines.filter(p => p.error_count > 0).length;
    const avgDuration = pipelines.length > 0 ? pipelines.reduce((a, p) => a + (typeof p.avg_duration === 'number' ? p.avg_duration : 0), 0) / pipelines.length : 0;

    return (
        <div className="fade-in">
            <div className="page-header">
                <h2>🔄 CI/CD Pipeline Visibility</h2>
                <p>Monitor build pipelines, deployment stages, and delivery performance</p>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-label">Total Pipelines</div>
                    <div className="stat-value" style={{ color: 'var(--accent)' }}>{totalPipelines}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Failed Pipelines</div>
                    <div className="stat-value" style={{ color: failedPipelines > 0 ? 'var(--danger)' : 'var(--success)' }}>{failedPipelines}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Success Rate</div>
                    <div className="stat-value" style={{ color: 'var(--success)' }}>
                        {totalPipelines > 0 ? ((1 - failedPipelines / totalPipelines) * 100).toFixed(1) : '100'}%
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Avg Duration</div>
                    <div className="stat-value">{avgDuration.toFixed(0)}ms</div>
                </div>
            </div>

            <div className="card" style={{ marginBottom: '20px' }}>
                <div className="card-header">
                    <span className="card-title">Pipeline Stages</span>
                    <div className="status-bar"><span className="live-dot"></span> Live</div>
                </div>
                {pipelines.length > 0 ? (
                    <div>
                        {pipelines.map((pipeline, i) => {
                            const errorRate = pipeline.total_spans > 0 ? pipeline.error_count / pipeline.total_spans : 0;
                            const color = stageColors[i % stageColors.length];
                            const maxDur = Math.max(...pipelines.map(p => typeof p.max_duration === 'number' ? p.max_duration : 0), 1);
                            const widthPct = ((typeof pipeline.avg_duration === 'number' ? pipeline.avg_duration : 0) / maxDur) * 100;

                            return (
                                <div key={i} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '16px',
                                    padding: '16px',
                                    borderBottom: '1px solid var(--border)'
                                }}>
                                    <div style={{ width: '160px', fontWeight: 600, fontSize: '0.9em' }}>
                                        <span style={{ color }}>{['🔨', '🧪', '📦', '🚀', '✅', '🔍', '📊'][i % 7]}</span> {pipeline.service}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ height: '24px', background: 'var(--border)', borderRadius: '4px', overflow: 'hidden', position: 'relative' }}>
                                            <div style={{
                                                width: `${widthPct}%`,
                                                height: '100%',
                                                background: errorRate > 0.1 ? 'var(--danger)' : `linear-gradient(90deg, ${color}, ${color}88)`,
                                                borderRadius: '4px',
                                                transition: 'width 0.5s ease',
                                                display: 'flex',
                                                alignItems: 'center',
                                                paddingLeft: '8px'
                                            }}>
                                                <span style={{ fontSize: '0.75em', color: 'white', fontWeight: 600 }}>
                                                    {typeof pipeline.avg_duration === 'number' ? pipeline.avg_duration.toFixed(0) : pipeline.avg_duration}ms
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ width: '100px', textAlign: 'right' }}>
                                        <span className={`badge ${errorRate > 0.1 ? 'badge-danger' : errorRate > 0 ? 'badge-warning' : 'badge-success'}`}>
                                            {errorRate > 0.1 ? 'Failed' : errorRate > 0 ? 'Warn' : 'Passed'}
                                        </span>
                                    </div>
                                    <div style={{ width: '80px', textAlign: 'right', fontSize: '0.8em', color: 'var(--text-muted)' }}>
                                        {pipeline.total_spans} runs
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="empty-state"><div className="icon">🔄</div><p>No pipeline data yet</p></div>
                )}
            </div>
        </div>
    );
}
