const express = require('express');
const router = express.Router();
const { addRule, getRules, deleteRule } = require('../services/alertEngine');

router.get('/', (req, res) => {
    res.json({ rules: getRules() });
});

router.post('/', (req, res) => {
    try {
        const { name, metric_name, operator, threshold, severity, webhook_url } = req.body;
        if (!name || !metric_name || threshold === undefined) {
            return res.status(400).json({ error: 'name, metric_name, and threshold are required' });
        }

        const rule = addRule({ name, metric_name, operator, threshold, severity, webhook_url });
        res.status(201).json({ rule });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/:id', (req, res) => {
    const deleted = deleteRule(req.params.id);
    if (deleted) res.json({ status: 'deleted' });
    else res.status(404).json({ error: 'Rule not found' });
});

module.exports = router;
