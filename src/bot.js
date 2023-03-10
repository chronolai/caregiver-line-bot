require('dotenv').config()
const axios = require('axios');
const linebot = require('linebot');
const { Translate } = require('@google-cloud/translate').v2;


const lib = new Translate({
  projectId: process.env.PROJECT_ID,
  key: process.env.API_KEY,
});

async function detect(text) {
  console.error('detect', text);
  const res = await lib.detect(text);
  console.error('res', res);
  let [ detections ] = res;
  detections = Array.isArray(detections) ? detections : [detections];
  return detections[0].language;
}

async function translate(text, target = 'zh-TW') {
  console.error('translate', text);
  const [ translation ] = await lib.translate(text, target);
  return translation;
}

async function ameia(text) {
  console.error('ameia', text);
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

async function test(text) {
  console.error('test:', text);
  const key = process.env.API_KEY;
  const from = 'zh-TW';
  const to = 'en';
  const response = await axios.post(`https://www.googleapis.com/language/translate/v2?key=${key}&source=${from}&target=${to}&q=${text}`);
  return response.data.data.translations[0].translatedText;
}

function Robot(debug = false) {
  console.log(`Initial line bot (debug: ${debug? 'true' : 'false'})`);
  const bot = linebot({
    channelId: process.env.LINE_CHANNEL_ID,
    channelSecret: process.env.LINE_CHANNEL_SECRET,
    channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  });
  bot.on('message', async function (event) {
    // event.reply('hi');
    const t = await test(event.message.text);
    console.error(t);
    event.reply(`hi, ${t}`);
    // test().then((t) => {
      // event.reply(t);
    // }).catch((e) => {
      // console.error(JSON.stringify(e));
    // });

    // try {
    //   console.log(JSON.stringify(event, null, 2));
    //   if (!(event.type === 'message' && event.message.type === 'text')) {
    //     // console.log('return');
    //     return;
    //   }
    //   console.log('WTF');
    //   // const profile = await bot.getUserProfile(event.source.userId);
    //   // console.log(JSON.stringify(profile, null, 2));
    //   const text = event.message.text;
    //   const result = await ameia(text);
    //   console.log('WTF2');
    //   // console.table(result);
    //   await event.reply([
    //     // `${profile.displayName}:`,
    //     `[${result.source_locale.slice(0, 2)}] ${result.source_text}`,
    //     `[${result.target_locale.slice(0, 2)}] ${result.target_text}`,
    //   ].join('\n'));
    // } catch (e) {
    //   await event.reply(JSON.stringify(e));
    // }
  });
  return bot;
}

module.exports = Robot;
