import React from "react";
import { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import Home from './components/Home';
import Nav from './components/Nav';
import Search from './components/Search';
import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from "firebase/auth";
import { auth } from '../firebase/firebaseConfig';

const routes = [
  { path: "/", name: "Home" },
  { path: "/search", name: "Search" }
];

const App = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  const handlePost = (data) => {
    fetch('https://newsapiapp-a86c0a79e477.herokuapp.com/api/user',{
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
  };

  const handleSignIn = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
      .then((result) => {
        console.log("User signed in:", result.user);
        setUser(result.user);
        handlePost(result.user);
      })
      .catch((error) => console.error("Popup sign-in error:", error));
  };
  

  if (!user) {
    return (
      <div className="login-container">
        <h2>Please Sign In</h2>
        <button id="loginBtn" className="btn btn-outline-light" onClick={handleSignIn}>Sign In with Google</button>
      </div>
    );
  }
  return (
    <div>
        <Nav routes={routes} user={user}/>
        <Routes>
            <Route path="/" element={<Home user={user}/>} />
            <Route path="/search" element={<Search user={user}/>} />
        </Routes>
    </div>
  );
};

export default App;
