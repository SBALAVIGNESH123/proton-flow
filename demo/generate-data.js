const API = process.env.API_URL || 'http://localhost:4000';

const services = ['auth-service', 'api-gateway', 'payment-service', 'user-service', 'notification-service', 'order-service', 'inventory-service'];
const levels = ['info', 'info', 'info', 'warn', 'error', 'debug'];
const hosts = ['prod-1', 'prod-2', 'prod-3', 'staging-1'];
const containers = ['web-nginx', 'app-node', 'db-postgres', 'cache-redis', 'queue-kafka', 'worker-python'];
const operations = ['GET /api/users', 'POST /api/orders', 'GET /api/products', 'POST /api/auth/login', 'PUT /api/cart', 'DELETE /api/sessions', 'GET /api/inventory', 'POST /api/payments'];

const logMessages = {
    info: [
        'Request processed successfully',
        'User authentication completed',
        'Database connection established',
        'Cache hit for session lookup',
        'Webhook delivered successfully',
        'Background job completed',
        'Health check passed',
        'Config reloaded from remote',
        'Payment transaction verified',
        'Order fulfillment initiated'
    ],
    warn: [
        'Response time exceeded 500ms threshold',
        'Connection pool nearing capacity (85%)',
        'Retry attempt 2/3 for external API call',
        'Deprecated endpoint accessed: /api/v1/legacy',
        'Memory usage above 80%',
        'Slow database query detected (2.3s)',
        'Rate limiter threshold approaching'
    ],
    error: [
        'Failed to connect to Redis cluster',
        'Unhandled promise rejection in worker',
        'Rate limit exceeded for client 10.0.0.42',
        'SSL certificate expiring in 7 days',
        'Database query timeout after 30s',
        'Payment gateway returned 503',
        'Kafka consumer lag detected: 15000 messages'
    ],
    debug: [
        'Parsed request body: 1.2KB',
        'Cache miss, fetching from origin',
        'Goroutine pool size: 42',
        'GC pause: 1.2ms',
        'WebSocket connection upgraded'
    ]
};

function randomFrom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function randomId() {
    return Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 10);
}

// ═══ LOG GENERATION ═══
async function sendLogs() {
    const level = randomFrom(levels);
    const traceId = randomId();
    const msgs = logMessages[level] || logMessages.info;
    const batch = Array.from({ length: Math.floor(Math.random() * 3) + 1 }, () => ({
        level,
        service: randomFrom(services),
        host: randomFrom(hosts),
        message: randomFrom(msgs),
        trace_id: traceId,
        span_id: randomId(),
        metadata: { request_id: randomId() }
    }));

    try {
        await fetch(`${API}/api/ingest/logs`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(batch)
        });
        console.log(`📋 Sent ${batch.length} log(s) [${level}]`);
    } catch (err) {
        console.error('Log send failed:', err.message);
    }
}

// ═══ METRIC GENERATION ═══
async function sendMetrics() {
    const host = randomFrom(hosts);
    const metrics = [
        { metric_name: 'cpu_usage', metric_value: 30 + Math.random() * 60, host, metric_type: 'gauge' },
        { metric_name: 'memory_usage', metric_value: 40 + Math.random() * 50, host, metric_type: 'gauge' },
        { metric_name: 'disk_usage', metric_value: 20 + Math.random() * 40, host, metric_type: 'gauge' },
        { metric_name: 'request_rate', metric_value: Math.floor(100 + Math.random() * 900), host, metric_type: 'counter' },
        { metric_name: 'error_rate', metric_value: Math.random() * 5, host, metric_type: 'gauge' },
        { metric_name: 'p99_latency', metric_value: 50 + Math.random() * 500, host, metric_type: 'gauge' }
    ];

    try {
        await fetch(`${API}/api/ingest/metrics`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(metrics)
        });
        console.log(`📈 Sent ${metrics.length} metrics for ${host}`);
    } catch (err) {
        console.error('Metric send failed:', err.message);
    }
}

