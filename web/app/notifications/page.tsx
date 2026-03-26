'use client';

import { useState } from 'react';

export default function NotificationsPage() {
    const [channels, setChannels] = useState([
        { id: '1', type: 'slack', name: 'Engineering Alerts', config: { webhook: 'https://hooks.slack.com/services/T.../B.../xxx' }, enabled: true },
        { id: '2', type: 'discord', name: 'DevOps Channel', config: { webhook: 'https://discord.com/api/webhooks/...' }, enabled: true },
        { id: '3', type: 'email', name: 'On-Call Team', config: { recipients: 'oncall@company.com' }, enabled: false },
        { id: '4', type: 'pagerduty', name: 'Critical Alerts', config: { routing_key: 'R0...' }, enabled: true }
    ]);

    const [showModal, setShowModal] = useState(false);
    const [newChannel, setNewChannel] = useState({ type: 'slack', name: '', webhook: '' });

    const channelTypes = [
        { type: 'slack', icon: '💬', label: 'Slack', desc: 'Send to Slack channels via webhook' },
        { type: 'discord', icon: '🎮', label: 'Discord', desc: 'Send to Discord channels' },
        { type: 'email', icon: '📧', label: 'Email', desc: 'Email notifications' },
        { type: 'pagerduty', icon: '🚨', label: 'PagerDuty', desc: 'Incident management' },
        { type: 'opsgenie', icon: '🔔', label: 'OpsGenie', desc: 'Alert management' },
        { type: 'teams', icon: '🏢', label: 'MS Teams', desc: 'Microsoft Teams webhook' },
        { type: 'telegram', icon: '✈️', label: 'Telegram', desc: 'Telegram bot notifications' },
        { type: 'webhook', icon: '🔗', label: 'Custom Webhook', desc: 'Any HTTP endpoint' }
    ];

    function addChannel() {
        setChannels([...channels, { id: Date.now().toString(), type: newChannel.type, name: newChannel.name, config: { webhook: newChannel.webhook }, enabled: true }]);
        setShowModal(false);
        setNewChannel({ type: 'slack', name: '', webhook: '' });
    }

    function toggleChannel(id: string) {
        setChannels(channels.map(c => c.id === id ? { ...c, enabled: !c.enabled } : c));
    }

    function testChannel(name: string) {
        alert(`🧪 Test notification sent to ${name}!`);
    }

    return (
        <div className="fade-in">
            <div className="page-header">
                <h2>📣 Notification Channels</h2>
                <p>Configure where alerts and notifications are delivered</p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div className="status-bar"><span className="live-dot"></span> {channels.filter(c => c.enabled).length} active channels</div>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Add Channel</button>
            </div>

            <div className="card" style={{ marginBottom: '20px' }}>
                <div className="card-header"><span className="card-title">Configured Channels</span></div>
                {channels.map((ch, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', borderBottom: '1px solid var(--border)', opacity: ch.enabled ? 1 : 0.5 }}>
                        <div style={{ fontSize: '1.5em' }}>{channelTypes.find(t => t.type === ch.type)?.icon}</div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700 }}>{ch.name}</div>
                            <div style={{ fontSize: '0.8em', color: 'var(--text-muted)' }}>{channelTypes.find(t => t.type === ch.type)?.label} • {Object.values(ch.config).join(' • ')}</div>
                        </div>
                        <span className={`badge ${ch.enabled ? 'badge-success' : 'badge-warning'}`}>{ch.enabled ? 'Active' : 'Disabled'}</span>
                        <button onClick={() => testChannel(ch.name)} style={{ background: 'none', border: '1px solid var(--accent)', borderRadius: '6px', padding: '6px 12px', color: 'var(--accent)', cursor: 'pointer', fontSize: '0.8em' }}>🧪 Test</button>
                        <button onClick={() => toggleChannel(ch.id)} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: '6px', padding: '6px 12px', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.8em' }}>
                            {ch.enabled ? '⏸ Disable' : '▶ Enable'}
                        </button>
                    </div>
                ))}
            </div>

            <div className="card">
                <div className="card-header"><span className="card-title">Available Integrations</span></div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px', padding: '16px' }}>
                    {channelTypes.map((ct, i) => (
                        <div key={i} onClick={() => { setNewChannel({ ...newChannel, type: ct.type }); setShowModal(true); }} style={{
                            padding: '16px', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', textAlign: 'center', transition: 'var(--transition)'
                        }}>
                            <div style={{ fontSize: '1.8em', marginBottom: '6px' }}>{ct.icon}</div>
                            <div style={{ fontWeight: 600, fontSize: '0.85em' }}>{ct.label}</div>
                        </div>
                    ))}
                </div>
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <h3>Add {channelTypes.find(t => t.type === newChannel.type)?.label} Channel</h3>
                        <input placeholder="Channel name" value={newChannel.name} onChange={(e) => setNewChannel({ ...newChannel, name: e.target.value })} />
                        <input placeholder="Webhook URL" value={newChannel.webhook} onChange={(e) => setNewChannel({ ...newChannel, webhook: e.target.value })} />
                        <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                            <button className="btn btn-primary" onClick={addChannel} style={{ flex: 1 }}>Add Channel</button>
                            <button className="btn" onClick={() => setShowModal(false)} style={{ flex: 1 }}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
