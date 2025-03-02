import React from "react";
import { Link } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from '../../firebase/firebaseConfig'

const Nav = ({ routes, user }) => {
    const handleSignOut = () => {
      signOut(auth).catch((error) => console.error("Error signing out:", error));
    };
  
    return (    
      <nav className="navbar bg-dark border-bottom border-body" data-bs-theme="dark">
        <div className="container-fluid">
          <a className="navbar-brand">News App</a>
          <div className="d-flex">
            {routes.map((route, index) => (
              <Link key={index} className="btn btn-outline-light me-2" to={route.path}>
                {route.name}
              </Link>
            ))}
            {user && (
              <button className="btn btn-danger" onClick={handleSignOut}>
                Logout
              </button>
            )}
          </div>
        </div>
      </nav>
    );
  };

export default Nav;
