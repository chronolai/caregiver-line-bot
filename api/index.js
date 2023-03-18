import express from 'express';
import { v2 } from '@google-cloud/translate';

import { reply } from '../services/line.js';

const lib = new v2.Translate({
  projectId: process.env.PROJECT_ID,
  key: process.env.API_KEY,
});

async function detect(text) {
  const res = await lib.detect(text);
  const [detection] = res;
  const { language } = detection;
  if (language === 'zh-CN') return 'zh-TW';
  return detection.language;
}

async function translate(text, target = 'zh-TW') {
  const [translation] = await lib.translate(text, target);
  return translation;
}

async function ameia(text) {
  console.error('ameia', text);
  const mapping = { 'id': 'zh-TW', 'zh-TW': 'id', 'zh-CN': 'id', 'en': 'id' };
  const source = await detect(text);
  const target = source === 'en' ? 'en' : mapping[source];
  const result = source === 'en' ? text : await translate(text, target);
  return {
    source_locale: source,
    source_text: text,
    target_locale: target,
    target_text: result,
  };
}

const app = express();
app.use(express.json());

app.get('/', (req, res) => {
  ameia('你好').then((result) => {
    res.json(result);
  });
});

app.post('/webhook', async (req, res) => {
  const events = req.body.events || [];
  const replies = events
    .filter(({ type }) => type === 'message')
    .map(({ replyToken, message }) => ameia(message.text).then((result) => {
      console.error(result);
      const data = { replyToken, messages: [{ type: 'text', text: result.target_text }] };
      return reply(data);
    }));
  await Promise.all(replies);
  res.sendStatus(200);
});

app.listen(3000);

export default app;
