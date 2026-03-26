'use client';

import { useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function QueryEditorPage() {
    const [sql, setSql] = useState('SELECT * FROM table(logs) ORDER BY timestamp DESC LIMIT 10');
    const [results, setResults] = useState<any[]>([]);
    const [columns, setColumns] = useState<string[]>([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [executionTime, setExecutionTime] = useState(0);

    const savedQueries = [
        { name: 'Recent Logs', sql: "SELECT * FROM table(logs) ORDER BY timestamp DESC LIMIT 20" },
        { name: 'Error Logs', sql: "SELECT * FROM table(logs) WHERE level = 'error' ORDER BY timestamp DESC LIMIT 20" },
        { name: 'Metric Summary', sql: "SELECT metric_name, avg(metric_value) as avg_val, max(metric_value) as max_val, count() as samples FROM table(metrics) WHERE timestamp > now() - INTERVAL 5 MINUTE GROUP BY metric_name" },
        { name: 'Slow Traces', sql: "SELECT service, operation, duration_ms, status_code FROM table(traces) WHERE duration_ms > 500 ORDER BY duration_ms DESC LIMIT 20" },
        { name: 'Service Error Rate', sql: "SELECT service, count() as total, countIf(error = true) as errors, round(countIf(error = true) * 100.0 / count(), 2) as error_pct FROM table(traces) GROUP BY service ORDER BY error_pct DESC" },
        { name: 'Host CPU', sql: "SELECT host, avg(cpu_percent) as avg_cpu, max(cpu_percent) as max_cpu FROM table(infrastructure) WHERE timestamp > now() - INTERVAL 5 MINUTE GROUP BY host ORDER BY avg_cpu DESC" },
        { name: 'Alert History', sql: "SELECT * FROM table(alert_events) ORDER BY timestamp DESC LIMIT 20" },
        { name: 'Live Log Stream', sql: "SELECT timestamp, level, service, message FROM logs LIMIT 10" }
    ];

    async function runQuery() {
        setError('');
        setLoading(true);
        const start = Date.now();

        try {
            const res = await fetch(`${API}/api/query`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sql })
            });
            const data = await res.json();

            if (data.error) {
                setError(data.error);
                setResults([]);
                setColumns([]);
            } else {
                const rows = Array.isArray(data.data) ? data.data.filter((d: any) => typeof d === 'object') : [];
                setResults(rows);
                setColumns(rows.length > 0 ? Object.keys(rows[0]) : []);
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setExecutionTime(Date.now() - start);
            setLoading(false);
        }
    }

    return (
        <div className="fade-in">
            <div className="page-header">
                <h2>⚡ SQL Query Editor</h2>
                <p>Run streaming SQL queries directly against Proton</p>
            </div>

            <div className="grid-2" style={{ gridTemplateColumns: '250px 1fr' }}>
                <div className="card" style={{ height: 'fit-content' }}>
                    <div className="card-header">
                        <span className="card-title">Saved Queries</span>
                    </div>
                    {savedQueries.map((q, i) => (
                        <div key={i}
                            onClick={() => setSql(q.sql)}
                            style={{
                                padding: '10px 12px',
                                borderRadius: 'var(--radius-sm)',
                                cursor: 'pointer',
                                fontSize: '0.85em',
                                color: 'var(--text-secondary)',
                                transition: 'var(--transition)',
                                marginBottom: '4px',
                                border: '1px solid transparent'
                            }}
                            onMouseOver={(e) => { e.currentTarget.style.background = 'var(--bg-card-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                            onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                        >
                            ▸ {q.name}
                        </div>
                    ))}
                </div>

                <div>
                    <div className="card" style={{ marginBottom: '20px' }}>
                        <textarea
                            value={sql}
                            onChange={(e) => setSql(e.target.value)}
                            rows={5}
                            style={{
                                fontFamily: 'monospace',
                                fontSize: '0.9em',
                                resize: 'vertical',
                                background: 'var(--bg-primary)',
                                marginBottom: '12px'
                            }}
                            onKeyDown={(e) => { if (e.ctrlKey && e.key === 'Enter') runQuery(); }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <button className="btn btn-primary" onClick={runQuery} disabled={loading}>
                                {loading ? '⏳ Running...' : '▶ Run Query (Ctrl+Enter)'}
                            </button>
                            {executionTime > 0 && (
                                <span style={{ fontSize: '0.85em', color: 'var(--text-muted)' }}>
                                    ⏱ {executionTime}ms • {results.length} rows
                                </span>
                            )}
                        </div>
                    </div>

                    {error && (
                        <div className="card" style={{ border: '1px solid var(--danger)', marginBottom: '20px' }}>
                            <div style={{ color: 'var(--danger)', fontFamily: 'monospace', fontSize: '0.85em' }}>
                                ❌ {error}
                            </div>
                        </div>
                    )}

                    {results.length > 0 && (
                        <div className="card">
                            <div className="card-header">
                                <span className="card-title">Results ({results.length} rows)</span>
                            </div>
                            <div className="table-container" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                                <table>
                                    <thead>
                                        <tr>
                                            {columns.map((col, i) => <th key={i}>{col}</th>)}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {results.map((row, i) => (
                                            <tr key={i}>
                                                {columns.map((col, j) => (
                                                    <td key={j} style={{ fontFamily: 'monospace', fontSize: '0.85em' }}>
                                                        {typeof row[col] === 'object' ? JSON.stringify(row[col]) : String(row[col] ?? '')}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
