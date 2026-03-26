const { query, insert } = require('./proton');

const alertRules = [];
let polling = false;

function addRule(rule) {
    alertRules.push({
        id: Date.now().toString(36),
        name: rule.name,
        metric_name: rule.metric_name,
        operator: rule.operator || 'gt',
        threshold: rule.threshold,
        severity: rule.severity || 'warning',
        webhook_url: rule.webhook_url || null,
        enabled: true,
        created_at: new Date().toISOString()
    });
    return alertRules[alertRules.length - 1];
}

function getRules() {
    return alertRules;
}

function deleteRule(id) {
    const idx = alertRules.findIndex(r => r.id === id);
    if (idx === -1) return false;
    alertRules.splice(idx, 1);
    return true;
}

function checkThreshold(value, operator, threshold) {
    switch (operator) {
        case 'gt': return value > threshold;
        case 'gte': return value >= threshold;
        case 'lt': return value < threshold;
        case 'lte': return value <= threshold;
        case 'eq': return value === threshold;
        default: return value > threshold;
    }
}

async function evaluateRules() {
    for (const rule of alertRules) {
        if (!rule.enabled) continue;

        try {
            const sql = `SELECT avg(metric_value) AS avg_val FROM table(metrics) WHERE metric_name = '${rule.metric_name}' AND timestamp > now() - INTERVAL 1 MINUTE`;
            const results = await query(sql);

            if (results.length === 0) continue;

            const avgVal = typeof results[0] === 'object' ? results[0].avg_val : parseFloat(results[0]);
            if (isNaN(avgVal)) continue;

            if (checkThreshold(avgVal, rule.operator, rule.threshold)) {
                const alertMsg = `[${rule.severity.toUpperCase()}] ${rule.name}: ${rule.metric_name} = ${avgVal.toFixed(2)} (threshold: ${rule.operator} ${rule.threshold})`;
                console.log(`🚨 Alert fired: ${alertMsg}`);

                await insert('alert_events',
                    ['rule_name', 'severity', 'metric_name', 'threshold', 'actual_value', 'message'],
                    [[rule.name, rule.severity, rule.metric_name, rule.threshold, avgVal, alertMsg]]
                );

                if (rule.webhook_url) {
                    try {
                        await fetch(rule.webhook_url, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ alert: alertMsg, rule, value: avgVal })
                        });
                    } catch (err) {
                        console.error(`Webhook delivery failed for ${rule.name}:`, err.message);
                    }
                }
            }
        } catch (err) {
            console.error(`Rule evaluation failed for ${rule.name}:`, err.message);
        }
    }
}

function startPolling(intervalMs = 15000) {
    if (polling) return;
    polling = true;
    console.log(`📊 Alert engine started (polling every ${intervalMs / 1000}s)`);
    setInterval(evaluateRules, intervalMs);
}

module.exports = { addRule, getRules, deleteRule, startPolling };
