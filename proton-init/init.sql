-- ProtonFlow Bootstrap: Create ALL streams for full observability platform

-- ═══════════════════════════════════════════
-- LOGS
-- ═══════════════════════════════════════════
CREATE STREAM IF NOT EXISTS logs (
    timestamp DateTime64(3) DEFAULT now64(3),
    level String DEFAULT 'info',
    service String DEFAULT 'unknown',
    host String DEFAULT 'localhost',
    message String,
    trace_id String DEFAULT '',
    span_id String DEFAULT '',
    metadata String DEFAULT '{}'
)
ENGINE = Stream(1, 1, rand())
SETTINGS event_time_column = 'timestamp';

-- ═══════════════════════════════════════════
-- METRICS
-- ═══════════════════════════════════════════
CREATE STREAM IF NOT EXISTS metrics (
    timestamp DateTime64(3) DEFAULT now64(3),
    host String DEFAULT 'localhost',
    service String DEFAULT 'system',
    metric_name String,
    metric_value Float64,
    metric_type String DEFAULT 'gauge',
    tags String DEFAULT '{}'
)
ENGINE = Stream(1, 1, rand())
SETTINGS event_time_column = 'timestamp';

-- ═══════════════════════════════════════════
-- APM TRACES (Distributed Tracing)
-- ═══════════════════════════════════════════
CREATE STREAM IF NOT EXISTS traces (
    timestamp DateTime64(3) DEFAULT now64(3),
    trace_id String,
    span_id String,
    parent_span_id String DEFAULT '',
    service String,
    operation String,
    duration_ms Float64,
    status_code Int32 DEFAULT 200,
    error Bool DEFAULT false,
    tags String DEFAULT '{}'
)
ENGINE = Stream(1, 1, rand())
SETTINGS event_time_column = 'timestamp';

-- ═══════════════════════════════════════════
-- INFRASTRUCTURE (Host/Container Monitoring)
-- ═══════════════════════════════════════════
CREATE STREAM IF NOT EXISTS infrastructure (
    timestamp DateTime64(3) DEFAULT now64(3),
    host String,
    container_id String DEFAULT '',
    container_name String DEFAULT '',
    cpu_percent Float64 DEFAULT 0,
    memory_percent Float64 DEFAULT 0,
    memory_used_mb Float64 DEFAULT 0,
    disk_percent Float64 DEFAULT 0,
    network_rx_bytes Float64 DEFAULT 0,
    network_tx_bytes Float64 DEFAULT 0,
    status String DEFAULT 'running'
)
ENGINE = Stream(1, 1, rand())
SETTINGS event_time_column = 'timestamp';

-- ═══════════════════════════════════════════
-- ALERTS
-- ═══════════════════════════════════════════
CREATE STREAM IF NOT EXISTS alert_events (
    timestamp DateTime64(3) DEFAULT now64(3),
    rule_name String,
    severity String DEFAULT 'warning',
    metric_name String DEFAULT '',
    threshold Float64 DEFAULT 0,
    actual_value Float64 DEFAULT 0,
    message String DEFAULT '',
    acknowledged Bool DEFAULT false
)
ENGINE = Stream(1, 1, rand())
SETTINGS event_time_column = 'timestamp';
