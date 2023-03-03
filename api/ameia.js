const { Translate } = require('@google-cloud/translate').v2;

require('dotenv').config()

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

async function main() {
  console.table([
    await ameia('hello'),
    await ameia('中文'),
    await ameia('Halo'),
    await ameia('apakah kamu kenyang?'),
    await ameia('你吃飽了嗎？'),
    await ameia('if 中英夾雜呢？'),
  ]);
}
// main();

module.exports = ameia;
