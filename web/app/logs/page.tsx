'use client';

import { useEffect, useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface LogEntry {
    timestamp: string;
    level: string;
    service: string;
    host: string;
    message: string;
    metadata: string;
}

export default function LogsPage() {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [search, setSearch] = useState('');
    const [levelFilter, setLevelFilter] = useState('');
    const [loading, setLoading] = useState(true);

    async function fetchLogs() {
        try {
            const params = new URLSearchParams({ limit: '200' });
            if (search) params.set('search', search);
            if (levelFilter) params.set('level', levelFilter);

            const res = await fetch(`${API}/api/query/logs?${params}`);
            const data = await res.json();
            setLogs(Array.isArray(data.data) ? data.data.filter((d: any) => typeof d === 'object') : []);
        } catch (err) {
            console.error('Log fetch error:', err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchLogs();
        const interval = setInterval(fetchLogs, 3000);
        return () => clearInterval(interval);
    }, [search, levelFilter]);

    const levelBadge = (level: string) => {
        const map: Record<string, string> = { error: 'badge-danger', warn: 'badge-warning', info: 'badge-info', debug: 'badge-success' };
        return map[level] || 'badge-info';
    };

    const levelColor = (level: string) => {
        const map: Record<string, string> = { error: 'log-error', warn: 'log-warn', info: 'log-info', debug: 'log-debug' };
        return map[level] || '';
    };

    return (
        <div className="fade-in">
            <div className="page-header">
                <h2>📋 Log Explorer</h2>
                <p>Real-time log stream with search and filtering</p>
            </div>

            <div className="search-bar">
                <input
                    type="text"
                    placeholder="Search logs..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{ maxWidth: '400px' }}
                />
                <select
                    value={levelFilter}
                    onChange={(e) => setLevelFilter(e.target.value)}
                    style={{ maxWidth: '150px' }}
                >
                    <option value="">All Levels</option>
                    <option value="error">Error</option>
                    <option value="warn">Warning</option>
                    <option value="info">Info</option>
                    <option value="debug">Debug</option>
                </select>
                <div className="status-bar">
                    <span className="live-dot"></span>
                    Live
                </div>
            </div>

            <div className="card">
                {loading ? (
                    <div className="empty-state"><p>Loading logs...</p></div>
                ) : logs.length > 0 ? (
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Timestamp</th>
                                    <th>Level</th>
                                    <th>Service</th>
                                    <th>Host</th>
                                    <th>Message</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.map((log, i) => (
                                    <tr key={i}>
                                        <td style={{ whiteSpace: 'nowrap', fontSize: '0.8em', color: 'var(--text-muted)' }}>
                                            {new Date(log.timestamp).toLocaleString()}
                                        </td>
                                        <td><span className={`badge ${levelBadge(log.level)}`}>{log.level}</span></td>
                                        <td style={{ fontWeight: 600 }}>{log.service}</td>
                                        <td style={{ color: 'var(--text-secondary)' }}>{log.host}</td>
                                        <td className={levelColor(log.level)} style={{ fontFamily: 'monospace', fontSize: '0.85em' }}>
                                            {log.message}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="empty-state">
                        <div className="icon">📋</div>
                        <p>No logs found. Start ingesting with POST /api/ingest/logs</p>
                    </div>
                )}
            </div>
        </div>
    );
}
