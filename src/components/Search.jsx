import React, { useEffect, useState } from "react";

const Search = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [favorite, setFavoriteArticle] = useState([]);

  const setFavArticle = (data) => {
    setFavoriteArticle(data);
    console.log(data);
    console.log(favorite);
  }

  const fetchArticles = async () => {
    if (!searchTerm) return alert("Enter a search term");
  
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/news/${encodeURIComponent(searchTerm)}`);
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
              <button className="btn btn-primary mt-2" onClick={()=>setFavArticle([article.title, article.author, article.urlToImage, article.url])}>Save Article</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};


export default Search;
