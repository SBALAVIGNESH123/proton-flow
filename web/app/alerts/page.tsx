'use client';

import { useEffect, useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface AlertRule {
    id: string;
    name: string;
    metric_name: string;
    operator: string;
    threshold: number;
    severity: string;
    webhook_url: string | null;
    enabled: boolean;
}

interface AlertEvent {
    timestamp: string;
    rule_name: string;
    severity: string;
    metric_name: string;
    threshold: number;
    actual_value: number;
    message: string;
}

export default function AlertsPage() {
    const [rules, setRules] = useState<AlertRule[]>([]);
    const [history, setHistory] = useState<AlertEvent[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ name: '', metric_name: '', operator: 'gt', threshold: '', severity: 'warning', webhook_url: '' });

    async function fetchData() {
        try {
            const [rRes, hRes] = await Promise.all([
                fetch(`${API}/api/alerts`),
                fetch(`${API}/api/query/alerts/history?limit=50`)
            ]);
            const rData = await rRes.json();
            setRules(rData.rules || []);
            const hData = await hRes.json();
            setHistory(Array.isArray(hData.data) ? hData.data.filter((d: any) => typeof d === 'object') : []);
        } catch (err) {
            console.error('Alerts fetch error:', err);
        }
    }

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 10000);
        return () => clearInterval(interval);
    }, []);

    async function createRule() {
        try {
            await fetch(`${API}/api/alerts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...form, threshold: parseFloat(form.threshold) })
            });
            setShowModal(false);
            setForm({ name: '', metric_name: '', operator: 'gt', threshold: '', severity: 'warning', webhook_url: '' });
            fetchData();
        } catch (err) {
            console.error('Create rule error:', err);
        }
    }

    async function deleteRule(id: string) {
        try {
            await fetch(`${API}/api/alerts/${id}`, { method: 'DELETE' });
            fetchData();
        } catch (err) {
            console.error('Delete rule error:', err);
        }
    }

    const severityBadge = (sev: string) => {
        const map: Record<string, string> = { critical: 'badge-danger', warning: 'badge-warning', info: 'badge-info' };
        return map[sev] || 'badge-warning';
    };

    const operatorLabel: Record<string, string> = { gt: '>', gte: '≥', lt: '<', lte: '≤', eq: '=' };

    return (
        <div className="fade-in">
            <div className="page-header">
                <h2>🔔 Alerts</h2>
                <p>Configure threshold-based alert rules and view alert history</p>
            </div>

            <div style={{ marginBottom: '24px' }}>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ New Alert Rule</button>
            </div>

            <div className="grid-2">
                <div className="card">
                    <div className="card-header">
                        <span className="card-title">Active Rules</span>
                        <span className="badge badge-info">{rules.length}</span>
                    </div>
                    {rules.length > 0 ? (
                        rules.map((rule) => (
                            <div key={rule.id} style={{
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                padding: '14px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
                                marginBottom: '8px', background: 'var(--bg-input)'
                            }}>
                                <div>
                                    <div style={{ fontWeight: 600, marginBottom: '4px' }}>{rule.name}</div>
                                    <div style={{ fontSize: '0.85em', color: 'var(--text-secondary)' }}>
                                        {rule.metric_name} {operatorLabel[rule.operator] || rule.operator} {rule.threshold}
                                    </div>
                                    <span className={`badge ${severityBadge(rule.severity)}`} style={{ marginTop: '4px' }}>{rule.severity}</span>
                                </div>
                                <button className="btn btn-danger" onClick={() => deleteRule(rule.id)} style={{ padding: '6px 12px', fontSize: '0.8em' }}>Delete</button>
                            </div>
                        ))
                    ) : (
                        <div className="empty-state">
                            <div className="icon">🔔</div>
                            <p>No alert rules configured</p>
                        </div>
                    )}
                </div>

                <div className="card">
                    <div className="card-header">
                        <span className="card-title">Alert History</span>
                        <div className="status-bar">
                            <span className="live-dot"></span>
                            Monitoring
                        </div>
                    </div>
                    {history.length > 0 ? (
                        <div className="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Time</th>
                                        <th>Severity</th>
                                        <th>Rule</th>
                                        <th>Value</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {history.map((evt, i) => (
                                        <tr key={i}>
                                            <td style={{ whiteSpace: 'nowrap', fontSize: '0.8em', color: 'var(--text-muted)' }}>
                                                {new Date(evt.timestamp).toLocaleString()}
                                            </td>
                                            <td><span className={`badge ${severityBadge(evt.severity)}`}>{evt.severity}</span></td>
                                            <td style={{ fontWeight: 600 }}>{evt.rule_name}</td>
                                            <td style={{ fontFamily: 'monospace' }}>
                                                {typeof evt.actual_value === 'number' ? evt.actual_value.toFixed(2) : evt.actual_value}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="empty-state">
                            <div className="icon">✅</div>
                            <p>No alerts fired yet — all clear!</p>
                        </div>
                    )}
                </div>
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <h3>Create Alert Rule</h3>
                        <div className="form-group">
                            <label>Rule Name</label>
                            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="High CPU Alert" />
                        </div>
                        <div className="form-group">
                            <label>Metric Name</label>
                            <input value={form.metric_name} onChange={(e) => setForm({ ...form, metric_name: e.target.value })} placeholder="cpu_usage" />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <div className="form-group">
                                <label>Operator</label>
                                <select value={form.operator} onChange={(e) => setForm({ ...form, operator: e.target.value })}>
                                    <option value="gt">Greater Than (&gt;)</option>
                                    <option value="gte">Greater or Equal (≥)</option>
                                    <option value="lt">Less Than (&lt;)</option>
                                    <option value="lte">Less or Equal (≤)</option>
                                    <option value="eq">Equal (=)</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Threshold</label>
                                <input type="number" value={form.threshold} onChange={(e) => setForm({ ...form, threshold: e.target.value })} placeholder="90" />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Severity</label>
                            <select value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value })}>
                                <option value="info">Info</option>
                                <option value="warning">Warning</option>
                                <option value="critical">Critical</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Webhook URL (Optional)</label>
                            <input value={form.webhook_url} onChange={(e) => setForm({ ...form, webhook_url: e.target.value })} placeholder="https://hooks.slack.com/..." />
                        </div>
                        <div className="modal-actions">
                            <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                            <button className="btn btn-primary" onClick={createRule}>Create Rule</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
