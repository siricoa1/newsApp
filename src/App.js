import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import Home from './components/Home';
import Nav from './components/Nav';


const App = () => {
  return (
    <div>
        <Nav></Nav>
        <Routes>
            <Route path="/" element={<Home />} />
            {/* <Route path="/about" element={<About />} /> */}
        </Routes>
    </div>
  );
};

export default App;
