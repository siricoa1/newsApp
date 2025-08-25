import React, { useEffect, useState } from "react";

const Search = ({ user }) => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const setFavoriteArticle = (data) => {
    // remember to change back to "http://localhost:5000" for dev
    fetch('https://newsapiapp-a86c0a79e477.herokuapp.com/api/article',{
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }).then(response => response.json()).then(data =>{
      console.log('success', data);
    }).catch(error => {
      console.error('Error:', error);
    })
  }

  const fetchArticles = async () => {
    if (!searchTerm) return alert("Enter a search term");
  
    setLoading(true);
    try {
      // remember to change back to "http://localhost:5000" for dev
      const response = await fetch(`https://newsapiapp-a86c0a79e477.herokuapp.com/news/${encodeURIComponent(searchTerm)}`);
      const data = await response.json();
      console.log("Fetched Data:", data);

      setArticles(data.results || data.articles || []); 
    } catch (error) {
      console.error("Error fetching titles:", error);
    }
    setLoading(false);
  };
  return (
    <div className="container text-center mt-5">
      <h1 className="text-primary">Search Articles</h1>
      <input
        type="text"
        className="form-control mb-2"
        placeholder="Enter relevant word or phrase"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <button className="btn btn-primary" onClick={fetchArticles}>
        {loading ? "Loading..." : "Get articles"}
      </button>

      {articles.length > 0 && (
        <ul className="list-group mt-3">
          {articles.map((article, index) => (
            <div key={article.id} className="homeArticleDiv">
              <li key={index} className="list-group-item d-flex flex-column align-items-center text-center">
                <h5>{article.title}</h5>
                <p>{article.author}</p>
                <img 
                  src={article.urlToImage} 
                  className="img-fluid img-thumbnail my-2" 
                  alt="Image Unavailable"
                  style={{ maxWidth: '100%', height: 'auto', maxHeight: '400px' }} 
                />
                <a href={article.url} className="btn btn-primary mt-2">Read More</a>
                <button className="btn btn-primary mt-2" onClick={()=>setFavoriteArticle([user.email, article.title, article.author, article.urlToImage, article.url])}>Save Article</button>
              </li>
            </div>
          ))}
        </ul>
      )}
    </div>
  );
};


export default Search;
