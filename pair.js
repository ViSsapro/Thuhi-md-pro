const express = require('express');
const fs = require('fs-extra');
const path = require('path');
const pino = require('pino');
const cors = require('cors');
const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    makeCacheableSignalKeyStore 
} = require('@whiskeysockets/baileys');

const app = express();
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 3000;
const SESSION_BASE_PATH = './sessions';

async function Pair(number, res) {
    const xnumber = number.replace(/[^0-9]/g, '');
    const sessionId = `session_${xnumber}`;
    const sessionPath = path.join(SESSION_BASE_PATH, sessionId);

    console.log(`Starting process for: ${xnumber}`);

    try {
        await fs.ensureDir(sessionPath);
        const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
        const logger = pino({ level: 'silent' });

        const sock = makeWASocket({
            version: [2, 3000, 1015698730], // ස්ථාවර වර්ෂන් එකක්
            auth: { 
                creds: state.creds, 
                keys: makeCacheableSignalKeyStore(state.keys, logger) 
            },
            logger: logger,
            printQRInTerminal: false
        });

        sock.ev.on('creds.update', saveCreds);

        if (!sock.authState.creds.registered) {
            // Pairing Code එක උත්පාදනය කිරීමට කෙටි පමා කිරීමක්
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            try {
                const pairingCode = await sock.requestPairingCode(xnumber);
                console.log("Generated Code Successfully:", pairingCode);
                if (!res.headersSent) {
                    res.json({ code: pairingCode });
                }
            } catch (err) {
                console.error("Error in requestPairingCode:", err);
                if (!res.headersSent) res.json({ error: 'Pairing failed' });
            }
        } else {
            console.log("Number already registered.");
            if (!res.headersSent) res.json({ error: 'Number already registered' });
        }

    } catch (err) {
        console.error("Critical Error:", err);
        if (!res.headersSent) res.json({ error: err.message });
    }
}

app.get('/pair', async (req, res) => {
    if (!req.query.number) return res.json({ error: 'Number is required' });
    await Pair(req.query.number, res);
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
