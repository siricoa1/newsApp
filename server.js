const express = require("express");
const path = require("path");
const https = require('https');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());

const today = new Date();
const sevenDaysAgo = new Date();
sevenDaysAgo.setDate(today.getDate() - 7);

const year = today.getFullYear();
const month = String(today.getMonth() + 1).padStart(2, '0');
const day = String(sevenDaysAgo.getDate()).padStart(2, '0');
console.log(year+''+ month+''+ day)
app.get("/news/:searchTerm", (req, res) => {
  const searchParam = req.params.searchTerm
  const options = {
    hostname: "newsapi.org",
    path: `/v2/everything?q=${searchParam}&from=${year}-${month}-${day}&sortBy=publishedAt&language=en&apiKey=${process.env.NEWS_API_KEY}`,
    headers: {
      "User-Agent": "MyNewsApp/1.0",
    },
  };

  https.get(options, (apiRes) => {
    let data = "";

    apiRes.on("data", (chunk) => {
      data += chunk;
    });

    apiRes.on("end", () => {
      try {
        const parsedData = JSON.parse(data);
        res.json(parsedData);
      } catch (error) {
        res.status(500).json({ error: "Failed to parse response" });
      }
    });

  }).on("error", (err) => {
    res.status(500).json({ error: err.message });
  });
});

app.use(express.static(path.join(__dirname, "dist")));


app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
