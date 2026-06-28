const express = require('express');
const fs = require('fs-extra');
const path = require('path');
const pino = require('pino');
const cors = require('cors');
const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    DisconnectReason, 
    fetchLatestBaileysVersion, 
    makeCacheableSignalKeyStore 
} = require('@whiskeysockets/baileys');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 3000;
const SESSION_BASE_PATH = './sessions';

async function Pair(number, res) {
    const xnumber = number.replace(/[^0-9]/g, '');
    const sessionId = `session_${xnumber}`;
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
            browser: ["Chrome", "Windows", "3.0.0"],
            printQRInTerminal: false
        });

        sock.ev.on('creds.update', saveCreds);

        sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect } = update;
            
            if (connection === 'connecting') {
                console.log(`Connecting: ${xnumber}`);
            } else if (connection === 'open') {
                console.log('Successfully Connected!');
                // සම්බන්ධ වූ පසු session ෆයිල් එක වැදගත්
            } else if (connection === 'close') {
                const shouldReconnect = lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut;
                if (shouldReconnect) {
                    console.log('Connection closed, trying to reconnect...');
                    Pair(number, res); 
                }
            }
        });

        // Pairing Code එක ලබා ගැනීම
        if (!sock.authState.creds.registered) {
            // ටිකක් වෙලා ඉන්න, sock එක සූදානම් වෙන්න ඕනේ
            setTimeout(async () => {
                try {
                    const pairingCode = await sock.requestPairingCode(xnumber);
                    if (!res.headersSent) {
                        res.json({ code: pairingCode });
                    }
                } catch (e) {
                    if (!res.headersSent) res.json({ error: 'Code generation failed' });
                }
            }, 3000);
        } else {
            if (!res.headersSent) res.json({ error: 'Already registered' });
        }

    } catch (err) {
        console.error(err);
        if (!res.headersSent) res.json({ error: err.message });
    }
}

app.get('/pair', async (req, res) => {
    if (!req.query.number) return res.json({ error: 'Provide a number' });
    await Pair(req.query.number, res);
});

app.listen(PORT, () => console.log(`Server started on http://localhost:${PORT}`));
