import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import './StatsPage.css';

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

const ProfilePage = () => {
  // 토글 상태 관리
  const [alert1, setAlert1] = useState(true);
  const [alert2, setAlert2] = useState(false);
  const [alert3, setAlert3] = useState(true);

  // 로그아웃 확인창 상태
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const navigate = useNavigate();
  // 프로필 수정 페이지 이동 (임시)
  const handleEditProfile = () => {
    navigate("/edit-profile");
  };

  // 로그아웃 처리 (임시)
  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    setShowLogoutConfirm(false);
    // 실제 로그아웃 처리 코드
    alert("로그아웃 되었습니다!");
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "20px", // gap을 줄임
        paddingTop: "80px"
      }}
    >
      {/* 사용자 이미지와 연필 버튼 */}
      <div style={{
        position: "relative",
        display: "inline-block",
        marginTop: "60px" // 원하는 만큼 숫자를 늘려보세요 (예: 60px, 100px 등)
      }}>
        <img
          src="https://cdn-icons-png.flaticon.com/512/1946/1946429.png"
          alt="user"
          style={{ width: "120px", borderRadius: "50%" }}
        />
        <button
          onClick={handleEditProfile}
          style={{
            position: "absolute",
            right: "0",
            bottom: "0",
            background: "#fff",
            border: "1px solid #ccc",
            borderRadius: "50%",
            width: "32px",
            height: "32px",
            cursor: "pointer"
          }}
        >
          ✏️
        </button>
      </div>
      <div style={{ marginTop: "10px", fontSize: "18px" }}>blink123@gmail.com</div>

      {/* 알림 설정 */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",      // 가로 중앙 정렬
          justifyContent: "center",  // 세로 중앙 정렬 (필요시)
          marginTop: "10px", // marginTop을 줄임
          minHeight: "300px"         // 필요에 따라 높이 조정
        }}
      >
        <div style={{ fontWeight: "bold", marginBottom: "16px", fontSize: "20px" }}>
          알림 설정
        </div>
        <div style={{ display: "flex", alignItems: "center", marginBottom: "16px" }}>
          <span style={{ marginRight: "16px" }}>졸림 감지 알림</span>
          <ToggleSwitch checked={alert1} onChange={() => setAlert1(!alert1)} />
        </div>
        <div style={{ display: "flex", alignItems: "center", marginBottom: "16px" }}>
          <span style={{ marginRight: "16px" }}>깜빡임 저조 알림</span>
          <ToggleSwitch checked={alert2} onChange={() => setAlert2(!alert2)} />
        </div>
        <div style={{ display: "flex", alignItems: "center", marginBottom: "16px" }}>
          <span style={{ marginRight: "16px" }}>브라우저 푸쉬 권한</span>
          <ToggleSwitch checked={alert3} onChange={() => setAlert3(!alert3)} />
        </div>
      </div>

      {/* 로그아웃 버튼 */}
      <div style={{ marginTop: "40px" }}>
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
      </div>

      {/* 로그아웃 확인창 */}
      {showLogoutConfirm && (
        <div
          style={{
            position: "fixed",
            top: "0", left: "0", width: "100vw", height: "100vh",
            background: "rgba(0,0,0,0.3)",
            display: "flex", alignItems: "center", justifyContent: "center"
          }}
        >
          <div style={{ background: "#fff", padding: "32px", borderRadius: "12px" }}>
            <div style={{ marginBottom: "20px" }}>정말 로그아웃 하시겠습니까?</div>
            <button onClick={confirmLogout} style={{ marginRight: "16px" }}>예</button>
            <button onClick={cancelLogout}>아니오</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;