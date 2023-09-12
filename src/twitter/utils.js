import pkg from '@ahstream/hx-lib';
const { openInChrome } = pkg;

import config from '../../config/config.js';

export function openBrowsers(numBrowsers = null, url = null) {
  console.log('numBrowsers, url', numBrowsers, url);
  const baseURL = url || 'https://tweetdeck.twitter.com/';

  let numOpened = 0;
  for (const key in config.altAccounts) {
    const acct = config.altAccounts[key];

    if (!numBrowsers && !acct.enabled) {
      continue;
    }

    if (numBrowsers && numOpened >= numBrowsers) {
      console.log('Opened max, skip rest!');
      continue;
    }

    console.log('Open account browser:', baseURL, acct);
    openInChrome(baseURL, acct.profile);
    numOpened++;
  }
}
