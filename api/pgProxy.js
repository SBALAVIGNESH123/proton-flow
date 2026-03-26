const net = require('net');
const { query, execute } = require('./services/proton');

const PG_PORT = process.env.PG_PORT || 5432;

function writeInt32BE(buffer, value, offset) {
    buffer[offset] = (value >> 24) & 0xff;
    buffer[offset + 1] = (value >> 16) & 0xff;
    buffer[offset + 2] = (value >> 8) & 0xff;
    buffer[offset + 3] = value & 0xff;
}

function readInt32BE(buffer, offset) {
    return (buffer[offset] << 24) | (buffer[offset + 1] << 16) | (buffer[offset + 2] << 8) | buffer[offset + 3];
}

function buildAuthOk() {
    const buf = Buffer.alloc(9);
    buf[0] = 0x52; // 'R' AuthenticationOk
    writeInt32BE(buf, 8, 1);
    writeInt32BE(buf, 0, 5); // AuthOk = 0
    return buf;
}

function buildReadyForQuery() {
    const buf = Buffer.alloc(6);
    buf[0] = 0x5a; // 'Z' ReadyForQuery
    writeInt32BE(buf, 5, 1);
    buf[5] = 0x49; // 'I' = idle
    return buf;
}

function buildParameterStatus(key, value) {
    const keyBuf = Buffer.from(key + '\0');
    const valBuf = Buffer.from(value + '\0');
    const len = 4 + keyBuf.length + valBuf.length;
    const buf = Buffer.alloc(1 + len);
    buf[0] = 0x53; // 'S'
    writeInt32BE(buf, len, 1);
    keyBuf.copy(buf, 5);
    valBuf.copy(buf, 5 + keyBuf.length);
    return buf;
}

function buildRowDescription(columns) {
    let totalLen = 4 + 2;
    const colBuffers = columns.map(col => {
        const nameBuf = Buffer.from(col + '\0');
        totalLen += nameBuf.length + 18;
        return nameBuf;
    });

    const buf = Buffer.alloc(1 + totalLen);
    let offset = 0;
    buf[offset++] = 0x54; // 'T'
    writeInt32BE(buf, totalLen, offset); offset += 4;
    buf[offset++] = (columns.length >> 8) & 0xff;
    buf[offset++] = columns.length & 0xff;

    for (const nameBuf of colBuffers) {
        nameBuf.copy(buf, offset); offset += nameBuf.length;
        writeInt32BE(buf, 0, offset); offset += 4;   // table OID
        buf[offset++] = 0; buf[offset++] = 0;         // column #
        writeInt32BE(buf, 25, offset); offset += 4;    // type OID (text)
        buf[offset++] = 0xff; buf[offset++] = 0xff;   // type size
        writeInt32BE(buf, -1, offset); offset += 4;    // type modifier
        buf[offset++] = 0; buf[offset++] = 0;         // format (text)
    }
    return buf;
}

function buildDataRow(values) {
    let totalLen = 4 + 2;
    const valBuffers = values.map(v => {
        if (v === null || v === undefined) {
            totalLen += 4;
            return null;
        }
        const str = String(v);
        const b = Buffer.from(str);
        totalLen += 4 + b.length;
        return b;
    });

    const buf = Buffer.alloc(1 + totalLen);
    let offset = 0;
    buf[offset++] = 0x44; // 'D'
    writeInt32BE(buf, totalLen, offset); offset += 4;
    buf[offset++] = (values.length >> 8) & 0xff;
    buf[offset++] = values.length & 0xff;

    for (const vb of valBuffers) {
        if (vb === null) {
            writeInt32BE(buf, -1, offset); offset += 4;
        } else {
            writeInt32BE(buf, vb.length, offset); offset += 4;
            vb.copy(buf, offset); offset += vb.length;
        }
    }
    return buf;
}

function buildCommandComplete(tag) {
    const tagBuf = Buffer.from(tag + '\0');
    const len = 4 + tagBuf.length;
    const buf = Buffer.alloc(1 + len);
    buf[0] = 0x43; // 'C'
    writeInt32BE(buf, len, 1);
    tagBuf.copy(buf, 5);
    return buf;
}

