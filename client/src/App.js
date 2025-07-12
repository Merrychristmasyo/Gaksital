import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import NavBar from "./components/NavBar";
import LoginPage from "./components/LoginPage";
import MainPage from "./components/MainPage";
import ProfilePage from "./components/ProfilePage";
import EditProfilePage from "./components/EditProfilePage";
import StatsPage from "./components/StatsPage";
import SongRecommendPage from "./components/SongRecommendPage";

console.log("StatsPage = ",StatsPage);
/**
 * index.js에서 <BrowserRouter>로 감싼 후, 여기서는 NavBar와 Routes만 관리
 */
function App() {
  const [user, setUser] = useState(null);

  // 로드 시 저장된 user 확인
  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  // OAuth 콜백 ?user= 처리
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const userParam = params.get("user");
    if (userParam) {
      const userObj = JSON.parse(decodeURIComponent(userParam));
      setUser(userObj);
      localStorage.setItem("user", JSON.stringify(userObj));
      window.history.replaceState({}, document.title, "/");
    }
  }, []);

  return (
    <>
      {user && <NavBar />}
      <Routes>
        <Route
          path="/"
          element={user ? <MainPage user={user} /> : <LoginPage />}
        />
        <Route
          path="/profile"
          element={user ? <ProfilePage user={user} /> : <Navigate to="/" />}
        />
        <Route
          path="/stats"
          element={user ? <StatsPage /> : <Navigate to="/" />}
        />
        <Route
          path="/recommend"
          element={user ? <SongRecommendPage /> : <Navigate to="/" />}
        />
        <Route
          path="/eye"
          element={user ? <MainPage /> : <Navigate to="/" />}
        />
        <Route
          path="/edit-profile"
          element={user ? <EditProfilePage /> : <Navigate to="/" />}
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}

export default App;