import React from "react";

const Home = ({ user }) => {
  return (
    <h1>Welcome back {user.displayName}</h1>
  );
};

export default Home;
