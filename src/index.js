const bot = require('./bot');

const ameia = bot(true);

ameia.listen('/webhook', 3000);

