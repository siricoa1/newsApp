import React, { useState, useEffect, useMemo } from "react";

const Home = ({ user }) => {

  const [favoriteArticles, setFavoriteArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const memoizedProfileImage = useMemo(() => user.photoURL, [user.photoURL]);
  const memoizedDisplayName = useMemo(() => user.displayName, [user.displayName]);

  const fetchArticles = async (userEmail) => {
    setLoading(true);
    
    try {
      const response = await fetch(`http://localhost:5000/api/favorites?userID=${userEmail}`, {
        method: 'GET',
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      const data = await response.json();
      console.log("Article Data:", data);
      setFavoriteArticles(data);
    } catch (error) {
      console.error("Error fetching articles:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() =>{
    if (user){
      console.log("fetch articles running")
      console.log(user.email);
      fetchArticles(user.email);
    }
  }, [user]);

  const removeArticle = (data) => {
    const emailData = data[0]
    fetch(`http://localhost:5000/api/remove?aid=${data[1]}&userEmail=${data[0]}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
    }).then(response => response.json()).then(data => {
      console.log('success', data);
      fetchArticles(emailData);
    }).catch(error => {
      console.error("Error:",error);
    })
  }

  return (
    <div id='homeContainer'>
      <div id='homeProfileDiv'>
        <img src={memoizedProfileImage} id='userProfileImg'></img>
        <h1 id='welcomeTitle'>{memoizedDisplayName}</h1>
      </div>
      <h1 id='homeSavedArticles'>{loading ? "Loading..." : ""}</h1>
      <div  className="container text-center mt-5">
        <ol  className="list-group mt-3">
          {favoriteArticles.map((article) => (
            <div key={article.id} className="homeArticleDiv">
              <li className="list-group-item d-flex flex-column align-items-center text-center">
                <h1>{article.title}</h1>
                <h3>{article.author}</h3>
                <img src={article.img} className="img-fluid img-thumbnail my-2" alt="Image Unavailable" style={{ maxWidth: '100%', height: 'auto', maxHeight: '400px' }} ></img>
                <a href={article.url} className="btn btn-primary mt-2">Read More</a>
                <button className="btn btn-danger mt-2" onClick={()=>removeArticle([user.email, article.id])}>Remove Article</button>
              </li>
            </div>
          ))}
        </ol>
      </div>
    </div>
  );
};

export default Home;