import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import config from './config/config.js';

// import open from 'open';

const app = express();
const port = config.port;

app.set('view engine', 'ejs');
app.set('views', 'src/sample-website/views');

app.use(cors({ origin: '*' }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', (req, res) => {
  res.render('pages/index', { title: 'Hey', message: 'Hello there!', tagline: 'tagline' });
});

app.listen(port, () => {
  console.log(`Success! Your application is running on port ${port}.`);
  // open(`http://localhost:${port}`);
});
