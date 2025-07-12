// client/src/components/MainPage.jsx
import React, { useRef } from "react";
import NavBar from "./NavBar";
import FaceMeshComponent from "./FaceMesh";

const MainPage = () => {
  // ref로 FaceMeshComponent 내부 토글 함수 호출
  const meshToggleRef = useRef(null);
  // 상태 리프팅: 깜빡임 횟수, 개폐도
  const [blinkCount, setBlinkCount] = React.useState(0);
  const [openness, setOpenness] = React.useState(0);

  return (
    <div
      style={{
        width: "100vw",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        gap: "120px"
      }}
    >
      <NavBar />

      {/* 왼쪽: 눈 애니메이션 + 인식 시작 버튼 */}
      <div
        style={{
          marginTop: "200px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center"
        }}
      >
        <div style={{ display: "flex", gap: "32px", position: "relative" }}>
          {/* 왼쪽 눈 */}
          <div
            style={{ width: "180px", height: "180px", borderRadius: "50%", background: "#fff", boxShadow: "0 0 16px #eee", position: "relative", overflow: "hidden" }}
          >
            <div
              style={{ width: "60px", height: "60px", borderRadius: "50%", background: "#222", position: "absolute", top: "60px", left: "60px" }}
            />
          </div>

          {/* 오른쪽 눈 */}
          <div
            style={{ width: "180px", height: "180px", borderRadius: "50%", background: "#fff", boxShadow: "0 0 16px #eee", position: "relative", overflow: "hidden" }}
          >
            <div
              style={{ width: "60px", height: "60px", borderRadius: "50%", background: "#222", position: "absolute", top: "60px", left: "60px" }}
            />
          </div>
        </div>

        {/* MainPage의 버튼으로 토글 */}
        <button
          onClick={() => meshToggleRef.current && meshToggleRef.current.toggle()}
          style={{ marginTop: "32px", padding: "12px 36px", fontSize: "18px", background: "#111", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer" }}
        >
          인식 시작/정지
        </button>
      </div>

      {/* 오른쪽: 웹캠 영상 및 FaceMesh */}
      <div
        style={{ marginTop: "200px", width: "420px", height: "300px", background: "#ddd", borderRadius: "18px", position: "relative", overflow: "hidden" }}
      >
        <FaceMeshComponent
          ref={meshToggleRef}
          width={420}
          height={300}
          onData={({ blinkCount: bc, openness: op }) => {
            setBlinkCount(bc);
            setOpenness(op);
          }}
        />
        {/* 아래에 실시간 정보 표시 */}
        <div style={{ position: "absolute", bottom: "8px", left: "8px", color: "#fff", background: "rgba(0,0,0,0.5)", padding: "4px 8px", borderRadius: "4px", fontSize: "14px" }}>
          깜빡임: {blinkCount}회 | 개폐도: {openness}%
        </div>
      </div>
    </div>
  );
};

export default MainPage;
