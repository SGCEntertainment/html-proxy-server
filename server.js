const express = require('express');
const axios = require('axios');
const app = express();

app.get('/', async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).send("No URL provided");

  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
  };

  let visitedUrls = [];
  let currentUrl = url;
  let response;

  try {
    for (let i = 0; i < 10; i++) {
      visitedUrls.push(currentUrl);

      response = await axios.get(currentUrl, {
        headers,
        maxRedirects: 0,
        validateStatus: status => status >= 200 && status < 400 // включаем 3xx
      });

      if (response.status >= 300 && response.status < 400 && response.headers.location) {
        // Обрабатываем абсолютный и относительный редирект
        const location = response.headers.location;
        currentUrl = new URL(location, currentUrl).href;
      } else {
        break;
      }
    }

    res.json({
      visitedUrls,
      finalStatus: response.status
    });

  } catch (error) {
    res.status(500).json({
      error: error.message,
      visitedUrls
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
});