import React, { useEffect, useState, useMemo } from "react";

const Home = ({ user }) => {
  const [userProfileImage, setImage] = useState(null);
  const [userDisplayName, setName] = useState(null);

  useEffect(() => {
    if(user.photoURL !== userProfileImage) {
      setImage(user.photoURL);
    } 
    setName(user.displayName);
  }, [user, userProfileImage]);

  const memoizedProfileImage = useMemo(() => userProfileImage, [userProfileImage]);
  return (
    <div>
      <h1>Welcome back {userDisplayName}</h1>
      <img src={memoizedProfileImage} id='userProfileImg'></img>
    </div>
  );
};

export default Home;