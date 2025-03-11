import React from "react";

const Home = ({ user }) => {
  console.log(user);
  return (
    <div>
      <h1>Welcome back {user.displayName}</h1>
      <img src={user.photoURL} id='userProfileImg'></img>
    </div>
  );
};

export default Home;
