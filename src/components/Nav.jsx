import React from "react";
import { Link } from "react-router-dom";

const Nav = ({ routes }) => {
  return (    
    <nav className="navbar bg-dark border-bottom border-body" data-bs-theme="dark">
        <div className="container-fluid">
            <a className="navbar-brand">Movie Review</a>
            <div className="d-flex">
                {routes.map((route, index) => (
                    <Link key={index} className="btn btn-outline-light me-2" to={route.path}>
                        {route.name}
                    </Link>
                ))}
            </div>
        </div>
    </nav>
  );
};

export default Nav;
