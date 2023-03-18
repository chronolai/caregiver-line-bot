import express from 'express';
import { v2 } from '@google-cloud/translate';

import { reply } from '../services/line.js';

const { Translate } = v2;

const lib = new Translate({
  projectId: process.env.PROJECT_ID,
  key: process.env.API_KEY,
});

async function detect(text) {
  const res = await lib.detect(text);
  const [detection] = res;
  return detection.language;
}

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  detect('你好').then((txt) => {
    res.send(JSON.stringify(txt));
  });
});

app.post('/webhook', async (req, res) => {
  const events = req.body.events || [];
  const replies = events
    .filter(({ type }) => type === 'message')
    .map(({ replyToken, message }) => reply({
      replyToken,
      messages: [{ type: 'text', text: message.text }],
    }));
  await Promise.all(replies);
  res.sendStatus(200);
});

app.listen(3000);

export default app;
