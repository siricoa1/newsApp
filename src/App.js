import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from './components/Home';
import Nav from './components/Nav';
import Search from './components/Search';

const routes = [
  { path: "/", name: "Home" },
  { path: "/search", name: "Search" }
];

const App = () => {
  return (
    <div>
        <Nav routes={routes} />
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<Search />} />
        </Routes>
    </div>
  );
};

export default App;
