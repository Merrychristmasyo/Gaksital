// client/src/components/MainPage.jsx

import React, { useRef, useState, useEffect } from "react";  
// React 및 필요한 훅(useRef, useState, useEffect)을 불러옵니다.

import NavBar from "./NavBar";  
// 상단 네비게이션 바 컴포넌트를 임포트합니다.

import FaceMeshComponent from "./FaceMesh";  
// 웹캠 기반 얼굴·눈 감지 로직을 가진 컴포넌트를 임포트합니다.

import axios from "axios";  
// 서버 통신을 위한 axios HTTP 클라이언트를 불러옵니다.

const API_URL = process.env.REACT_APP_API_URL;  
// .env에 설정된 백엔드 API 기본 URL을 상수로 저장합니다.

const MainPage = () => {
  // MainPage 컴포넌트 시작

  const meshToggleRef = useRef(null);  
  // FaceMeshComponent의 토글 함수를 참조하기 위한 ref 객체를 생성합니다.

  const timeoutRef = useRef(null);  
  // 10초 타이머 ID를 저장해두기 위한 ref 객체를 생성합니다.

  const measurementStartedRef = useRef(false);

  const [blinkCount, setBlinkCount] = useState(0);  
  // 실시간 깜빡임 횟수를 관리하는 상태 변수와 업데이트 함수입니다.

  const [openness, setOpenness] = useState(0);  
  // 실시간 눈 개폐도를 관리하는 상태 변수와 업데이트 함수입니다.

  const [isRecognizing, setIsRecognizing] = useState(false);  
  // 현재 인식 중인지 여부를 판단하는 상태 변수입니다.

  const [sessionData, setSessionData] = useState({
    values: [],         // 측정된 개폐도 값들을 저장할 배열
    blinkTimestamps: [],// 깜빡임이 발생한 시각(timestamp)을 저장할 배열
    blinkCounts: []   // 깜빡임 횟수를 저장할 배열
  });  
  // 한 인식 세션 동안 수집할 데이터를 묶어 관리합니다.

  const [prevBlinkCount, setPrevBlinkCount] = useState(0);  
  // 이전 프레임의 깜빡임 카운트를 저장해, 깜빡임이 증가했는지 비교할 때 사용합니다.

  const [showSaveConfirm, setShowSaveConfirm] = useState(false);


  useEffect(() => {
    // 컴포넌트 언마운트 시(사라질 때) 타이머를 정리하기 위한 이펙트
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);  
  // 빈 배열 의존성으로 마운트 시 1회만 설정하고, 언마운트 때 정리합니다.

  const handleData = ({ blinkCount: bc, openness: op }) => {
    // FaceMeshComponent가 제공하는 데이터(깜빡임, 개폐도)를 받아 처리하는 함수
    console.log(`FRAME ▶︎ openness=${op.toFixed(2)}, blinkCount=${bc}`);

    const delta = bc - prevBlinkCount > 0 ? bc - prevBlinkCount : 0;

    setBlinkCount(bc);  
    // 상태에 깜빡임 횟수를 업데이트합니다.

    setOpenness(op);  
    // 상태에 개폐도 값을 업데이트합니다.

    if (!isRecognizing) return;  
    // 인식 중이 아니면 이후 세션 수집 로직을 실행하지 않습니다.

    if (!measurementStartedRef.current) {
      measurementStartedRef.current = true;
      timeoutRef.current = setTimeout(finishRecognition, 10000);
    }

    const now = Date.now();  
    // 현재 시각(밀리초)을 구합니다.

    setSessionData(prev => ({
      ...prev,
      values: [...prev.values, op],
      blinkTimestamps: delta > 0 ? [...prev.blinkTimestamps, now] : prev.blinkTimestamps,
      blinkCounts: [...prev.blinkCounts, bc]
      // const newValues = [...prev.values, op];
      // //console.log("▶▶▶ NEW sessionData.values:", newValues);

      // return{
      //   values: newValues,
      //   blinkTimestamps: bc > prevBlinkCount
      //     ? [...prev.blinkTimestamps, now]
      //     : prev.blinkTimestamps
      // };
    }));
    // if(bc > prevBlinkCount) {
    setPrevBlinkCount(bc);
    // }

    //console.log("sessionData values =", sessionData.values);
  };

  const startRecognition = () => {
    // 인식 시작 버튼 클릭 시 실행되는 함수

    setSessionData({ values: [], blinkTimestamps: [], blinkCounts: [] });
    // 세션 데이터를 초기화합니다.

    setPrevBlinkCount(0);  
    // 이전 깜빡임 카운트도 리셋합니다.

    measurementStartedRef.current = false;

    meshToggleRef.current?.toggle();  
    // FaceMeshComponent 내부 toggle 함수를 호출해 인식 시작

    setIsRecognizing(true);  
    // 인식 중 상태로 변경
  };

  const finishRecognition = () => {
    // 10초 후 또는 측정 완료 시 호출되는 함수

    meshToggleRef.current?.toggle();  
    // FaceMeshComponent 내부 toggle 함수를 호출해 인식 중지

    setIsRecognizing(false);  
    // 인식 중 상태 해제

    clearTimeout(timeoutRef.current);  
    // 타이머를 정리

    measurementStartedRef.current = false;

    setShowSaveConfirm(true);
  };

  const handleConfirmSave = async () => {
    setShowSaveConfirm(false);

    let { values, blinkTimestamps, blinkCounts } = sessionData;

    const startIdx = values.findIndex((op, i) => op > 0 || blinkCounts[i] > 0); // 연속된 0 프레임만큼 startIdx 찾기
    const sliceIdx = startIdx >= 0 ? startIdx : values.length; // 연속된 0 프레임만큼 자르기

    values = values.slice(sliceIdx);
    blinkCounts = blinkCounts.slice(sliceIdx);
    
    try {
      // localStorage에서 user 꺼내기
      const stored = localStorage.getItem("user");
      const user = stored ? JSON.parse(stored) : null;

      console.log("API_URL =", API_URL);
      await axios.post(
        `${API_URL}/records`,
        {
          userId: user?.id || user?._id,       // 구글ID나 MongoDB _id
          timestamp: new Date().toISOString(),
          values,
          blinkCounts
        },
        { withCredentials: true }
      );


      console.log("📦 세션 데이터 저장 완료");
    } catch (err) {
      console.error("❌ 데이터 저장 실패", err);
    }
  };

  const handleCancelSave = () => {
    setShowSaveConfirm(false);
    setSessionData({ values: [], blinkTimestamps: [], blinkCounts: [] });
    setPrevBlinkCount(0);
    measurementStartedRef.current = false;
  };
  
  return (
    <div
      style={{
        width: "100vw",               // 화면 전체 너비
        display: "flex",              // 가로 플렉스 레이아웃
        justifyContent: "center",     // 좌우 중앙 정렬
        alignItems: "flex-start",     // 상단 정렬
        gap: "120px"                  // 요소 간 수평 간격
      }}
    >
      <NavBar />  {/* 네비게이션 바 렌더링 */}

      {/* 왼쪽 패널: 눈 애니메이션 영역 */}
      <div
        style={{
          marginTop: "200px",         // 상단 여백
          display: "flex",
          flexDirection: "column",
          alignItems: "center"
        }}
      >
        {/* 눈 애니메이션(샘플) */}
        <div style={{ display: "flex", gap: "32px", position: "relative" }}>
          <div
            style={{
              width: "180px", height: "180px",
              borderRadius: "50%", background: "#fff",
              boxShadow: "0 0 16px #eee", position: "relative",
              overflow: "hidden"
            }}
          >
            <div
              style={{
                width: "60px", height: "60px",
                borderRadius: "50%", background: "#222",
                position: "absolute", top: "60px", left: "60px"
              }}
            />
          </div>
          <div
            style={{
              width: "180px", height: "180px",
              borderRadius: "50%", background: "#fff",
              boxShadow: "0 0 16px #eee", position: "relative",
              overflow: "hidden"
            }}
          >
            <div
              style={{
                width: "60px", height: "60px",
                borderRadius: "50%", background: "#222",
                position: "absolute", top: "60px", left: "60px"
              }}
            />
          </div>
        </div>

        {/* 인식 시작/인식중 버튼 */}
        <button
          onClick={startRecognition}                // 클릭 시 인식 시작
          disabled={isRecognizing}                  // 인식 중이면 비활성화
          style={{
            marginTop: "32px", padding: "12px 36px",
            fontSize: "18px",
            background: isRecognizing ? "#555" : "#111", // 색상 토글
            color: "#fff", border: "none", borderRadius: "8px",
            cursor: isRecognizing ? "not-allowed" : "pointer"
          }}
        >
          {isRecognizing ? "인식중…" : "인식 시작"}  {/* 텍스트 토글 */}
        </button>
      </div>

      {/* 오른쪽 패널: 웹캠 영상 + 실시간 정보 */}
      <div
        style={{
          marginTop: "200px", width: "420px", height: "300px",
          background: "#ddd", borderRadius: "18px",
          position: "relative", overflow: "hidden"
        }}
      >
        <FaceMeshComponent
          ref={meshToggleRef}     // 토글 함수 참조 전달
          width={420}             // 캔버스 너비
          height={300}            // 캔버스 높이
          onData={handleData}     // 데이터 콜백 함수 등록
        />

        {/* 실시간 정보 오버레이 */}
        <div
          style={{
            position: "absolute", bottom: "8px", left: "8px",
            color: "#fff", background: "rgba(0,0,0,0.5)",
            padding: "4px 8px", borderRadius: "4px", fontSize: "14px"
          }}
        >
          깜빡임: {blinkCount}회 | 개폐도: {openness}%  
          {/* 실시간 깜빡임 & 개폐도 표시 */}
        </div>
      </div>

      {showSaveConfirm && (
        <div style={{ position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          background: "rgba(0,0,0,0.4)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
        >
          <div
            style={{
              background: "#fff",
              padding: "24px",
              borderRadius: "12px",
              textAlign: "center"
            }}
          >
            <p style={{ marginBottom: "16px", fontSize: "18px" }}>
              측정이 완료되었습니다. 저장하시겠습니까?
            </p>
            <button
              onClick={handleConfirmSave}
              style={{
                marginRight: "12px",
                padding: "8px 16px",
                background: "#007bff",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer"
              }}
            >
              예
            </button>
            <button
              onClick={handleCancelSave}
              style={{
                padding: "8px 16px",
                background: "#ccc",
                color: "#333",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer"
              }}
            >
              아니오
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MainPage;  
// MainPage 컴포넌트를 외부에서 사용할 수 있도록 export 합니다.
