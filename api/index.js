const app = require('express')();
const { v4 } = require('uuid');
const linebot = require('linebot');

const bot = linebot({
  channelId: process.env.LINE_CHANNEL_ID,
  channelSecret: process.env.LINE_CHANNEL_SECRET,
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
});

bot.on('message', function (event) {
  event.reply('TEST').then(function (data) {
    // success
  }).catch(function (error) {
    // error
  });
});
const linebotParser = bot.parser();

app.get('/api', (req, res) => {
  const path = `/api/item/${v4()}`;
  res.setHeader('Content-Type', 'text/html');
  res.setHeader('Cache-Control', 's-max-age=1, stale-while-revalidate');
  res.end(`Hello! Go to item: <a href="${path}">${path}</a>`);
});

app.get('/api/item/:slug', (req, res) => {
  const { slug } = req.params;
  res.end(`Item: ${slug}`);
});

app.get('/webhook', (req, res) => {
  res.end(`Hello webhook`);
});

app.post('/webhook', linebotParser);

app.get('/', (req, res) => {
  res.end(`OK`);
});

module.exports = app;
