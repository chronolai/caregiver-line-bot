const app = require('express')();

const bot = require('../src/bot');

const ameia = bot(true);
app.post('/webhook', ameia.parser());

app.get('/', (req, res) => res.end(`OK`));

module.exports = app;
