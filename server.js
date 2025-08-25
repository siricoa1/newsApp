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

let db
let dbWithDatabase

if (process.env.JAWSDB_URL) {
  db = mysql.createConnection(process.env.JAWSDB_URL);
  dbWithDatabase = mysql.createConnection(process.env.JAWSDB_URL);
} else {
  db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  });

  dbWithDatabase = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });
}


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
        console.log('Creating Table!.');
        db.query(`CREATE TABLE ${process.env.DB_NAME}.${process.env.USER_TABLE} (id INT AUTO_INCREMENT PRIMARY KEY, email VARCHAR(50), name VARCHAR(50))`, (err, result) => {
          if (err){
            console.error('error creating table:', err);
          }
          console.log('Table created successfully');
        })
      }
    }
  );

  const articleTabe = process.env.ARTICLE_TABLE;

  db.query(
    `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?`, 
    [database, articleTabe], 
    (err, result) => {
      if (err) {
        console.error('Error finding table:', err);
        return;
      }
  
      if (result.length > 0) {
        console.log('Table Found!');
      } else {
        console.log('Creating Table!.');
        db.query(`CREATE TABLE ${process.env.DB_NAME}.${process.env.ARTICLE_TABLE} (id INT AUTO_INCREMENT PRIMARY KEY, title VARCHAR(200), author VARCHAR(50), img VARCHAR(2049), url VARCHAR(2049))`, (err, result) => {
          if (err){
            console.error('error creating table:', err);
          }
          console.log('Table created successfully');
        })
      }
    }
  );

  const favoriteTable = process.env.FAVORITES_TABLE;

  db.query(
    `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?`, 
    [database, favoriteTable], 
    (err, result) => {
      if (err) {
        console.error('Error finding table:', err);
        return;
      }
  
      if (result.length > 0) {
        console.log('Table Found!');
      } else {
        console.log('Creating Table!.');
        db.query(`CREATE TABLE ${process.env.DB_NAME}.${process.env.FAVORITES_TABLE} (uid INT NOT NULL, aid INT NOT NULL, PRIMARY KEY (uid, aid), FOREIGN KEY(uid) REFERENCES Users(id) ON DELETE CASCADE, FOREIGN KEY(aid) REFERENCES ARTICLES(id) ON DELETE CASCADE)`, (err, result) => {
          if (err){
            console.error('error creating table:', err);
          }
          console.log('Table created successfully');
        })
      }
    }
  );

});

