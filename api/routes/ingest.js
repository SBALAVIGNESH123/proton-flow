const express = require('express');
const router = express.Router();
const { insert } = require('../services/proton');

router.post('/logs', async (req, res) => {
    try {
        const entries = Array.isArray(req.body) ? req.body : [req.body];
        const rows = entries.map(entry => [
            entry.timestamp || new Date().toISOString(),
            entry.level || 'info',
            entry.service || 'unknown',
            entry.host || 'localhost',
            entry.message || '',
            entry.trace_id || '',
            entry.span_id || '',
            JSON.stringify(entry.metadata || {})
        ]);

        await insert('logs',
            ['timestamp', 'level', 'service', 'host', 'message', 'trace_id', 'span_id', 'metadata'],
            rows
        );
        res.json({ status: 'ok', ingested: rows.length });
    } catch (err) {
        console.error('Log ingestion error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

router.post('/metrics', async (req, res) => {
    try {
        const entries = Array.isArray(req.body) ? req.body : [req.body];
        const rows = entries.map(entry => [
            entry.timestamp || new Date().toISOString(),
            entry.host || 'localhost',
            entry.service || 'system',
            entry.metric_name,
            entry.metric_value,
            entry.metric_type || 'gauge',
            JSON.stringify(entry.tags || {})
        ]);

        await insert('metrics',
            ['timestamp', 'host', 'service', 'metric_name', 'metric_value', 'metric_type', 'tags'],
            rows
        );
        res.json({ status: 'ok', ingested: rows.length });
    } catch (err) {
        console.error('Metric ingestion error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

router.post('/traces', async (req, res) => {
    try {
        const entries = Array.isArray(req.body) ? req.body : [req.body];
        const rows = entries.map(entry => [
            entry.timestamp || new Date().toISOString(),
            entry.trace_id,
            entry.span_id,
            entry.parent_span_id || '',
            entry.service,
            entry.operation,
            entry.duration_ms,
            entry.status_code || 200,
            entry.error ? 1 : 0,
            JSON.stringify(entry.tags || {})
        ]);

        await insert('traces',
            ['timestamp', 'trace_id', 'span_id', 'parent_span_id', 'service', 'operation', 'duration_ms', 'status_code', 'error', 'tags'],
            rows
        );
        res.json({ status: 'ok', ingested: rows.length });
    } catch (err) {
        console.error('Trace ingestion error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

router.post('/infrastructure', async (req, res) => {
    try {
        const entries = Array.isArray(req.body) ? req.body : [req.body];
        const rows = entries.map(entry => [
            entry.timestamp || new Date().toISOString(),
            entry.host,
            entry.container_id || '',
            entry.container_name || '',
            entry.cpu_percent || 0,
            entry.memory_percent || 0,
            entry.memory_used_mb || 0,
            entry.disk_percent || 0,
            entry.network_rx_bytes || 0,
            entry.network_tx_bytes || 0,
            entry.status || 'running'
        ]);

        await insert('infrastructure',
            ['timestamp', 'host', 'container_id', 'container_name', 'cpu_percent', 'memory_percent', 'memory_used_mb', 'disk_percent', 'network_rx_bytes', 'network_tx_bytes', 'status'],
            rows
        );
        res.json({ status: 'ok', ingested: rows.length });
    } catch (err) {
        console.error('Infrastructure ingestion error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
