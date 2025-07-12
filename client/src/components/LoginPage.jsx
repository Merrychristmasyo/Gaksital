import React from "react";
import "./LoginPage.css";

const LoginPage = () => {
  const API_URL = process.env.REACT_APP_API_URL;

  const handleGoogleLogin = () => {
    console.log('Google 로그인 버튼 클릭됨');
    
    // 서버 상태 확인
    fetch(`${API_URL}`)
      .then(response => response.json())
      .then(data => {
        console.log('서버 응답:', data);
        // 서버가 정상이면 Google OAuth로 리디렉션
        window.location.href = "http://localhost:5000/auth/google";
      })
      .catch(error => {
        console.error('서버 연결 실패:', error);
        alert('서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.');
      });
  };

  return (
    <div className="login-container">
      {/* 왼쪽: 서비스 이름/설명 */}
      <div className="login-left">
        <h1>Blink</h1>
        <p>Care your eyes</p>
      </div>
      {/* 가운데: 3D 캐릭터 이미지 */}
      <div className="login-center">
        <img
          src="/3d_char.png"
          alt="character"
          className="character-img"
        />
      </div>
      {/* 오른쪽: 로그인 폼 및 구글 로그인 버튼 */}
      <div className="login-right">
        <h2>Sign in</h2>
        <input type="text" placeholder="Enter email or user name" />
        <input type="password" placeholder="Password" />
        <div className="forgot-password">Forgot password ?</div>
        <button className="login-btn">Login</button>
        <div className="or">or continue with</div>
        {/* 구글 로그인 버튼 */}
        <button className="google-btn" onClick={handleGoogleLogin}>
          <img
            src="/googleLogo.png"
            alt="Google"
            className="google-logo"
          />
        </button>
      </div>
    </div>
  )
}

export default LoginPage;