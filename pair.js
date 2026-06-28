const express = require('express');
const fs = require('fs-extra');
const path = require('path');
const pino = require('pino');
const cors = require('cors');
const mongoose = require('mongoose');
const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    fetchLatestBaileysVersion, 
    makeCacheableSignalKeyStore 
} = require('@whiskeysockets/baileys');

const app = express();
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 3000;
// session ෆෝල්ඩරය නිවැරදි path එකකින් ලබා දීම
const SESSION_BASE_PATH = path.join(__dirname, 'sessions');

// MongoDB සම්බන්ධ කිරීම
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://vimukthithuhina0_db_user:Admin123%40%230@cluster0.yqfdy6r.mongodb.net/?appName=Cluster0')
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.error("MongoDB Connection Error:", err));

async function Pair(number, res = null) {
    if (!number) {
        if (res) return res.status(400).json({ error: 'Number is required' });
        return;
    }

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
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, logger)
            },
            logger: logger,
            browser: ["Mac OS", "Safari", "14.0.0"],
            printQRInTerminal: false
        });

        // සැසිය වෙනස් වන සෑම විටම සුරැකීමට මෙය අත්‍යවශ්‍යයි
        sock.ev.on('creds.update', saveCreds);

        // Pairing Code ලබා ගැනීම
        if (!sock.authState.creds.registered) {
            const pairingCode = await sock.requestPairingCode(xnumber);
            if (res && !res.headersSent) {
                res.json({ code: pairingCode });
            }
        } else {
            if (res && !res.headersSent) {
                res.json({ error: 'Number already registered or session exists' });
            }
        }
    } catch (err) {
        console.error("Pairing Error:", err);
        if (res && !res.headersSent) {
            res.json({ error: 'Pair failed: ' + err.message });
        }
    }
}

app.get('/pair', async (req, res) => await Pair(req.query.number, res));
app.get('/code', async (req, res) => await Pair(req.query.number, res));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
