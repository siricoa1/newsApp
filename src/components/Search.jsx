import React, { useState } from "react";

const Search = () => {
  const [titles, settitles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [movieTitle, setmovieTitle] = useState("");

  const fetchtitles = async () => {
    if (!movieTitle) return alert("Enter a movie title");
  
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/titles/${movieTitle}`);
      const data = await response.json();
      console.log("Fetched Data:", data);

      settitles(data.results || data.titles || []); 
    } catch (error) {
      console.error("Error fetching titles:", error);
    }
    setLoading(false);
  };
  return (
    <div className="container text-center mt-5">
      <h1 className="text-primary">Movie titles</h1>
      <input
        type="text"
        className="form-control mb-2"
        placeholder="Enter Movie ID"
        value={movieTitle}
        onChange={(e) => setmovieTitle(e.target.value)}
      />
      <button className="btn btn-primary" onClick={fetchtitles}>
        {loading ? "Loading..." : "Get titles"}
      </button>

      {titles.length > 0 && (
        <ul className="list-group mt-3">
          {titles.map((title, index) => (
            <li key={index} className="list-group-item">
              <p>{title.originalTitleText.text}</p>
              {title.releaseYear?.year && <p>{title.releaseYear.year}</p>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Search;
