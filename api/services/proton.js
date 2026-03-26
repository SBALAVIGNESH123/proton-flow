const PROTON_HOST = process.env.PROTON_HOST || 'localhost';
const PROTON_PORT = process.env.PROTON_PORT || '3218';
const BASE_URL = `http://${PROTON_HOST}:${PROTON_PORT}`;

async function query(sql) {
    const res = await fetch(`${BASE_URL}/?query=${encodeURIComponent(sql)}`, {
        method: 'GET',
        headers: { 'Content-Type': 'text/plain' }
    });

    if (!res.ok) {
        const body = await res.text();
        throw new Error(`Proton query failed: ${res.status} — ${body}`);
    }

    const text = await res.text();
    if (!text.trim()) return [];

    return text.trim().split('\n').map(line => {
        try { return JSON.parse(line); }
        catch { return line; }
    });
}

async function execute(sql) {
    const res = await fetch(`${BASE_URL}/`, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: sql
    });

    if (!res.ok) {
        const body = await res.text();
        throw new Error(`Proton execute failed: ${res.status} — ${body}`);
    }
    return true;
}

async function insert(stream, columns, rows) {
    const colList = columns.join(', ');
    const values = rows.map(row =>
        `(${row.map(v => typeof v === 'string' ? `'${v.replace(/'/g, "\\'")}'` : v).join(', ')})`
    ).join(', ');

    const sql = `INSERT INTO ${stream} (${colList}) VALUES ${values}`;
    const res = await fetch(`${BASE_URL}/`, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: sql
    });

    if (!res.ok) {
        const body = await res.text();
        throw new Error(`Proton insert failed: ${res.status} — ${body}`);
    }
}

async function healthCheck() {
    try {
        const res = await fetch(`${BASE_URL}/`, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain' },
            body: 'SELECT 1'
        });
        return res.ok;
    } catch {
        return false;
    }
}

async function initializeStreams() {
    const streams = [
        {
            name: 'logs',
            sql: `CREATE STREAM IF NOT EXISTS logs (
                timestamp datetime64(3) DEFAULT now64(3),
                level string DEFAULT 'info',
                service string DEFAULT 'unknown',
                host string DEFAULT 'localhost',
                message string DEFAULT '',
                trace_id string DEFAULT '',
                span_id string DEFAULT '',
                metadata string DEFAULT '{}'
            )`
        },
        {
            name: 'metrics',
            sql: `CREATE STREAM IF NOT EXISTS metrics (
                timestamp datetime64(3) DEFAULT now64(3),
                host string DEFAULT 'localhost',
                service string DEFAULT 'system',
                metric_name string DEFAULT '',
                metric_value float64 DEFAULT 0,
                metric_type string DEFAULT 'gauge',
                tags string DEFAULT '{}'
            )`
        },
        {
            name: 'traces',
            sql: `CREATE STREAM IF NOT EXISTS traces (
                timestamp datetime64(3) DEFAULT now64(3),
                trace_id string DEFAULT '',
                span_id string DEFAULT '',
                parent_span_id string DEFAULT '',
                service string DEFAULT '',
                operation string DEFAULT '',
                duration_ms float64 DEFAULT 0,
                status_code int32 DEFAULT 200,
                error bool DEFAULT false,
                tags string DEFAULT '{}'
            )`
        },
        {
            name: 'infrastructure',
            sql: `CREATE STREAM IF NOT EXISTS infrastructure (
                timestamp datetime64(3) DEFAULT now64(3),
                host string DEFAULT '',
                container_id string DEFAULT '',
                container_name string DEFAULT '',
                cpu_percent float64 DEFAULT 0,
                memory_percent float64 DEFAULT 0,
                memory_used_mb float64 DEFAULT 0,
                disk_percent float64 DEFAULT 0,
                network_rx_bytes float64 DEFAULT 0,
                network_tx_bytes float64 DEFAULT 0,
                status string DEFAULT 'running'
            )`
        },
        {
            name: 'alert_events',
            sql: `CREATE STREAM IF NOT EXISTS alert_events (
                timestamp datetime64(3) DEFAULT now64(3),
                rule_name string DEFAULT '',
                severity string DEFAULT 'warning',
                metric_name string DEFAULT '',
                threshold float64 DEFAULT 0,
                actual_value float64 DEFAULT 0,
                message string DEFAULT '',
                acknowledged bool DEFAULT false
            )`
        }
    ];

    for (const stream of streams) {
        try {
            await execute(stream.sql);
            console.log(`  ✅ Created stream: ${stream.name}`);
        } catch (err) {
            console.error(`  ❌ Failed to create stream ${stream.name}: ${err.message}`);
        }
    }
}

module.exports = { query, execute, insert, healthCheck, initializeStreams };
