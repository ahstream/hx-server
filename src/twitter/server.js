import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { ping, handleTweet } from './ping.js';
import { startStream } from './stream.js';
import config from '../../config/config.js';
import pkg from '@ahstream/hx-lib';
const { extractURLs } = pkg;

const state = {
  config,
  tweetsHandled: {},
  linksHandled: {},
  timestamp: Number(new Date()),
};

const app = express();
const port = config.twitter.port;

app.use(cors({ origin: '*' }));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.post('/ping', async function (req, res) {
  return ping(req, res, state);
});

app.listen(port, () => {
  console.log(`Success! Your application is running on port ${port}.`);
});

if (config.startStream) {
  startStream((data) => {
    handleTweet(
      {
        tweetId: data.data.id,
        text: data.data.text,
        urls: extractURLs(data.data.text),
        fromStream: true,
        toProfile: 'Profile 29',
      },
      state
    );
  });
}
