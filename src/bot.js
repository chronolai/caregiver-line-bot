require('dotenv').config()
const linebot = require('linebot');
const { Translate } = require('@google-cloud/translate').v2;


const lib = new Translate({
  projectId: process.env.PROJECT_ID,
  key: process.env.API_KEY,
});


async function detect(text) {
  let [ detections ] = await lib.detect(text);
  detections = Array.isArray(detections) ? detections : [detections];
  return detections[0].language;
}

async function translate(text, target = 'zh-TW') {
  const [ translation ] = await lib.translate(text, target);
  return translation;
}

async function ameia(text) {
  const mapping = { 'id': 'zh-TW', 'zh-TW': 'id', 'zh-CN': 'id', 'en': 'id' };
  const source = await detect(text);
  const target = mapping[source] || 'en';
  const result = await translate(text, target);
  return {
    source_locale: source,
    source_text: text,
    target_locale: target,
    target_text: result,
  };
}

function Robot(debug = false) {
  console.error(`Initial line bot (debug: ${debug? 'true' : 'false'})`);
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
    console.error(JSON.stringify(event, null, 2));
    const text = event.message.text;
    const result = await ameia(text);
    console.table(result);
    await event.reply([
      `${profile.displayName}:`,
      `[${result.source_locale.slice(0, 2)}] ${result.source_text}`,
      `[${result.target_locale.slice(0, 2)}] ${result.target_text}`,
    ].join('\n'));
  });
  return bot;
}

module.exports = Robot;