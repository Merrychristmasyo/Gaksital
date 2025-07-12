import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./NavBar.css";

const NavBar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/", {replace:true});
    window.location.reload();
  };

  return (
    <nav className="navbar">
      <div className="main-logo">GAKSITAL</div>
      <div className="main-menu">
        <Link to="/profile">프로필 | 설정</Link>
        <Link to="/stats">나의 통계</Link>
        <Link to="/recommend">노래 추천</Link>
        <Link to="/eye">눈 인식 제어</Link>
    
      </div>
      <div className="profile-area">  
        <img
          src="https://cdn-icons-png.flaticon.com/512/1946/1946429.png"
          alt="profile"
          className="profile-icon"
        />
        <button className="logout-btn" onClick={handleLogout}>로그아웃</button>
      </div>
    </nav>
  )
};

export default NavBar;