const express = require('express');
const bodyParser = require('body-parser')
const path = require('path');
const app = express();

app.use(express.static(path.join(__dirname, 'client')));

app.get('/ping', (_, res) => res.send('pong'));

app.get('/', (_, res) => res.sendFile(path.join(__dirname, 'client', 'build', 'index.html')));

app.listen(process.env.PORT || 3001);
