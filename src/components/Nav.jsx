import React, { useMemo } from "react";
import { Link } from "react-router-dom";

import OffNav from "./OffCanvas";

const Nav = ({ routes, user }) => {
    const memoizedDisplayName = useMemo(() => user.displayName, [user.displayName]);
  
    return (    
      <nav className="navbar bg-dark border-bottom border-body" data-bs-theme="dark">
        <div className="container-fluid">
          <div>
            <OffNav user={user}></OffNav>
            <a className="navbar-brand" style={{marginLeft: '10px'}}>Logged in as: {memoizedDisplayName}</a>
          </div>
          <div className="d-flex">
            {routes.map((route, index) => (
              <Link key={index} className="btn btn-outline-light me-2 navBtns" to={route.path}>
                {route.name}
              </Link>
            ))}
          </div>
        </div>
      </nav>
    );
  };

export default Nav;
