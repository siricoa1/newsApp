const express = require("express");
const path = require("path");
const http = require('https');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());

app.get("/api/titles/:title", (req, res) => {
    const options = {
      method: "GET",
      hostname: "moviesdatabase.p.rapidapi.com",
      port: null,
      path: `/titles/search/title/${encodeURIComponent(req.params.title)}`,
      headers: {
        "x-rapidapi-key": process.env.RAPID_API_KEY,
        "x-rapidapi-host": "moviesdatabase.p.rapidapi.com",
      },
    };
  
    const request = http.request(options, function (response) {
      let chunks = [];
  
      response.on("data", (chunk) => {
        chunks.push(chunk);
      });
  
      response.on("end", () => {
        try {
          const body = Buffer.concat(chunks).toString();
          console.log("API Response:", body);
          const jsonResponse = JSON.parse(body);
          res.json(jsonResponse);
        } catch (error) {
          res.status(500).json({ error: "Invalid JSON response", details: error.message });
        }
      });
    });
  
    request.on("error", (error) => {
      res.status(500).json({ error: "API request failed", details: error.message });
    });
  
    request.end();
});




app.use(express.static(path.join(__dirname, "dist")));


app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
