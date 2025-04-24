const express = require('express');
const axios = require('axios');
const app = express();

// Обработка запросов с параметром URL
app.get('/', async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).send("No URL provided");

  try {
    // Прокси-запрос через Axios с имитацией запроса от браузера
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9,ru;q=0.8',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Cache-Control': 'max-age=0', // Запрещаем кеширование
        'DNT': '1' // Do Not Track
      },
      maxRedirects: 5, // Лимит на количество редиректов
      timeout: 10000 // Таймаут 10 секунд
    });

    // Отправка ответа от прокси
    res.set("Content-Type", "text/html");
    res.send(response.data);
  } catch (error) {
    console.error("Error fetching the URL: ", error.message);
    res.status(500).send("Error fetching the URL: " + error.message);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
});