app.post('/api/user', (req, res) => {

  const email = req.body.email;
  const name = req.body.displayName;

  const userTable = process.env.USER_TABLE;

  const userSearch = `SELECT * FROM ${userTable} WHERE email = ?`

  dbWithDatabase.query(userSearch, [email], (err, result) => {
    if(err) {
      console.error('Error:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    if (result.length > 0) {
      return res.json({ exists: true, message: 'User already exists' });
    }
    const insertQuery = `INSERT INTO ${userTable} (email, name) VALUES (?, ?)`;

    dbWithDatabase.query(insertQuery, [email, name], (err, result) => {
      if(err){
        console.error("Error:", err);
        return res.status(500).json({ error: 'Error creating user' });
      }
      return res.status(201).json({ message: 'User created successfully', result});
    })
  });
});

app.post('/api/article', (req, res) => {
  const userEmail = req.body[0];
  const title = req.body[1];
  const author = req.body[2];
  const imgURL = req.body[3];
  const articleURL = req.body[4];

  const articleTable = process.env.ARTICLE_TABLE;
  const favoriteTable = process.env.FAVORITES_TABLE;
  const userTable = process.env.USER_TABLE;

  const articleSearch = `SELECT * FROM ${articleTable} WHERE title = ? AND author = ?`;
  const favoriteSearch = `SELECT * FROM ${favoriteTable} WHERE aid = ? AND uid = ?`;
  const userSearch = `SELECT id FROM ${userTable} WHERE email = ?`;
  const insertFavoriteQuery = `INSERT INTO ${favoriteTable} (uid, aid) VALUES (?, ?)`;
  const insertQuery = `INSERT INTO ${articleTable} (title, author, img, url) VALUES (?, ?, ?, ?)`;

  dbWithDatabase.query(articleSearch, [title, author], (err, articleResult) => {
    if (err) {
      console.error('Error:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    if (articleResult.length > 0) {
      const articleID = articleResult[0].id;

      dbWithDatabase.query(userSearch, [userEmail], (error, userResult) => {
        if (error) {
          console.error('Error:', error);
          return res.status(500).json({ error: 'Internal Server Error' });
        }

        if (userResult.length > 0) {
          const userID = userResult[0].id;

          dbWithDatabase.query(favoriteSearch, [articleID, userID], (err, favoriteResult) => {
            if (err) {
              console.error('Error:', err);
              return res.status(500).json({ error: 'Internal Server Error' });
            }

            if (favoriteResult.length > 0) {
              return res.json({ exists: true, message: 'Article already exists' });
            }

            dbWithDatabase.query(insertFavoriteQuery, [userID, articleID], (err, result) => {
              if (err) {
                console.error("Error:", err);
                return res.status(500).json({ error: 'Error adding favorite' });
              }
              return res.status(201).json({ message: 'Article added successfully', result });
            });
          });
        }
      });

      return;
    }

    dbWithDatabase.query(insertQuery, [title, author, imgURL, articleURL], (err, insertResult) => {
      if (err) {
        console.error("Error:", err);
        return res.status(500).json({ error: 'Error creating article' });
      }

      const newArticleID = insertResult.insertId;

      dbWithDatabase.query(userSearch, [userEmail], (error, userResult) => {
        if (error) {
          console.error('Error:', error);
          return res.status(500).json({ error: 'Internal Server Error' });
        }

        if (userResult.length > 0) {
          const userID = userResult[0].id;

          dbWithDatabase.query(insertFavoriteQuery, [userID, newArticleID], (err, result) => {
            if (err) {
              console.error("Error:", err);
              return res.status(500).json({ error: 'Error adding favorite' });
            }
            return res.status(201).json({ message: 'Article added and created successfully', result });
          });
        }
      });
    });
  });
});

app.get("/api/favorites", async (req, res) => {

  const favoriteTable = process.env.FAVORITES_TABLE;
  const userTable = process.env.USER_TABLE;
  const articleTable = process.env.ARTICLE_TABLE;
  const userEmail = req.query.userID;

  const userSearch = `SELECT id FROM ${userTable} WHERE email = ?`

  dbWithDatabase.query(userSearch, [userEmail], (err, userResult) => {
    if(err) {
      console.error('Error:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    if (userResult.length > 0) {
      const userID = userResult[0].id;
      const getArticles = `SELECT ${articleTable}.* FROM ${favoriteTable} JOIN ${articleTable} ON ${favoriteTable}.aid = ${articleTable}.id WHERE ${favoriteTable}.uid = ?`;
      dbWithDatabase.query(getArticles,[userID], (err, userResult) => {
        if (err) {
          console.error("Error:", err);
          return res.status(500).json({ error: 'Error getting results' });
        }
        res.json(userResult)
      })
    }
  });
});

app.delete('/api/remove', async (req, res) => {
  const articleID = req.query.aid
  const userEmail = req.query.userEmail
  const favoriteTable = process.env.FAVORITES_TABLE;
  const userTable = process.env.USER_TABLE;
  const userSearch = `SELECT id FROM ${userTable} WHERE email = ?`

  dbWithDatabase.query(userSearch, [userEmail], (err, userResult) => {
    if(err) {
      console.error('Error:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    if (userResult.length > 0) {
      const userID = userResult[0].id;
      const deleteQuery = `DELETE FROM ${favoriteTable} WHERE aid = ? AND uid = ? LIMIT 1`
      dbWithDatabase.query(deleteQuery, [articleID, userID], (err, deleteResult) => {
        if (err) {
          console.error("Error:",err);
          return res.status(500).json({ error: 'Error deleting value'})
        }
        res.json(deleteResult);
      })
    }
  });
})

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
