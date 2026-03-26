import './globals.css';

export const metadata = {
    title: 'ProtonFlow — Real-Time Streaming Analytics',
    description: 'All-in-one streaming analytics platform powered by Proton. Logs, metrics, traces, infrastructure, and alerts in real-time.',
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
                            <a href="/" className="nav-link">
                                <span className="icon">📊</span> Dashboard
                            </a>
                            <a href="/logs" className="nav-link">
                                <span className="icon">📋</span> Logs
                            </a>
                            <a href="/metrics" className="nav-link">
                                <span className="icon">📈</span> Metrics
                            </a>
                            <a href="/traces" className="nav-link">
                                <span className="icon">🔍</span> APM Traces
                            </a>
                            <a href="/infrastructure" className="nav-link">
                                <span className="icon">🖥️</span> Infrastructure
                            </a>
                            <a href="/servicemap" className="nav-link">
                                <span className="icon">🗺️</span> Service Map
                            </a>
                            <a href="/alerts" className="nav-link">
                                <span className="icon">🔔</span> Alerts
                            </a>
                        </nav>
                        <div className="sidebar-footer">
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
