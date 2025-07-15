import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./NavBar.css";

const NavBar = () => {
  const navigate = useNavigate();

  const stored = localStorage.getItem("user");
  const userObj = stored ? JSON.parse(stored) : null;
  const photoUrl = userObj?.photo || userObj?.photoURL || "https://cdn-icons-png.flaticon.com/512/1946/1946429.png";
  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/", {replace:true});
    window.location.reload();
  };

  return (
    <nav className="navbar">
      <div className="main-logo">BLINK</div>
      <div className="main-menu">
       
        <Link to="/eye">MAIN</Link>
        <Link to="/recommend">MUSIC</Link>
        <Link to="/stats">STATS</Link>
        <Link to="/profile">PROFILE/SETTING</Link>
        
    
      </div>
      <div 
        className="profile-area" 
        style={{ display: "flex", alignItems: "center", gap: "8px" }}
      >  
        <img
          src={photoUrl}
          alt="profile"
          className="profile-icon"
        />
        <button className="logout-btn" onClick={handleLogout}>로그아웃</button>
      </div>
    </nav>
  )
};

export default NavBar;