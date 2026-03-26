const express = require('express');
const router = express.Router();
const { query } = require('../services/proton');

router.post('/', async (req, res) => {
    try {
        const { sql } = req.body;
        if (!sql) return res.status(400).json({ error: 'sql field required' });
        const results = await query(`${sql} FORMAT JSONEachRow`);
        res.json({ data: results });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ═══ LOGS ═══
router.get('/logs', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 100;
        const level = req.query.level;
        const service = req.query.service;
        const search = req.query.search;

        let sql = `SELECT * FROM table(logs)`;
        const conditions = [];
        if (level) conditions.push(`level = '${level}'`);
        if (service) conditions.push(`service = '${service}'`);
        if (search) conditions.push(`message LIKE '%${search}%'`);
        if (conditions.length > 0) sql += ` WHERE ${conditions.join(' AND ')}`;
        sql += ` ORDER BY timestamp DESC LIMIT ${limit} FORMAT JSONEachRow`;

        const results = await query(sql);
        res.json({ data: results });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ═══ METRICS ═══
router.get('/metrics', async (req, res) => {
    try {
        const minutes = parseInt(req.query.minutes) || 5;
        const host = req.query.host;

        let sql = `SELECT * FROM table(metrics) WHERE timestamp > now() - INTERVAL ${minutes} MINUTE`;
        if (host) sql += ` AND host = '${host}'`;
        sql += ` ORDER BY timestamp DESC FORMAT JSONEachRow`;

        const results = await query(sql);
        res.json({ data: results });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/metrics/summary', async (req, res) => {
    try {
        const sql = `SELECT 
            metric_name,
            avg(metric_value) AS avg_val,
            max(metric_value) AS max_val,
            min(metric_value) AS min_val,
            count() AS sample_count
        FROM table(metrics) 
        WHERE timestamp > now() - INTERVAL 5 MINUTE
        GROUP BY metric_name
        FORMAT JSONEachRow`;

        const results = await query(sql);
        res.json({ data: results });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ═══ APM TRACES ═══
router.get('/traces', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 100;
        const service = req.query.service;
        const errorsOnly = req.query.errors === 'true';

        let sql = `SELECT * FROM table(traces)`;
        const conditions = [];
        if (service) conditions.push(`service = '${service}'`);
        if (errorsOnly) conditions.push(`error = true`);
        if (conditions.length > 0) sql += ` WHERE ${conditions.join(' AND ')}`;
        sql += ` ORDER BY timestamp DESC LIMIT ${limit} FORMAT JSONEachRow`;

        const results = await query(sql);
        res.json({ data: results });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/traces/summary', async (req, res) => {
    try {
        const sql = `SELECT 
            service,
            count() AS total_spans,
            avg(duration_ms) AS avg_duration,
            max(duration_ms) AS max_duration,
            countIf(error = true) AS error_count,
            countIf(duration_ms > 1000) AS slow_count
        FROM table(traces) 
        WHERE timestamp > now() - INTERVAL 10 MINUTE
        GROUP BY service
        ORDER BY total_spans DESC
        FORMAT JSONEachRow`;

        const results = await query(sql);
        res.json({ data: results });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/traces/:traceId', async (req, res) => {
    try {
        const sql = `SELECT * FROM table(traces) WHERE trace_id = '${req.params.traceId}' ORDER BY timestamp ASC FORMAT JSONEachRow`;
        const results = await query(sql);
        res.json({ data: results });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ═══ INFRASTRUCTURE ═══
router.get('/infrastructure', async (req, res) => {
    try {
        const sql = `SELECT 
            host,
            container_name,
            avg(cpu_percent) AS avg_cpu,
            avg(memory_percent) AS avg_memory,
            avg(disk_percent) AS avg_disk,
            max(cpu_percent) AS max_cpu,
            max(memory_percent) AS max_memory,
            any(status) AS status,
            count() AS samples
        FROM table(infrastructure) 
        WHERE timestamp > now() - INTERVAL 5 MINUTE
        GROUP BY host, container_name
        ORDER BY avg_cpu DESC
        FORMAT JSONEachRow`;

        const results = await query(sql);
        res.json({ data: results });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/infrastructure/history', async (req, res) => {
    try {
        const host = req.query.host;
        const minutes = parseInt(req.query.minutes) || 10;
        let sql = `SELECT * FROM table(infrastructure) WHERE timestamp > now() - INTERVAL ${minutes} MINUTE`;
        if (host) sql += ` AND host = '${host}'`;
        sql += ` ORDER BY timestamp DESC FORMAT JSONEachRow`;

        const results = await query(sql);
        res.json({ data: results });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ═══ ALERTS HISTORY ═══
router.get('/alerts/history', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const sql = `SELECT * FROM table(alert_events) ORDER BY timestamp DESC LIMIT ${limit} FORMAT JSONEachRow`;
        const results = await query(sql);
        res.json({ data: results });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ═══ SERVICE MAP ═══
router.get('/servicemap', async (req, res) => {
    try {
        const sql = `SELECT 
            service,
            count() AS total_requests,
            avg(duration_ms) AS avg_latency,
            countIf(error = true) AS errors,
            countIf(status_code >= 200 AND status_code < 300) AS success_count
        FROM table(traces) 
        WHERE timestamp > now() - INTERVAL 10 MINUTE
        GROUP BY service
        ORDER BY total_requests DESC
        FORMAT JSONEachRow`;

        const results = await query(sql);
        res.json({ data: results });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
