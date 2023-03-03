const app = require('express')();

const bot = require('../src/bot');

const ameia = bot();
// app.get('/webhook', (req, res) => res.end(`OK`));
app.post('/webhook', ameia.parser());

app.get('/', (req, res) => res.end(`OK`));

// app.listen(3000, () => {
    // console.log(`Example app listening on port ${3000}`)
// })

module.exports = app;
