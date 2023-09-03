const express = require('express')
const fs = require('fs');
const { Client } = require('whatsapp-web.js');
const SESSION_FILE_PATH = './session.json';
let sessionCfg;
if (fs.existsSync(SESSION_FILE_PATH)) {
    sessionCfg = require(SESSION_FILE_PATH);
}
const client = new Client({ puppeteer: { headless: false }, session: sessionCfg });

client.initialize();

client.on('qr', (qr) => {
    // NOTE: This event will not be fired if a session is specified.
    console.log('QR RECEIVED', qr);
});

client.on('authenticated', (session) => {
    console.log('AUTHENTICATED', session);
    sessionCfg=session;
    fs.writeFile(SESSION_FILE_PATH, JSON.stringify(session), function (err) {
        if (err) {
            console.error(err);
        }
    });
});

client.on('auth_failure', msg => {
    // Fired if session restore was unsuccessfull
    console.error('AUTHENTICATION FAILURE', msg);
});

client.on('ready', () => {
    console.log('READY');
});
const app = express()
const port = 3000
// app.use(express.urlencoded());
app.use(express.json());
app.post('/send', async (req, res) => {
    client.sendMessage(req.body.phone + '@c.us',req.body.message)
        .then((response) => {
            if (response.id.fromMe) {
                res.send({ status:'success', message: `Message successfully sent to ${req.body.phone}` })
            }
        });
})

app.listen(port, () => {
    console.log(`WA app listening at http://localhost:${port}`)
})