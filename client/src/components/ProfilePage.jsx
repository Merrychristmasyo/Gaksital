import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import './StatsPage.css';
import { useSpring, useTrail, animated, config } from "@react-spring/web";

// ProfilePage 안에 ToggleSwitch 컴포넌트 선언
const ToggleSwitch = ({ checked, onChange }) => (
  <label style={{
    position: "relative", display: "inline-block", width: "60px", height: "34px"
  }}>
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      style={{ opacity: 0, width: 0, height: 0 }}
    />
    <span style={{
      position: "absolute", cursor: "pointer", top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: checked ? "#000" : "#ccc",
      borderRadius: "34px",
      transition: ".4s"
    }}>
      <span style={{
        position: "absolute",
        content: '""',
        height: "26px",
        width: "26px",
        left: checked ? "30px" : "4px",
        bottom: "4px",
        backgroundColor: "#fff",
        borderRadius: "50%",
        transition: ".4s"
      }} />
    </span>
  </label>
);

const ProfilePage = ({user}) => {
  // 토글 상태 관리
  const [alert1, setAlert1] = useState(true);
  const [alert2, setAlert2] = useState(false);
  const [alert3, setAlert3] = useState(true);

  // 로그아웃 확인창 상태
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const navigate = useNavigate();
  // 프로필 수정 페이지 이동 (임시)

  const containerSpring = useSpring({
    from: { opacity: 0, transform: "scale(0.95)" },
    to:   { opacity: 1, transform: "scale(1)" },
    config: config.wobbly,
  });
  const profileSpring = useSpring({
    from: { opacity: 0, transform: "translateY(-20px)" },
    to:   { opacity: 1, transform: "translateY(0px)" },
    delay: 200,
    config: config.stiff,
  });
  const greetingSpring = useSpring({
    from: { opacity: 0, transform: "translateY(-10px)" },
    to:   { opacity: 1, transform: "translateY(0px)" },
    delay: 300,
    config: config.stiff,
  });

  const toggleLabels = [
    { key: "alert1", label: "졸림 감지 알림", state: alert1, setter: setAlert1 },
    { key: "alert2", label: "깜빡임 저조 알림", state: alert2, setter: setAlert2 },
    { key: "alert3", label: "음악 저장 알림", state: alert3, setter: setAlert3 }
  ];
  const trail = useTrail(toggleLabels.length, {
    from: { opacity: 0, transform: "scale(0.8)" },
    to:   { opacity: 1, transform: "scale(1)" },
    delay: 400,
    config: config.stiff,
  });

  const logoutSpring = useSpring({
    from: { opacity: 0, transform: "translateY(20px)" },
    to:   { opacity: 1, transform: "translateY(0px)" },
    delay: 600,
    config: config.stiff,
  });

  const modalSpring = useSpring({
    opacity: showLogoutConfirm ? 1 : 0,
    config: config.gentle,
  });
  
  // 로그아웃 처리 (임시)
  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    setShowLogoutConfirm(false);
    // 실제 로그아웃 처리 코드
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
    navigate("/", { replace: true });
    window.location.reload();
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  // 마운트 시 로컬스토리지에서 불러오기
  useEffect(() => {
    const d = localStorage.getItem("alert1");
    const b = localStorage.getItem("alert2");
    const s = localStorage.getItem("alert3");        // ← 새 값
    if (d !== null) setAlert1(JSON.parse(d));
    if (b !== null) setAlert2(JSON.parse(b));
    if (s !== null) setAlert3(JSON.parse(s));        // ← 새 값
  }, []);

    // 상태 + 로컬스토리지 동기화 헬퍼
  const handleToggle = (key, val, setter) => {
    setter(val);
    localStorage.setItem(key, JSON.stringify(val));
  };

  return (
    <animated.div
      style={{
        ...containerSpring,
        minHeight: "10vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingTop: "100px",
        gap: "20px",
        overflowY: "hidden"
      }}
    >
      <animated.div style={profileSpring}>
        <div style={{
          position: "relative",
          display: "inline-block",
          marginTop: "60px"
        }}>
          <img
            src={user.photo || "https://cdn-icons-png.flaticon.com/512/1946/1946429.png"}
            alt="user"
            style={{ width: "120px", borderRadius: "50%" }}
          />
          <button style={{
            position: "absolute",
            right: "0",
            bottom: "0",
            background: "#fff",
            border: "1px solid #ccc",
            borderRadius: "50%",
            width: "32px",
            height: "32px",
            cursor: "pointer"
          }}>
            ⭐
          </button>
        </div>
      </animated.div>

      <animated.div style={greetingSpring}>
        <div style={{
          marginTop: "10px",
          fontSize: "18px",
          textAlign: "center",
          fontWeight: "bold"
        }}>
          {user.email.split("@")[0]}님, 눈 뜨세요!<br/>
          <img
            src={"/eye_bat.png"}
            alt="eye_open"
            style={{ width: "110px", marginTop: "10px", marginRight: "20px" }}
          />
        </div>
      </animated.div>

      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        marginTop: "60px",
        minHeight: "200px"
      }}>
        <div style={{ fontWeight: "bold", marginBottom: "20px", fontSize: "20px" }}>
          알림 설정
        </div>
        {trail.map((style, i) => (
          <animated.div key={toggleLabels[i].key} style={{
            ...style,
            display: "flex",
            alignItems: "center",
            marginBottom: "16px"
          }}>
            <span style={{ marginRight: "16px" }}>{toggleLabels[i].label}</span>
            <ToggleSwitch
              checked={toggleLabels[i].state}
              onChange={() =>
                handleToggle(
                  toggleLabels[i].key,
                  !toggleLabels[i].state,
                  toggleLabels[i].setter
                )
              }
            />
          </animated.div>
        ))}
      </div>

      <animated.div style={logoutSpring}>
        <button
          onClick={handleLogout}
          style={{
            background: "#000",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            padding: "10px 32px",
            fontSize: "16px",
            cursor: "pointer"
          }}
        >
          Logout
        </button>
      </animated.div>

      {showLogoutConfirm && (
        <animated.div style={{
          ...modalSpring,
          position: "fixed",
          top: 0, left: 0, width: "100vw", height: "100vh",
          background: "rgba(0,0,0,0.3)",
          display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <div style={{
            background: "#fff",
            padding: "32px",
            borderRadius: "12px",
            textAlign: "center"
          }}>
            <div style={{ marginBottom: "20px" }}>정말 로그아웃 하시겠습니까?</div>
            <button
              onClick={confirmLogout}
              style={{ marginRight: "16px" }}
            >
              예
            </button>
            <button onClick={cancelLogout}>아니오</button>
          </div>
        </animated.div>
      )}
    </animated.div>
  );
};

export default ProfilePage;