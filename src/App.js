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

  const handleSignIn = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider).catch((error) => console.error(error));
  };

  if (!user) {
    return (
      <div className="login-container">
        <h2>Please Sign In</h2>
        <button onClick={handleSignIn}>Sign In with Google</button>
      </div>
    );
  }
  return (
    <div>
        <Nav routes={routes} user={user}/>
        <Routes>
            <Route path="/" element={<Home user={user}/>} />
            <Route path="/search" element={<Search />} />
        </Routes>
    </div>
  );
};

export default App;
