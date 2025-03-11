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

app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  next();
});


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

  const database = process.env.DB_NAME;

  db.query(`CREATE DATABASE IF NOT EXISTS ${database}`, (err, result) => {
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

  const userTable = process.env.USER_TABLE;

  db.query(
    `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?`, 
    [database, userTable], 
    (err, result) => {
      if (err) {
        console.error('Error finding table:', err);
        return;
      }
  
      if (result.length > 0) {
        console.log('Table Found!');
      } else {
        console.log('Table does not exist.');
      }
    }
  );
});
//If desired, can include date limit on how far back articles go in the "from" parameter.
//${year}-${month}-${day}
app.get("/news/:searchTerm", (req, res) => {
  const searchParam = req.params.searchTerm
  const replacedSearchParam = searchParam.replace(/\s/g,'+');
  const options = {
    hostname: "newsapi.org",
    path: `/v2/everything?q=${replacedSearchParam}&sortBy=relevancy&language=en&apiKey=${process.env.NEWS_API_KEY}`,
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
