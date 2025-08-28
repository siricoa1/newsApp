const express = require("express");
const path = require("path");
const https = require("https");
const cors = require("cors");
const mysql = require("mysql2");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  next();
});

let pool;

if (process.env.JAWSDB_URL) {
  pool = mysql.createPool(process.env.JAWSDB_URL);
} else {
  pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

  pool.query(
    `CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\``,
    (err) => {
      if (err) console.error("Error creating database:", err);
      else console.log("Database checked/created successfully");
    }
  );
}

const db = pool;

db.query(
  `CREATE TABLE IF NOT EXISTS ${process.env.USER_TABLE} (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(50) UNIQUE,
    name VARCHAR(50)
  )`,
  (err) => err && console.error("Error creating user table:", err)
);

db.query(
  `CREATE TABLE IF NOT EXISTS ${process.env.ARTICLE_TABLE} (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200),
    author VARCHAR(50),
    img VARCHAR(2049),
    url VARCHAR(2049)
  )`,
  (err) => err && console.error("Error creating article table:", err)
);

db.query(
  `CREATE TABLE IF NOT EXISTS ${process.env.FAVORITES_TABLE} (
    uid INT NOT NULL,
    aid INT NOT NULL,
    PRIMARY KEY (uid, aid),
    FOREIGN KEY(uid) REFERENCES ${process.env.USER_TABLE}(id) ON DELETE CASCADE,
    FOREIGN KEY(aid) REFERENCES ${process.env.ARTICLE_TABLE}(id) ON DELETE CASCADE
  )`,
  (err) => err && console.error("Error creating favorites table:", err)
);

app.post("/api/user", (req, res) => {
  const email = req.body.email;
  const name = req.body.displayName;
  const userTable = process.env.USER_TABLE;

  const userSearch = `SELECT * FROM ${userTable} WHERE email = ?`;

  db.query(userSearch, [email], (err, result) => {
    if (err) return res.status(500).json({ error: "Internal Server Error" });
    if (result.length > 0) {
      return res.json({ exists: true, message: "User already exists" });
    }

    const insertQuery = `INSERT INTO ${userTable} (email, name) VALUES (?, ?)`;
    db.query(insertQuery, [email, name], (err, insertResult) => {
      if (err) return res.status(500).json({ error: "Error creating user" });
      return res
        .status(201)
        .json({ message: "User created successfully", result: insertResult });
    });
  });
});

app.post("/api/article", (req, res) => {
  const { userID, title, author, img, url, displayName } = req.body;
  const userTable = process.env.USER_TABLE;
  const articleTable = process.env.ARTICLE_TABLE;
  const favoritesTable = process.env.FAVORITES_TABLE;

  pool.query(
    `INSERT IGNORE INTO ${userTable} (email, name) VALUES (?, ?)`,
    [userID, displayName || null],
    (err) => {
      if (err) {
        console.error("Error inserting user:", err);
        return res.status(500).json({ error: "Error inserting user" });
      }

      pool.query(
        `SELECT id FROM ${userTable} WHERE email = ?`,
        [userID],
        (err, userRows) => {
          if (err) {
            console.error("User lookup error:", err);
            return res.status(500).json({ error: "User lookup error" });
          }
          if (userRows.length === 0) {
            return res.status(404).json({ error: "User not found" });
          }

          const uid = userRows[0].id;

          pool.query(
            `INSERT IGNORE INTO ${articleTable} (title, author, img, url) VALUES (?, ?, ?, ?)`,
            [title, author, img, url],
            (err) => {
              if (err) {
                console.error("Error inserting article:", err);
                return res.status(500).json({ error: "Error inserting article" });
              }

              pool.query(
                `SELECT id FROM ${articleTable} WHERE title = ? AND url = ?`,
                [title, url],
                (err, articleRows) => {
                  if (err) {
                    console.error("Article lookup error:", err);
                    return res.status(500).json({ error: "Article lookup error" });
                  }
                  if (articleRows.length === 0) {
                    return res.status(404).json({ error: "Article not found" });
                  }
                  const aid = articleRows[0].id;

                  pool.query(
                    `INSERT IGNORE INTO ${favoritesTable} (uid, aid) VALUES (?, ?)`,
                    [uid, aid],
                    (err) => {
                      if (err) {
                        console.error("Error saving favorite:", err);
                        return res.status(500).json({ error: "Error saving favorite" });
                      }
                      res.json({ message: "Favorite saved!" });
                    }
                  );
                }
              );
            }
          );
        }
      );
    }
  );
});




app.get("/api/favorites", (req, res) => {
  const favoriteTable = process.env.FAVORITES_TABLE;
  const userTable = process.env.USER_TABLE;
  const articleTable = process.env.ARTICLE_TABLE;
  const userEmail = req.query.userID;

  const userSearch = `SELECT id FROM ${userTable} WHERE email = ?`;

  db.query(userSearch, [userEmail], (err, userResult) => {
    if (err) return res.status(500).json({ error: "Internal Server Error" });
    if (userResult.length === 0) return res.json([]);

    const userID = userResult[0].id;
    const getArticles = `
      SELECT ${articleTable}.* 
      FROM ${favoriteTable} 
      JOIN ${articleTable} ON ${favoriteTable}.aid = ${articleTable}.id 
      WHERE ${favoriteTable}.uid = ?`;

    db.query(getArticles, [userID], (err, articles) => {
      if (err) return res.status(500).json({ error: "Error getting results" });
      res.json(articles);
    });
  });
});

app.delete("/api/remove", (req, res) => {
  const articleID = req.query.aid;
  const userEmail = req.query.userEmail;
  const favoriteTable = process.env.FAVORITES_TABLE;
  const userTable = process.env.USER_TABLE;

  const userSearch = `SELECT id FROM ${userTable} WHERE email = ?`;

  db.query(userSearch, [userEmail], (err, userResult) => {
    if (err) return res.status(500).json({ error: "Internal Server Error" });
    if (userResult.length === 0) return res.status(404).json({ error: "User not found" });

    const userID = userResult[0].id;
    const deleteQuery = `DELETE FROM ${favoriteTable} WHERE aid = ? AND uid = ? LIMIT 1`;

    db.query(deleteQuery, [articleID, userID], (err, deleteResult) => {
      if (err) return res.status(500).json({ error: "Error deleting value" });
      res.json(deleteResult);
    });
  });
});

app.get("/news/:searchTerm", (req, res) => {
  const searchParam = req.params.searchTerm.replace(/\s/g, "+");

  const options = {
    hostname: "newsapi.org",
    path: `/v2/everything?q=${searchParam}&sortBy=relevancy&language=en&apiKey=${process.env.NEWS_API_KEY}`,
    headers: { "User-Agent": "MyNewsApp/1.0" },
  };

  https
    .get(options, (apiRes) => {
      let data = "";
      apiRes.on("data", (chunk) => (data += chunk));
      apiRes.on("end", () => {
        try {
          const parsedData = JSON.parse(data);
          res.json(parsedData);
        } catch (error) {
          res.status(500).json({ error: "Failed to parse response" });
        }
      });
    })
    .on("error", (err) => res.status(500).json({ error: err.message }));
});


app.use(express.static(path.join(__dirname, "dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
