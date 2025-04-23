const express = require("express");
const axios = require("axios");
const app = express();

app.get("/proxy", async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).send("No URL");

  // Конфигурация прокси (без аутентификации)
  const proxyConfig = {
    host: '58.69.194.136',   // Замените на ваш внешний прокси сервер
    port: 8081                   // Порт прокси сервера
  };

  try {
    // Запрос через прокси
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9,ru;q=0.8',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      },
      proxy: proxyConfig // Используем прокси-конфигурацию без аутентификации
    });
    
    res.set("Content-Type", "text/html");
    res.send(response.data);
  } catch (err) {
    res.status(500).send("Proxy error: " + err.message);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Proxy server is running on port " + PORT));