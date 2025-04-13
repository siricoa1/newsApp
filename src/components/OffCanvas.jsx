import React, { useState, useMemo } from 'react';
import Offcanvas from 'react-bootstrap/Offcanvas';
import { signOut } from "firebase/auth";
import { auth } from '../../firebase/firebaseConfig'

function OffNav({ user }) {
  const [show, setShow] = useState(false);
  const memoizedProfileImage = useMemo(() => user.photoURL, [user.photoURL]);
  const memoizedDisplayName = useMemo(() => user.displayName, [user.displayName]);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const handleSignOut = () => {
    signOut(auth).catch((error) => console.error("Error signing out:", error));
  };

  return (
    <>
        <a><img src={memoizedProfileImage} id='userProfileImg' onClick={handleShow}></img></a>
        <Offcanvas show={show} onHide={handleClose}>
            <Offcanvas.Header closeButton>
                <Offcanvas.Title>{memoizedDisplayName}</Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body>
                <button className="btn btn-danger" onClick={handleSignOut}>
                    Logout
                </button>
            </Offcanvas.Body>
        </Offcanvas>
    </>
  );
}

export default OffNav;