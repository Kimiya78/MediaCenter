const https = require('https');
const fs = require('fs');
const next = require('next');

// Set the environment and create the app
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();
const port = 8289;

// Prepare the app
app.prepare().then(() => {
https
.createServer(
{
key: fs.readFileSync('SSL/PrivateKey.key'),
cert: fs.readFileSync('SSL/Root.cer')
},
(req: any, res: any) => {
handle(req, res);
}
)
.listen(port, (err: any) => {
if (err) throw err;
console.log('> Ready on https://cgl1106.cinnagen.com:8289');
});
});