// ═══ TRACE GENERATION (APM) ═══
async function sendTraces() {
    const traceId = randomId();
    const service = randomFrom(services);
    const operation = randomFrom(operations);
    const hasError = Math.random() < 0.1;
    const parentSpanId = randomId();

    const spans = [
        {
            trace_id: traceId,
            span_id: parentSpanId,
            parent_span_id: '',
            service: 'api-gateway',
            operation: operation,
            duration_ms: 50 + Math.random() * 2000,
            status_code: hasError ? 500 : 200,
            error: hasError
        },
        {
            trace_id: traceId,
            span_id: randomId(),
            parent_span_id: parentSpanId,
            service: service,
            operation: 'process_request',
            duration_ms: 20 + Math.random() * 800,
            status_code: 200,
            error: false
        },
        {
            trace_id: traceId,
            span_id: randomId(),
            parent_span_id: parentSpanId,
            service: 'db-postgres',
            operation: 'SELECT query',
            duration_ms: 5 + Math.random() * 200,
            status_code: 200,
            error: false
        }
    ];

    if (Math.random() > 0.5) {
        spans.push({
            trace_id: traceId,
            span_id: randomId(),
            parent_span_id: parentSpanId,
            service: 'cache-redis',
            operation: 'GET cache_key',
            duration_ms: 1 + Math.random() * 10,
            status_code: 200,
            error: false
        });
    }

    try {
        await fetch(`${API}/api/ingest/traces`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(spans)
        });
        console.log(`🔍 Sent ${spans.length} spans for trace ${traceId.slice(0, 8)}... [${service}]`);
    } catch (err) {
        console.error('Trace send failed:', err.message);
    }
}

// ═══ INFRASTRUCTURE GENERATION ═══
async function sendInfrastructure() {
    const infra = hosts.flatMap(host =>
        containers.slice(0, Math.floor(Math.random() * 3) + 2).map(container => ({
            host,
            container_id: randomId(),
            container_name: container,
            cpu_percent: 10 + Math.random() * 80,
            memory_percent: 20 + Math.random() * 70,
            memory_used_mb: 100 + Math.random() * 3000,
            disk_percent: 15 + Math.random() * 50,
            network_rx_bytes: Math.floor(Math.random() * 10000000),
            network_tx_bytes: Math.floor(Math.random() * 5000000),
            status: Math.random() > 0.05 ? 'running' : 'stopped'
        }))
    );

    try {
        await fetch(`${API}/api/ingest/infrastructure`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(infra)
        });
        console.log(`🖥️  Sent ${infra.length} infrastructure data points`);
    } catch (err) {
        console.error('Infra send failed:', err.message);
    }
}

// ═══ ALERT RULES ═══
async function setupAlertRules() {
    const rules = [
        { name: 'High CPU Alert', metric_name: 'cpu_usage', operator: 'gt', threshold: 85, severity: 'critical' },
        { name: 'Memory Warning', metric_name: 'memory_usage', operator: 'gt', threshold: 80, severity: 'warning' },
        { name: 'Disk Space Low', metric_name: 'disk_usage', operator: 'gt', threshold: 50, severity: 'warning' },
        { name: 'High Error Rate', metric_name: 'error_rate', operator: 'gt', threshold: 3, severity: 'critical' },
        { name: 'Slow P99 Latency', metric_name: 'p99_latency', operator: 'gt', threshold: 400, severity: 'warning' }
    ];

    for (const rule of rules) {
        try {
            await fetch(`${API}/api/alerts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(rule)
            });
            console.log(`🔔 Created alert rule: ${rule.name}`);
        } catch (err) {
            console.error(`Rule creation failed: ${err.message}`);
        }
    }
}

// ═══ MAIN ═══
async function main() {
    console.log(`
    ╔══════════════════════════════════════════════════╗
    ║       ProtonFlow Demo Data Generator             ║
    ║       Full Datadog-Class Observability Data       ║
    ║       Sending to: ${API}                  ║
    ╚══════════════════════════════════════════════════╝
    `);

    console.log('Setting up alert rules...');
    await setupAlertRules();

    console.log('Starting full data generation (Ctrl+C to stop)...\n');

    setInterval(sendLogs, 2000);
    setInterval(sendMetrics, 3000);
    setInterval(sendTraces, 1500);
    setInterval(sendInfrastructure, 5000);
}

main();
