import './globals.css';

export const metadata = {
    title: 'ProtonFlow — Real-Time Streaming Analytics',
    description: 'All-in-one streaming analytics & observability platform powered by Proton.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body>
                <div className="app-layout">
                    <aside className="sidebar">
                        <div className="sidebar-brand">
                            <div className="logo-icon">⚡</div>
                            <h1>ProtonFlow</h1>
                        </div>
                        <nav className="sidebar-nav">
                            <div style={{ fontSize: '0.65em', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', padding: '12px 16px 4px', fontWeight: 600 }}>Overview</div>
                            <a href="/" className="nav-link"><span className="icon">📊</span> Dashboard</a>
                            <a href="/query" className="nav-link"><span className="icon">⚡</span> SQL Editor</a>

                            <div style={{ fontSize: '0.65em', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', padding: '16px 16px 4px', fontWeight: 600 }}>Observability</div>
                            <a href="/logs" className="nav-link"><span className="icon">📋</span> Logs</a>
                            <a href="/metrics" className="nav-link"><span className="icon">📈</span> Metrics</a>
                            <a href="/traces" className="nav-link"><span className="icon">🔍</span> APM Traces</a>
                            <a href="/infrastructure" className="nav-link"><span className="icon">🖥️</span> Infrastructure</a>
                            <a href="/network" className="nav-link"><span className="icon">🌐</span> Network</a>
                            <a href="/servicemap" className="nav-link"><span className="icon">🗺️</span> Service Map</a>

                            <div style={{ fontSize: '0.65em', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', padding: '16px 16px 4px', fontWeight: 600 }}>Testing & Security</div>
                            <a href="/synthetic" className="nav-link"><span className="icon">🧪</span> Synthetic</a>
                            <a href="/security" className="nav-link"><span className="icon">🛡️</span> Security</a>
                            <a href="/rum" className="nav-link"><span className="icon">👤</span> RUM</a>
                            <a href="/cicd" className="nav-link"><span className="icon">🔄</span> CI/CD</a>

                            <div style={{ fontSize: '0.65em', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', padding: '16px 16px 4px', fontWeight: 600 }}>Platform</div>
                            <a href="/connectors" className="nav-link"><span className="icon">🔌</span> Connectors</a>
                            <a href="/views" className="nav-link"><span className="icon">📐</span> Mat. Views</a>
                            <a href="/alerts" className="nav-link"><span className="icon">🔔</span> Alerts</a>
                            <a href="/notifications" className="nav-link"><span className="icon">📣</span> Notifications</a>
                            <a href="/settings" className="nav-link"><span className="icon">⚙️</span> Settings</a>
                        </nav>
                        <div className="sidebar-footer">
                            <a href="/login" style={{ textDecoration: 'none', color: 'var(--text-muted)', fontSize: '0.85em', display: 'block', padding: '8px 16px' }}>🔑 Login</a>
                            <div className="status-bar">
                                <span className="live-dot"></span>
                                Proton Connected
                            </div>
                        </div>
                    </aside>
                    <main className="main-content">
                        {children}
                    </main>
                </div>
            </body>
        </html>
    );
}
