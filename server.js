const express = require("express");
const path = require("path");
const https = require('https');
const cors = require('cors');
const mysql = require('mysql2');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const today = new Date();
const sevenDaysAgo = new Date();
sevenDaysAgo.setDate(today.getDate() - 7);

const year = today.getFullYear();
const month = String(today.getMonth() + 1).padStart(2, '0');
const day = String(sevenDaysAgo.getDate()).padStart(2, '0');
console.log(year+''+ month+''+ day);

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }

  db.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`, (err, result) => {
    if (err) {
      console.error('Error creating database:', err);
      return;
    }

    console.log('Database checked/created successfully');

    const dbWithDatabase = mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    dbWithDatabase.connect((err) => {
      if (err) {
        console.error('Error connecting to the database:', err);
        return;
      }
      console.log('Connected to the database');
    });
  });
});

app.get("/news/:searchTerm", (req, res) => {
  const searchParam = req.params.searchTerm
  const replacedSearchParam = searchParam.replace(/\s/g,'+');
  const options = {
    hostname: "newsapi.org",
    path: `/v2/everything?q=${replacedSearchParam}&from=${year}-${month}-${day}&sortBy=publishedAt&language=en&apiKey=${process.env.NEWS_API_KEY}`,
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
