'use client';

import { useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface Connector {
    id: string;
    name: string;
    type: string;
    status: string;
    config: Record<string, string>;
}

export default function ConnectorsPage() {
    const [connectors, setConnectors] = useState<Connector[]>([
        { id: '1', name: 'Production Kafka', type: 'kafka', status: 'active', config: { brokers: 'kafka:9092', topic: 'app-logs', group: 'protonflow' } },
        { id: '2', name: 'Redpanda Metrics', type: 'redpanda', status: 'active', config: { brokers: 'redpanda:9092', topic: 'system-metrics', group: 'metrics-consumer' } },
        { id: '3', name: 'S3 Archive', type: 's3', status: 'paused', config: { bucket: 'protonflow-archive', region: 'us-east-1', prefix: 'logs/' } }
    ]);

    const [showModal, setShowModal] = useState(false);
    const [newConnector, setNewConnector] = useState({ name: '', type: 'kafka', brokers: '', topic: '' });

    const connectorTypes = [
        { type: 'kafka', icon: '📨', label: 'Apache Kafka', desc: 'Stream from Kafka topics' },
        { type: 'redpanda', icon: '🐼', label: 'Redpanda', desc: 'Redpanda-compatible streaming' },
        { type: 's3', icon: '📦', label: 'Amazon S3', desc: 'Archive to S3 buckets' },
        { type: 'postgresql', icon: '🐘', label: 'PostgreSQL', desc: 'CDC from PostgreSQL' },
        { type: 'mysql', icon: '🐬', label: 'MySQL', desc: 'CDC from MySQL' },
        { type: 'webhook', icon: '🔗', label: 'Webhook', desc: 'HTTP webhook ingestion' },
        { type: 'nats', icon: '📡', label: 'NATS', desc: 'NATS JetStream' },
        { type: 'pulsar', icon: '💫', label: 'Apache Pulsar', desc: 'Pulsar topic streaming' }
    ];

    function addConnector() {
        const connector: Connector = {
            id: Date.now().toString(),
            name: newConnector.name,
            type: newConnector.type,
            status: 'active',
            config: { brokers: newConnector.brokers, topic: newConnector.topic }
        };
        setConnectors([...connectors, connector]);
        setShowModal(false);
        setNewConnector({ name: '', type: 'kafka', brokers: '', topic: '' });
    }

    function toggleConnector(id: string) {
        setConnectors(connectors.map(c => c.id === id ? { ...c, status: c.status === 'active' ? 'paused' : 'active' } : c));
    }

    function deleteConnector(id: string) {
        setConnectors(connectors.filter(c => c.id !== id));
    }

    return (
        <div className="fade-in">
            <div className="page-header">
                <h2>🔌 Connectors</h2>
                <p>Manage data source integrations — Kafka, Redpanda, S3, databases, and more</p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div className="status-bar"><span className="live-dot"></span> {connectors.filter(c => c.status === 'active').length} active</div>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Add Connector</button>
            </div>

            <div className="card" style={{ marginBottom: '20px' }}>
                <div className="card-header"><span className="card-title">Active Connectors</span></div>
                {connectors.length > 0 ? connectors.map((conn, i) => (
                    <div key={i} style={{
                        display: 'flex', alignItems: 'center', gap: '16px', padding: '16px',
                        borderBottom: '1px solid var(--border)'
                    }}>
                        <div style={{ fontSize: '1.5em' }}>
                            {connectorTypes.find(t => t.type === conn.type)?.icon || '🔌'}
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700 }}>{conn.name}</div>
                            <div style={{ fontSize: '0.8em', color: 'var(--text-muted)' }}>
                                {connectorTypes.find(t => t.type === conn.type)?.label} • {Object.entries(conn.config).map(([k, v]) => `${k}: ${v}`).join(' • ')}
                            </div>
                        </div>
                        <span className={`badge ${conn.status === 'active' ? 'badge-success' : 'badge-warning'}`}>{conn.status}</span>
                        <button onClick={() => toggleConnector(conn.id)} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: '6px', padding: '6px 12px', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.8em' }}>
                            {conn.status === 'active' ? '⏸ Pause' : '▶ Resume'}
                        </button>
                        <button onClick={() => deleteConnector(conn.id)} style={{ background: 'none', border: '1px solid var(--danger)', borderRadius: '6px', padding: '6px 12px', color: 'var(--danger)', cursor: 'pointer', fontSize: '0.8em' }}>
                            🗑
                        </button>
                    </div>
                )) : (
                    <div className="empty-state"><div className="icon">🔌</div><p>No connectors configured</p></div>
                )}
            </div>

            <div className="card">
                <div className="card-header"><span className="card-title">Available Integrations</span></div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px', padding: '16px' }}>
                    {connectorTypes.map((ct, i) => (
                        <div key={i} onClick={() => { setNewConnector({ ...newConnector, type: ct.type }); setShowModal(true); }} style={{
                            padding: '16px', background: 'var(--bg-input)', border: '1px solid var(--border)',
                            borderRadius: 'var(--radius-sm)', cursor: 'pointer', transition: 'var(--transition)',
                            textAlign: 'center'
                        }}>
                            <div style={{ fontSize: '2em', marginBottom: '8px' }}>{ct.icon}</div>
                            <div style={{ fontWeight: 600, fontSize: '0.9em' }}>{ct.label}</div>
                            <div style={{ fontSize: '0.75em', color: 'var(--text-muted)', marginTop: '4px' }}>{ct.desc}</div>
                        </div>
                    ))}
                </div>
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <h3>Add {connectorTypes.find(t => t.type === newConnector.type)?.label} Connector</h3>
                        <input placeholder="Connector name" value={newConnector.name} onChange={(e) => setNewConnector({ ...newConnector, name: e.target.value })} />
                        <select value={newConnector.type} onChange={(e) => setNewConnector({ ...newConnector, type: e.target.value })} style={{ padding: '10px', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text-primary)', width: '100%', marginBottom: '12px' }}>
                            {connectorTypes.map(ct => <option key={ct.type} value={ct.type}>{ct.label}</option>)}
                        </select>
                        <input placeholder="Brokers (e.g. kafka:9092)" value={newConnector.brokers} onChange={(e) => setNewConnector({ ...newConnector, brokers: e.target.value })} />
                        <input placeholder="Topic name" value={newConnector.topic} onChange={(e) => setNewConnector({ ...newConnector, topic: e.target.value })} />
                        <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                            <button className="btn btn-primary" onClick={addConnector} style={{ flex: 1 }}>Create</button>
                            <button className="btn" onClick={() => setShowModal(false)} style={{ flex: 1 }}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
