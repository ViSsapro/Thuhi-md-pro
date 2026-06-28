const express = require('express');
const fs = require('fs-extra');
const path = require('path');
const pino = require('pino');
const cors = require('cors'); // අලුතින් එක් කළේ
const config = require('./config');
const axios = require('axios');
const mongoose = require('mongoose');
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, makeCacheableSignalKeyStore } = require('@whiskeysockets/baileys');
const NodeCache = require('node-cache');

const app = express();
app.use(cors()); // CORS ගැටලු නැති කිරීමට
app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 3000;
const SESSION_BASE_PATH = './sessions';

// MongoDB සම්බන්ධ කිරීම
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://vimukthithuhina0_db_user:Admin123%40%230@cluster0.yqfdy6r.mongodb.net/?appName=Cluster0').catch(err => console.log(err));

async function Pair(number, res = null) {
    const xnumber = number.replace(/[^0-9]/g, '');
    const sessionId = `yasas_${xnumber}`;
    const sessionPath = path.join(SESSION_BASE_PATH, sessionId);

    try {
        await fs.ensureDir(sessionPath);
        const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
        const { version } = await fetchLatestBaileysVersion();
        const logger = pino({ level: 'silent' });

        const sock = makeWASocket({
            version,
            auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, logger) },
            logger: logger,
            browser: ["Mac OS", "Safari", "14.0.0"],
            printQRInTerminal: false
        });

        sock.ev.on('creds.update', saveCreds);

        if (!sock.authState.creds.registered) {
            await new Promise(resolve => setTimeout(resolve, 3000));
            const pairingCode = await sock.requestPairingCode(xnumber);
            if (res && !res.headersSent) res.json({ code: pairingCode });
        } else {
            if (res && !res.headersSent) res.json({ error: 'Number already registered' });
        }
    } catch (err) {
        if (res && !res.headersSent) res.json({ error: 'Pair failed: ' + err.message });
    }
}

// Frontend එකෙන් එන Request සඳහා Endpoint දෙකම එකම function එකට සම්බන්ධ කිරීම
app.get('/pair', async (req, res) => await Pair(req.query.number, res));
app.get('/code', async (req, res) => await Pair(req.query.number, res));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
