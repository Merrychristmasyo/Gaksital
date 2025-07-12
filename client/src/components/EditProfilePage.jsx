import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const EditProfilePage = () => {
  const [fullName, setFullName] = useState("");
  const [nickName, setNickName] = useState("");
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("프로필이 수정되었습니다!");
    navigate("/profile"); // 프로필 페이지로 이동
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center"
      }}
    >
      <img
        src="https://cdn-icons-png.flaticon.com/512/1946/1946429.png"
        alt="profile"
        style={{ width: "140px", marginBottom: "32px" }}
      />
      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          width: "320px"
        }}
      >
        <input
          type="text"
          placeholder="Full name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          style={{
            padding: "12px",
            fontSize: "16px",
            borderRadius: "6px",
            border: "1px solid #ccc"
          }}
        />
        <input
          type="text"
          placeholder="Nick name"
          value={nickName}
          onChange={(e) => setNickName(e.target.value)}
          style={{
            padding: "12px",
            fontSize: "16px",
            borderRadius: "6px",
            border: "1px solid #ccc"
          }}
        />
        <input
          type="email"
          placeholder="youremail@domain.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            padding: "12px",
            fontSize: "16px",
            borderRadius: "6px",
            border: "1px solid #ccc"
          }}
        />
        <button
          type="submit"
          style={{
            marginTop: "8px",
            padding: "12px",
            fontSize: "16px",
            background: "#444",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer"
          }}
        >
          SUBMIT
        </button>
      </form>
    </div>
  );
};

export default EditProfilePage;