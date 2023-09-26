import { openBrowsers } from '../src/twitter/utils.js';

async function main() {
  const numBrowsers = process.argv[2] ? Number(process.argv[2]) : null;
  console.error('numBrowsers:', numBrowsers);
  const url = process.argv[3] || null;
  console.error('url:', url);
  openBrowsers(numBrowsers, url);
}

main()
  .then(() => {
    // process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
