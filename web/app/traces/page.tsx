'use client';

import { useEffect, useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface TraceSummary {
    service: string;
    total_spans: number;
    avg_duration: number;
    max_duration: number;
    error_count: number;
    slow_count: number;
}

interface Span {
    timestamp: string;
    trace_id: string;
    span_id: string;
    parent_span_id: string;
    service: string;
    operation: string;
    duration_ms: number;
    status_code: number;
    error: boolean;
}

export default function TracesPage() {
    const [summary, setSummary] = useState<TraceSummary[]>([]);
    const [traces, setTraces] = useState<Span[]>([]);
    const [selectedTrace, setSelectedTrace] = useState<string | null>(null);
    const [traceSpans, setTraceSpans] = useState<Span[]>([]);
    const [serviceFilter, setServiceFilter] = useState('');
    const [errorsOnly, setErrorsOnly] = useState(false);

    async function fetchData() {
        try {
            const params = new URLSearchParams({ limit: '100' });
            if (serviceFilter) params.set('service', serviceFilter);
            if (errorsOnly) params.set('errors', 'true');

            const [sRes, tRes] = await Promise.all([
                fetch(`${API}/api/query/traces/summary`),
                fetch(`${API}/api/query/traces?${params}`)
            ]);
            const sData = await sRes.json();
            setSummary(Array.isArray(sData.data) ? sData.data.filter((d: any) => typeof d === 'object') : []);
            const tData = await tRes.json();
            setTraces(Array.isArray(tData.data) ? tData.data.filter((d: any) => typeof d === 'object') : []);
        } catch (err) {
            console.error('Traces fetch error:', err);
        }
    }

    async function loadTrace(traceId: string) {
        try {
            const res = await fetch(`${API}/api/query/traces/${traceId}`);
            const data = await res.json();
            setTraceSpans(Array.isArray(data.data) ? data.data.filter((d: any) => typeof d === 'object') : []);
            setSelectedTrace(traceId);
        } catch (err) {
            console.error('Trace detail error:', err);
        }
    }

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, [serviceFilter, errorsOnly]);

    const durationColor = (ms: number) => {
        if (ms > 2000) return 'var(--danger)';
        if (ms > 500) return 'var(--warning)';
        return 'var(--success)';
    };

    return (
        <div className="fade-in">
            <div className="page-header">
                <h2>🔍 APM Traces</h2>
                <p>Distributed tracing — track requests across your services</p>
            </div>

            <div className="stats-grid">
                {summary.map((s, i) => (
                    <div className="stat-card" key={i}>
                        <div className="stat-label">{s.service}</div>
                        <div className="stat-value" style={{ fontSize: '1.5em' }}>
                            {typeof s.avg_duration === 'number' ? s.avg_duration.toFixed(0) : s.avg_duration}ms
                        </div>
                        <div style={{ display: 'flex', gap: '12px', fontSize: '0.8em', marginTop: '4px' }}>
                            <span style={{ color: 'var(--text-secondary)' }}>{s.total_spans} spans</span>
                            {s.error_count > 0 && <span style={{ color: 'var(--danger)' }}>⚠ {s.error_count} errors</span>}
                            {s.slow_count > 0 && <span style={{ color: 'var(--warning)' }}>🐢 {s.slow_count} slow</span>}
                        </div>
                    </div>
                ))}
            </div>

            <div className="search-bar">
                <input
                    type="text"
                    placeholder="Filter by service..."
                    value={serviceFilter}
                    onChange={(e) => setServiceFilter(e.target.value)}
                    style={{ maxWidth: '300px' }}
                />
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                    <input type="checkbox" checked={errorsOnly} onChange={(e) => setErrorsOnly(e.target.checked)} />
                    Errors only
                </label>
                <div className="status-bar">
                    <span className="live-dot"></span>
                    Live
                </div>
            </div>

            <div className="grid-2">
                <div className="card">
                    <div className="card-header">
                        <span className="card-title">Recent Traces</span>
                    </div>
                    {traces.length > 0 ? (
                        <div className="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Trace ID</th>
                                        <th>Service</th>
                                        <th>Operation</th>
                                        <th>Duration</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {traces.map((t, i) => (
                                        <tr key={i} onClick={() => loadTrace(t.trace_id)} style={{ cursor: 'pointer' }}>
                                            <td style={{ fontFamily: 'monospace', fontSize: '0.8em', color: 'var(--accent)' }}>
                                                {t.trace_id?.slice(0, 12)}...
                                            </td>
                                            <td style={{ fontWeight: 600 }}>{t.service}</td>
                                            <td>{t.operation}</td>
                                            <td style={{ color: durationColor(t.duration_ms), fontWeight: 600 }}>
                                                {typeof t.duration_ms === 'number' ? t.duration_ms.toFixed(0) : t.duration_ms}ms
                                            </td>
                                            <td>
                                                {t.error ?
                                                    <span className="badge badge-danger">Error</span> :
                                                    <span className="badge badge-success">{t.status_code}</span>
                                                }
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="empty-state">
                            <div className="icon">🔍</div>
                            <p>No traces yet. Ingest via POST /api/ingest/traces</p>
                        </div>
                    )}
                </div>

                <div className="card">
                    <div className="card-header">
                        <span className="card-title">
                            {selectedTrace ? `Trace: ${selectedTrace.slice(0, 16)}...` : 'Trace Detail'}
                        </span>
                    </div>
                    {traceSpans.length > 0 ? (
                        <div>
                            {traceSpans.map((span, i) => {
                                const maxDuration = Math.max(...traceSpans.map(s => s.duration_ms), 1);
                                const widthPct = (span.duration_ms / maxDuration) * 100;
                                return (
                                    <div key={i} style={{
                                        padding: '10px 14px',
                                        borderLeft: `3px solid ${span.error ? 'var(--danger)' : 'var(--accent)'}`,
                                        marginBottom: '8px',
                                        marginLeft: span.parent_span_id ? '24px' : '0',
                                        background: 'var(--bg-input)',
                                        borderRadius: '0 var(--radius-sm) var(--radius-sm) 0'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                            <span style={{ fontWeight: 600, fontSize: '0.9em' }}>{span.service} → {span.operation}</span>
                                            <span style={{ color: durationColor(span.duration_ms), fontWeight: 600, fontSize: '0.85em' }}>
                                                {typeof span.duration_ms === 'number' ? span.duration_ms.toFixed(0) : span.duration_ms}ms
                                            </span>
                                        </div>
                                        <div style={{
                                            height: '4px',
                                            background: 'var(--border)',
                                            borderRadius: '2px',
                                            overflow: 'hidden'
                                        }}>
                                            <div style={{
                                                width: `${widthPct}%`,
                                                height: '100%',
                                                background: span.error ? 'var(--danger)' : 'var(--accent)',
                                                borderRadius: '2px',
                                                transition: 'width 0.3s ease'
                                            }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <div className="icon">👆</div>
                            <p>Click a trace to see its spans</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
