const app = require('express')();
const { v4 } = require('uuid');
const linebot = require('linebot');

const ameia = require('./ameia');

const bot = linebot({
  channelId: process.env.LINE_CHANNEL_ID,
  channelSecret: process.env.LINE_CHANNEL_SECRET,
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
});

bot.on('message', async function (event) {
  if (!(event.type === 'message' && event.message.type === 'text')) {
    return;
  }
  const profile = await bot.getUserProfile(event.source.userId);
  // console.error(JSON.stringify(event, null, 2));
  const text = event.message.text;
  const result = await ameia(text);
  console.table(result);
  await event.reply(`${profile.displayName}: ${result.target_text}`);
});
const linebotParser = bot.parser();
bot.listen('/linewebhook', 3000);

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
