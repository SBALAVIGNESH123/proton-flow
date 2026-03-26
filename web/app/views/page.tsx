'use client';

import { useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface MaterializedView {
    name: string;
    query: string;
    status: string;
    rows: number;
    created: string;
}

export default function MaterializedViewsPage() {
    const [views, setViews] = useState<MaterializedView[]>([
        { name: 'error_rate_5m', query: "SELECT service, count() as errors FROM logs WHERE level='error' GROUP BY service", status: 'running', rows: 1250, created: '2h ago' },
        { name: 'p99_latency_by_service', query: "SELECT service, quantile(0.99)(duration_ms) as p99 FROM traces GROUP BY service", status: 'running', rows: 890, created: '1d ago' },
        { name: 'host_cpu_hourly', query: "SELECT host, avg(cpu_percent) as avg_cpu, max(cpu_percent) as max_cpu FROM infrastructure GROUP BY host", status: 'running', rows: 456, created: '3d ago' }
    ]);

    const [showCreate, setShowCreate] = useState(false);
    const [newView, setNewView] = useState({ name: '', query: '' });

    function createView() {
        setViews([...views, { name: newView.name, query: newView.query, status: 'running', rows: 0, created: 'Just now' }]);
        setShowCreate(false);
        setNewView({ name: '', query: '' });
    }

    function deleteView(name: string) {
        setViews(views.filter(v => v.name !== name));
    }

    return (
        <div className="fade-in">
            <div className="page-header">
                <h2>📐 Materialized Views</h2>
                <p>Pre-computed streaming aggregations for instant query performance</p>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-label">Total Views</div>
                    <div className="stat-value" style={{ color: 'var(--accent)' }}>{views.length}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Running</div>
                    <div className="stat-value" style={{ color: 'var(--success)' }}>{views.filter(v => v.status === 'running').length}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Total Materialized Rows</div>
                    <div className="stat-value">{views.reduce((a, v) => a + v.rows, 0).toLocaleString()}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Query Speedup</div>
                    <div className="stat-value" style={{ color: 'var(--success)' }}>~100x</div>
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
                <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ Create View</button>
            </div>

            <div className="card">
                <div className="card-header"><span className="card-title">Materialized Views</span></div>
                {views.map((view, i) => (
                    <div key={i} style={{ padding: '20px', borderBottom: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                            <div>
                                <span style={{ fontWeight: 700, fontSize: '1em', color: 'var(--accent)' }}>{view.name}</span>
                                <span className={`badge ${view.status === 'running' ? 'badge-success' : 'badge-warning'}`} style={{ marginLeft: '8px' }}>{view.status}</span>
                            </div>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.8em', color: 'var(--text-muted)' }}>Created {view.created} • {view.rows.toLocaleString()} rows</span>
                                <button onClick={() => deleteView(view.name)} style={{ background: 'none', border: '1px solid var(--danger)', borderRadius: '6px', padding: '4px 10px', color: 'var(--danger)', cursor: 'pointer', fontSize: '0.8em' }}>Drop</button>
                            </div>
                        </div>
                        <div style={{
                            fontFamily: 'monospace', fontSize: '0.85em', padding: '12px',
                            background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)',
                            color: 'var(--text-secondary)', border: '1px solid var(--border)'
                        }}>
                            {view.query}
                        </div>
                    </div>
                ))}
            </div>

            {showCreate && (
                <div className="modal-overlay" onClick={() => setShowCreate(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <h3>Create Materialized View</h3>
                        <input placeholder="View name (e.g. error_rate_hourly)" value={newView.name} onChange={(e) => setNewView({ ...newView, name: e.target.value })} />
                        <textarea
                            placeholder="SELECT query..."
                            value={newView.query}
                            onChange={(e) => setNewView({ ...newView, query: e.target.value })}
                            rows={4}
                            style={{ fontFamily: 'monospace', fontSize: '0.9em', resize: 'vertical' }}
                        />
                        <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                            <button className="btn btn-primary" onClick={createView} style={{ flex: 1 }}>Create</button>
                            <button className="btn" onClick={() => setShowCreate(false)} style={{ flex: 1 }}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
