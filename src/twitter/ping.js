import pkg from '@ahstream/hx-lib';
const { openInChrome, convertTwitterSnowflakeToDate, dateLogStr } = pkg;

function isValidLink(text) {
  // if (link.href.includes('forms.gle') || link.href.includes('t.co') || link.href.includes('docs.google.com')) {
}

export function handleTweet(data, state) {
  const ignoreSeenURLs = state.config.twitter.ignoreSeenURLs;

  if (!data.urls?.length) {
    return console.log(dateLogStr(), 'Ignore, no urls!', data);
  }

  if (!data.tweetId) {
    return console.error('Ignore, missing tweetId!');
  }

  const timestamp = Number(convertTwitterSnowflakeToDate(data.tweetId));
  if (!timestamp) {
    return console.error('Ignore, missing timestamp!');
  }
  if (timestamp <= state.timestamp) {
    return console.log(dateLogStr(), 'Ignore, old tweet!', timestamp, state.timestamp);
  }

  if (state.tweetsHandled[data.tweetId] && !data.fromStream) {
    return console.log(dateLogStr(), 'Ignore, tweetId already done!', data.tweetId);
  }
  state.tweetsHandled[data.tweetId] = Number(new Date());

  console.log(dateLogStr(), 'HANDLE TWEET:', data);

  for (const url of data.urls) {
    if (ignoreSeenURLs && state.linksHandled[url] && !data.fromStream) {
      console.log(dateLogStr(), 'URL already done', url);
      continue;
    }
    state.linksHandled[url] = Number(new Date());
    if (data.toProfile) {
      console.log('Open (profile):', url, data.toProfile);
      openInChrome(url, data.toProfile);
    } else {
      for (const key in state.config.altAccounts) {
        const acct = state.config.altAccounts[key];
        if (!acct.enabled) {
          continue;
        }
        console.log('Open:', url, acct.profile);
        openInChrome(url, acct.profile);
      }
    }
  }
}

export async function ping(req, res, state) {
  // console.log(dateLogStr(), 'body', req.body);

  if (!req.body) {
    console.log(dateLogStr(), 'Ignore, invalid data!', req.body);
    return res.send('pong');
  }

  handleTweet(
    {
      urls: req.body.urls,
      tweetId: req.body.id,
      text: req.body.text,
    },
    state
  );

  res.send('pong');
}
