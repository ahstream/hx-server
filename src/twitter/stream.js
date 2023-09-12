import dotenv from 'dotenv';
dotenv.config();

// Open a realtime stream of Tweets, filtered according to rules
// https://developer.twitter.com/en/docs/twitter-api/tweets/filtered-stream/quick-start

import needle from 'needle';

// The code below sets the bearer token from your environment variables
// To set environment variables on macOS or Linux, run the export command below from the terminal:
// export BEARER_TOKEN='YOUR-TOKEN'
const token = process.env.TWITTER_BEARER_TOKEN;

const rulesURL = 'https://api.twitter.com/2/tweets/search/stream/rules';
const streamURL = 'https://api.twitter.com/2/tweets/search/stream?tweet.fields=created_at&expansions=author_id&user.fields=created_at';
// const streamURL = 'https://api.twitter.com/2/tweets/search/stream';

// this sets up two rules - the value is the search terms to match on, and the tag is an identifier that
// will be applied to the Tweets return to show which rule they matched
// with a standard project with Basic Access, you can add up to 25 concurrent rules to your stream, and
// each rule can be up to 512 characters long

// Edit rules as desired below
const rules = [
  /*
  {
    value: 'dog has:images -is:retweet',
    tag: 'dog pictures',
  },
  */
  {
    value: '(from:LockSpirit)',
  },
];

async function getAllRules() {
  const response = await needle('get', rulesURL, {
    headers: {
      authorization: `Bearer ${token}`,
    },
  });

  if (response.statusCode !== 200) {
    console.log('Error:', response.statusMessage, response.statusCode);
    throw new Error(response.body);
  }

  return response.body;
}

async function deleteAllRules(rules) {
  if (!Array.isArray(rules.data)) {
    return null;
  }

  const ids = rules.data.map((rule) => rule.id);

  const data = {
    delete: {
      ids: ids,
    },
  };

  const response = await needle('post', rulesURL, data, {
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${token}`,
    },
  });

  if (response.statusCode !== 200) {
    console.log('error response:', response);
    throw new Error(response.body);
  }

  return response.body;
}

async function setRules() {
  const data = {
    add: rules,
  };

  console.log('rulesURL', rulesURL);
  console.log('data', data);
  const response = await needle('post', rulesURL, data, {
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${token}`,
    },
  });

  if (response.statusCode === 429) {
    console.log(response.status, response.statusMessage);
    const limitReset = Number(response.headers.get('x-rate-limit-reset'));
    const limitResetDate = new Date(limitReset * 1000);
    console.log('Limit reset:', limitResetDate.toISOString());
    throw new Error(response.statusMessage);
  }

  if (response.statusCode !== 201) {
    console.log('error response:', response);
    throw new Error(response.statusMessage);
  }

  return response.body;
}

function streamConnect(retryAttempt, callback) {
  const stream = needle.get(streamURL, {
    headers: {
      'User-Agent': 'v2FilterStreamJS',
      Authorization: `Bearer ${token}`,
    },
    timeout: 20000,
  });

  stream
    .on('data', (data) => {
      try {
        // console.log('received at: ', new Date().toISOString());
        // console.log(data);
        const json = JSON.parse(data);
        console.log(json);
        // A successful connection resets retry count.
        retryAttempt = 0;
        if (callback && typeof callback === 'function') {
          callback(json);
        }
      } catch (e) {
        // console.error('stream error', e);
        if (data.detail === 'This stream is currently at the maximum allowed connection limit.') {
          console.log(data.detail);
          return;
        } else {
          // Keep alive signal received. Do nothing.
        }
      }
    })
    .on('err', (error) => {
      console.error('stream error', e);
      console.dir(e);
      if (error.code !== 'ECONNRESET') {
        console.log(error.code);
      } else {
        // This reconnection logic will attempt to reconnect when a disconnection is detected.
        // To avoid rate limits, this logic implements exponential backoff, so the wait time
        // will increase if the client cannot reconnect to the stream.
        setTimeout(() => {
          console.warn('A connection error occurred. Reconnecting...');
          streamConnect(++retryAttempt);
        }, 2 ** retryAttempt);
      }
    });

  return stream;
}

export async function startStream(callback) {
  console.log('startStream');

  let currentRules;

  try {
    currentRules = await getAllRules();
    console.log('currentRules 1:', currentRules);

    const result = await deleteAllRules(currentRules);
    console.log('deleteAllRules result:', result);

    console.log('currentRules 2:', await getAllRules());

    await setRules();
  } catch (e) {
    console.error('stream error:', JSON.stringify(e));
    return;
  }

  // Listen to the stream.
  streamConnect(0, callback);
}
