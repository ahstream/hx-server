import { startStream } from '../src/twitter/stream.js';

async function main() {
  startStream(streamCallback);
}

function streamCallback(data) {
  console.log('streamCallback, data:', data);
  const tweetId = data.data.id;
  const text = data.data.text;
}

main()
  .then(() => {
    // process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
