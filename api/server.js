const express = require('express');
const cors = require('cors');
const { healthCheck, initializeStreams } = require('./services/proton');
const { startPolling } = require('./services/alertEngine');
const { startPgProxy } = require('./pgProxy');
const ingestRoutes = require('./routes/ingest');
const queryRoutes = require('./routes/query');
const alertRoutes = require('./routes/alerts');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.use('/api/ingest', ingestRoutes);
app.use('/api/query', queryRoutes);
app.use('/api/alerts', alertRoutes);

app.get('/api/health', async (req, res) => {
    const protonOk = await healthCheck();
    res.json({
        status: protonOk ? 'healthy' : 'degraded',
        proton: protonOk ? 'connected' : 'disconnected',
        uptime: process.uptime()
    });
});

app.listen(PORT, () => {
    console.log(`
    ╔══════════════════════════════════════════╗
    ║         ProtonFlow API Server            ║
    ║         Running on port ${PORT}              ║
    ╚══════════════════════════════════════════╝
    `);

    async function waitForProton() {
        let retries = 0;
        while (retries < 30) {
            const ok = await healthCheck();
            if (ok) {
                console.log('🔗 Proton engine connected');
                await initializeStreams();
                startPolling(15000);
                startPgProxy();
                return;
            }
            retries++;
            console.log(`⏳ Waiting for Proton... (${retries}/30)`);
            await new Promise(r => setTimeout(r, 2000));
        }
        console.error('❌ Could not connect to Proton after 60s');
        startPolling(15000);
    }

    waitForProton();
});