function buildErrorResponse(message) {
    const severity = Buffer.from('SERROR\0');
    const msg = Buffer.from('M' + message + '\0');
    const code = Buffer.from('C42000\0');
    const terminator = Buffer.from('\0');
    const totalLen = 4 + severity.length + msg.length + code.length + terminator.length;
    const buf = Buffer.alloc(1 + totalLen);
    let offset = 0;
    buf[offset++] = 0x45; // 'E'
    writeInt32BE(buf, totalLen, offset); offset += 4;
    severity.copy(buf, offset); offset += severity.length;
    code.copy(buf, offset); offset += code.length;
    msg.copy(buf, offset); offset += msg.length;
    terminator.copy(buf, offset);
    return buf;
}

const server = net.createServer((socket) => {
    let authenticated = false;
    let buffer = Buffer.alloc(0);

    console.log(`[PG] Client connected: ${socket.remoteAddress}:${socket.remotePort}`);

    socket.on('data', async (data) => {
        buffer = Buffer.concat([buffer, data]);

        if (!authenticated) {
            if (buffer.length >= 8) {
                const len = readInt32BE(buffer, 0);
                const protocol = readInt32BE(buffer, 4);

                if (protocol === 196608) { // 3.0 protocol
                    socket.write(buildAuthOk());
                    socket.write(buildParameterStatus('server_version', '14.0 ProtonFlow'));
                    socket.write(buildParameterStatus('server_encoding', 'UTF8'));
                    socket.write(buildParameterStatus('client_encoding', 'UTF8'));
                    socket.write(buildReadyForQuery());
                    authenticated = true;
                    buffer = buffer.slice(len);
                    console.log('[PG] Client authenticated');
                }
            }
            return;
        }

        while (buffer.length >= 5) {
            const msgType = buffer[0];
            const msgLen = readInt32BE(buffer, 1);
            if (buffer.length < 1 + msgLen) break;

            const msgBody = buffer.slice(5, 1 + msgLen);
            buffer = buffer.slice(1 + msgLen);

            if (msgType === 0x51) { // 'Q' Simple Query
                const sqlRaw = msgBody.toString('utf8').replace(/\0$/, '').trim();
                console.log(`[PG] Query: ${sqlRaw}`);

                try {
                    if (sqlRaw.toUpperCase().startsWith('SELECT') || sqlRaw.toUpperCase().startsWith('SHOW')) {
                        const sql = sqlRaw.replace(/;$/, '') + ' FORMAT JSONEachRow';
                        const results = await query(sql);
                        const rows = results.filter(r => typeof r === 'object');

                        if (rows.length > 0) {
                            const columns = Object.keys(rows[0]);
                            socket.write(buildRowDescription(columns));
                            for (const row of rows) {
                                socket.write(buildDataRow(columns.map(c => row[c])));
                            }
                            socket.write(buildCommandComplete(`SELECT ${rows.length}`));
                        } else {
                            socket.write(buildCommandComplete('SELECT 0'));
                        }
                    } else {
                        await execute(sqlRaw);
                        socket.write(buildCommandComplete('OK'));
                    }
                } catch (err) {
                    socket.write(buildErrorResponse(err.message));
                }
                socket.write(buildReadyForQuery());

            } else if (msgType === 0x58) { // 'X' Terminate
                console.log('[PG] Client disconnected');
                socket.end();
                return;
            }
        }
    });

    socket.on('error', (err) => console.error('[PG] Socket error:', err.message));
    socket.on('close', () => console.log('[PG] Connection closed'));
});

function startPgProxy() {
    server.listen(PG_PORT, () => {
        console.log(`🐘 PostgreSQL wire protocol proxy listening on port ${PG_PORT}`);
        console.log(`   Connect with: psql -h localhost -p ${PG_PORT} -U proton -d protonflow`);
    });
}

module.exports = { startPgProxy };
