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

  try {
    let currentUrl = url;
    let response;

    // Ручной редирект
    for (let i = 0; i < 10; i++) {
      response = await axios.get(currentUrl, {
        headers,
        maxRedirects: 0,
        validateStatus: status => status >= 200 && status < 400
      });

      if (response.status >= 300 && response.status < 400 && response.headers.location) {
        const location = response.headers.location;
        currentUrl = new URL(location, currentUrl).href;
      } else if (response.status === 200) {
        // Получили успешный финальный URL
        break;
      }
    }

    // Загружаем финальный URL с разрешёнными редиректами
    const finalResponse = await axios.get(currentUrl, {
      headers,
      maxRedirects: 5, // на всякий случай
      responseType: 'text'
    });

    res.set("Content-Type", finalResponse.headers['content-type'] || "text/html");
    res.send(finalResponse.data);

  } catch (error) {
    res.status(500).send("Error: " + error.message);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
});