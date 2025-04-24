const express = require('express');
const axios = require('axios');
const app = express();

app.get('/', async (req, res) => {
  const startUrl = req.query.url;
  if (!startUrl) return res.status(400).send("No URL provided");

  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    'Accept': 'text/html',
    'Referer': 'https://google.com/',
    'Origin': 'https://google.com',
    'Connection': 'keep-alive'
  };

  const visited = [];
  let currentUrl = startUrl;
  let finalResponse = null;

  try {
    for (let i = 0; i < 10; i++) {
      visited.push({ url: currentUrl });

      const response = await axios.get(currentUrl, {
        headers,
        maxRedirects: 0,
        validateStatus: status => status >= 200 && status < 400
      });

      visited[visited.length - 1].status = response.status;

      if (response.status >= 300 && response.status < 400 && response.headers.location) {
        currentUrl = new URL(response.headers.location, currentUrl).href;
      } else {
        // Успешный финальный ответ
        finalResponse = response;
        break;
      }
    }

    if (!finalResponse) {
      throw new Error('Too many redirects or no final page reached');
    }

    // Отдаём HTML
    res.set("Content-Type", "text/html");
    res.send(finalResponse.data);

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