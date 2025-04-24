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

  try {
    let currentUrl = url;
    let response;

    for (let i = 0; i < 10; i++) {
      visited.push({ url: currentUrl });

      response = await axios.get(currentUrl, {
        headers,
        maxRedirects: 0,
        validateStatus: status => status >= 200 && status < 400
      });

      visited[visited.length - 1].status = response.status;

      if (response.status >= 300 && response.status < 400 && response.headers.location) {
        const location = response.headers.location;
        currentUrl = new URL(location, currentUrl).href;
      } else {
        break;
      }
    }

    if (response.status === 200 && response.headers['content-type']?.includes("text/html")) {
      res.set("Content-Type", "application/json");
      res.send(JSON.stringify({
        visited,
        finalStatus: response.status,
        html: response.data
      }));
    } else {
      res.json({
        visited,
        finalStatus: response.status,
        finalHeaders: response.headers
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