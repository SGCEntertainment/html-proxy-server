const express = require("express");
const axios = require("axios");
const http = require("http");
const https = require("https");
const app = express();

// Конфигурация прокси (без аутентификации)
const proxyConfig = {
  host: '58.69.194.136',   // Замените на ваш внешний прокси сервер
  port: 8081                // Порт прокси сервера
};

// Создаём агент для HTTP-прокси
const httpAgent = new http.Agent({  
  host: proxyConfig.host, 
  port: proxyConfig.port 
});

// Создаём агент для HTTPS-прокси
const httpsAgent = new https.Agent({
  host: proxyConfig.host, 
  port: proxyConfig.port
});

app.get("/proxy", async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).send("No URL");

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
      // Указание агентов для HTTP и HTTPS
      httpAgent: httpAgent,
      httpsAgent: httpsAgent
    });

    res.set("Content-Type", "text/html");
    res.send(response.data);
  } catch (err) {
    res.status(500).send("Proxy error: " + err.message);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Proxy server is running on port " + PORT));