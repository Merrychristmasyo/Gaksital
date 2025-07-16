import React from "react";
import { useLocation, NavLink, useNavigate } from "react-router-dom";
import { useSpring, useTrail, animated, config } from "@react-spring/web";
import "./NavBar.css";

const NavBar = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const stored = localStorage.getItem("user");
  const userObj = stored ? JSON.parse(stored) : null;
  const photoUrl =
    userObj?.photo ||
    userObj?.photoURL ||
    "https://cdn-icons-png.flaticon.com/512/1946/1946429.png";

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/", { replace: true });
    window.location.reload();
  };

  // 전체 NavBar 슬라이드 & 페이드 인 애니메이션
  const navSpring = useSpring({
    from: { opacity: 0, transform: "translateY(-100%)" },
    to: { opacity: 1, transform: "translateY(0%)" },
    config: config.wobbly,
    delay: 100,
  });

  // 메뉴 아이템 라벨 & 경로
  const menuLabels = ["Main", "Music", "Stats", "Profile/Setting"];
  const menuPaths = ["/eye", "/recommend", "/stats", "/profile"];

  // 메뉴 아이템 트레일 애니메이션
  const trail = useTrail(menuLabels.length, {
    from: { opacity: 0, transform: "scale(0.8)" },
    to: { opacity: 1, transform: "scale(1)" },
    config: config.stiff,
    delay: 300,
  });

  return (
    <animated.nav className="navbar" style={navSpring}>
      <div className="main-logo">Blink‧˚₊*̥ ✶⋆</div>

      <div className="main-menu">
        {trail.map((style, i) => (
          <animated.div key={menuPaths[i]} style={style}>
            <NavLink
              to={menuPaths[i]}
              className={
                pathname === menuPaths[i] ? "menu-item active" : "menu-item"
              }
            >
              {menuLabels[i]}
            </NavLink>
          </animated.div>
        ))}
      </div>

      <div
        className="profile-area"
        style={{ display: "flex", alignItems: "center", gap: "8px" }}
      >
        <img src={photoUrl} alt="profile" className="profile-icon" />
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </animated.nav>
  );
};

export default NavBar;
