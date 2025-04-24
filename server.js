const express = require('express');
const axios = require('axios');
const app = express();

app.get('/', async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).send("No URL provided");

  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    'Accept': 'text/html',
    'Referer': 'https://google.com/',
    'Origin': 'https://google.com',
    'Connection': 'keep-alive'
  };

  let visited = [];
  let currentUrl = url;
  let response;

  try {
    for (let i = 0; i < 10; i++) {
      response = await axios.get(currentUrl, {
        headers,
        maxRedirects: 0,
        validateStatus: status => status >= 200 && status < 400
      });

      visited.push({
        url: currentUrl,
        status: response.status,
        location: response.headers.location || null
      });

      if (response.status >= 300 && response.status < 400 && response.headers.location) {
        currentUrl = new URL(response.headers.location, currentUrl).href;
      } else {
        break;
      }
    }

    if (
      response.headers['content-type'] &&
      response.headers['content-type'].includes('text/html')
    ) {
      // Показываем HTML если он в ответе
      res.set('Content-Type', 'text/html');
      res.send(response.data);
    } else {
      // Если не HTML, просто JSON с историей
      res.json({
        visited,
        finalStatus: response.status,
        message: 'Final content is not HTML',
      });
    }

  } catch (error) {
    res.status(500).json({
      error: error.message,
      visited
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
});