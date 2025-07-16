
  import React, { useRef, useState, useEffect } from "react";  
  import NavBar from "./NavBar";  
  import FaceMeshComponent from "./FaceMesh";  
  import axios from "axios";  
  import { useNavigate } from "react-router-dom";
  import { ToastContainer, toast } from "react-toastify";
  import 'react-toastify/dist/ReactToastify.css';
  import { useSpring, animated, config } from "@react-spring/web";

  const API_URL = process.env.REACT_APP_API_URL;  
  // .env에 설정된 백엔드 API 기본 URL을 상수로 저장합니다.

  const MainPage = () => {
    // MainPage 컴포넌트 시작
    const mainTimer = 5
    const navigate = useNavigate();
    const meshToggleRef = useRef(null);  
    // FaceMeshComponent의 토글 함수를 참조하기 위한 ref 객체를 생성합니다.

    const timeoutRef = useRef(null);  
    // 10초 타이머 ID를 저장해두기 위한 ref 객체를 생성합니다.
    const intervalRef = useRef(null); // 타이머용 인터벌 ref 객체체
    
    const timerStartedRef = useRef(false);

    const [blinkCount, setBlinkCount] = useState(0);  
    // 실시간 깜빡임 횟수를 관리하는 상태 변수와 업데이트 함수입니다.

    const [openness, setOpenness] = useState(0);  
    // 실시간 눈 개폐도를 관리하는 상태 변수와 업데이트 함수입니다.

    const [isRecognizing, setIsRecognizing] = useState(false);  
    // 현재 인식 중인지 여부를 판단하는 상태 변수입니다.
    const [elapsedTime, setElapsedTime] = useState(0.0); // 경과 시간 상태

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
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          clearInterval(intervalRef.current);
        }
      };
    }, []);  
    // 빈 배열 의존성으로 마운트 시 1회만 설정하고, 언마운트 때 정리합니다.

    const handleData = ({ blinkCount: bc, openness: op }) => {
      // FaceMeshComponent가 제공하는 데이터(깜빡임, 개폐도)를 받아 처리하는 함수
      if (isRecognizing && !timerStartedRef.current&& (op > 0 || bc > 0)) {
        intervalRef.current = setInterval(() => {
          setElapsedTime(prev => {
            const next = parseFloat((prev + 0.1).toFixed(1));
            if (next >= parseFloat(mainTimer.toFixed(1))) {
              clearInterval(intervalRef.current);
              return parseFloat(mainTimer.toFixed(1));
            }
            return next;
          });
        }, 100);

        timeoutRef.current = setTimeout(finishRecognition, parseFloat(mainTimer.toFixed(1)) * 1000);  
        // 10초 뒤 finishRecognition 함수를 자동 실행하도록 타이머 설정
        timerStartedRef.current = true;
      }     


      console.log(`FRAME ▶︎ openness=${op.toFixed(2)}, blinkCount=${bc}`);

      const delta = bc - prevBlinkCount > 0 ? bc - prevBlinkCount : 0;

      setBlinkCount(bc);  
      // 상태에 깜빡임 횟수를 업데이트합니다.

      setOpenness(op);  
      // 상태에 개폐도 값을 업데이트합니다.

      if (!isRecognizing) return;  
      // 인식 중이 아니면 이후 세션 수집 로직을 실행하지 않습니다.

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
    };

    const startRecognition = () => {
      // 인식 시작 버튼 클릭 시 실행되는 함수

      clearTimeout(timeoutRef.current);
      clearInterval(intervalRef.current);
      timerStartedRef.current = false;

      setElapsedTime(0.0);
      // 경과 시간 초기화

      setSessionData({ values: [], blinkTimestamps: [], blinkCounts: [] });
      // 세션 데이터를 초기화합니다.

      setPrevBlinkCount(0);  
      // 이전 깜빡임 카운트도 리셋합니다.

      meshToggleRef.current?.toggle();  
      // FaceMeshComponent 내부 toggle 함수를 호출해 인식 시작

      setIsRecognizing(true);  
      // 인식 중 상태로 변경
    };

    const finishRecognition = () => {
      // 20초 후 또는 측정 완료 시 호출되는 함수

      meshToggleRef.current?.toggle();  
      // FaceMeshComponent 내부 toggle 함수를 호출해 인식 중지

      setIsRecognizing(false);  
      // 인식 중 상태 해제

      clearTimeout(timeoutRef.current);  
      // 타이머를 정리

      clearInterval(intervalRef.current);
      // 인터벌 타이머 정리
      timerStartedRef.current = false;

      setShowSaveConfirm(true);
    };

    const handleConfirmSave = async () => {
      setShowSaveConfirm(false);

      clearTimeout(timeoutRef.current);
      clearInterval(intervalRef.current);
      timerStartedRef.current = false;

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
            timestamp: new Date(),
            values,
            blinkCounts,
            blinkTimestamps
          },
          { withCredentials: true }
        );


        console.log("📦 세션 데이터 저장 완료");

        const wasTired = checkTiredness();

        if(!wasTired) checkEyeDrought();

      } catch (err) {
        console.error("❌ 데이터 저장 실패", err);
      }
    };

    const handleCancelSave = () => {
      setShowSaveConfirm(false);

      clearTimeout(timeoutRef.current);
      clearInterval(intervalRef.current);
      timerStartedRef.current = false;

      setSessionData({ values: [], blinkTimestamps: [], blinkCounts: [] });
      setPrevBlinkCount(0);
    };
    
    const getEyeImage = (openness) => {
      if (openness < 5) return "/eye_close.png";
      if (openness < 100) return "/eye_middle.png";
      return "/eye_open.png";
    };

    const checkTiredness = () => {
      const { values } = sessionData;
      let valuesCopy = [...values];
      const firstNonZeroIdx = valuesCopy.findIndex(v => v > 0);
      if (firstNonZeroIdx >= 0) {
        console.log("▶▶▶ firstNonZeroIdx =", firstNonZeroIdx);
        valuesCopy = valuesCopy.slice(firstNonZeroIdx);
      } else {
        // 모두 0 이면 평균 계산하지 않음
        return false;
      }
      
      if (valuesCopy.length === 0) return false;
      const avgOpen = valuesCopy.reduce((a, b) => a + b, 0) / valuesCopy.length;

      console.log("▶▶▶ avgOpen =", avgOpen);
      
      const doTiredAlert = JSON.parse(localStorage.getItem("alert1") || "false");
      if (avgOpen < 95 && doTiredAlert) {
        toast.info(
          <div style={{ textAlign: 'center' }}>
            피곤하면 잠시 쉬어 가세요!<br/>
            <button
              onClick={() => { navigate('/recommend'); toast.dismiss(); }}
              style={{
                marginTop: '8px', padding: '4px 8px',
                background: '#7f5af0', color: '#fff', border: 'none',
                borderRadius: '4px', cursor: 'pointer'
              }}
            >
              음악 추천으로
            </button>
          </div>,
          { autoClose: 3000 }
        );
        return true;  // 졸림이 감지되었음을 알림
      }
      return false;
    };

    const checkEyeDrought = () => {
      const { blinkTimestamps } = sessionData;

      const doLowBlinkAlert = JSON.parse(localStorage.getItem("alert2") || "false");
      if (blinkTimestamps.length < 2 && doLowBlinkAlert) {
        toast.warning(
          <div style={{ textAlign: 'center' }}>
            👀 화면보다 눈 건강이 먼저예요!<br/>
            잠깐 쉬어가세요
          </div>,
          {
            icon: '💡',
            autoClose: 8000
          }
        );
        return;
      }
      // 간격(ms) → 초
      const intervals = blinkTimestamps
        .slice(1)
        .map((t, i) => (t - blinkTimestamps[i]) / 1000);
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      console.log("▶▶▶ avgInterval =", avgInterval);
      if (avgInterval > 5 && doLowBlinkAlert) {
        toast.warning(
          <div style={{ textAlign: 'center' }}>
            👀 화면보다 눈 건강이 먼저예요!<br/>
            잠깐 쉬어가세요
          </div>,
          {
            icon: '💡',
            autoClose: 8000
          }
        );
      } else if (avgInterval <=5 && doLowBlinkAlert) {
        toast.success("👏 눈 깜빡임이 정상이에요!", { icon: '👍', autoClose: 3000 });
      }
    };

    const containerSpring = useSpring({
      from: { opacity: 0, transform: "scale(0.95)" },
      to:   { opacity: 1, transform: "scale(1)" },
      config: config.wobbly,
    });
    const leftSpring = useSpring({
      from: { opacity: 0, transform: "translateY(50px)" },
      to:   { opacity: 1, transform: "translateY(0px)" },
      config: config.stiff,
      delay: 300,
    });
    const rightSpring = useSpring({
      from: { opacity: 0, transform: "translateY(50px)" },
      to:   { opacity: 1, transform: "translateY(0px)" },
      config: config.stiff,
      delay: 600,
    });

    return (
      <animated.div
        style={{
          ...containerSpring,
          width: "100%",               // 화면 전체 너비
          display: "flex",              // 가로 플렉스 레이아웃
          justifyContent: "center",     // 좌우 중앙 정렬
          alignItems: "flex-start",     // 상단 정렬
          gap: "120px"                  // 요소 간 수평 간격 
        }}
      >

        {/* 왼쪽 패널: 눈 애니메이션 영역 */}
        <animated.div 
          style={{
            ...leftSpring,  
            marginTop: "25vh",       // 상단 여백
            display: "flex",
            flexDirection: "column",
            alignItems: "center"
          }}
        >
          {/* 눈 애니메이션(샘플) */}
          <img src={getEyeImage(openness)} alt="eye open image" style={{ width: "350px", height: "440px" }} />
          
        </animated.div>

        {/* 오른쪽 패널: 웹캠 영상 + 실시간 정보 */}
        <animated.div
          style={{
            ...rightSpring,
            marginTop: "13vh",width: "720px", height: "600px", // 높이 살짝 늘림
            background: "#ddd", borderRadius: "18px",
            position: "relative", overflow: "hidden",
            display: "flex", flexDirection: "column", alignItems: "center"
          }}
        >
          {/* 웹캠 */}
          <div style={{ position: "relative", width: "720px", height: "550px" }}>
            <FaceMeshComponent
              ref={meshToggleRef}
              width={420}
              height={300}
              onData={handleData}
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
            </div>

            <div style={{
              position: "absolute", bottom: "8px", right: "8px",     // ✨ 변경: 오른쪽 하단
              color: "#fff", background: "rgba(0,0,0,0.5)",
              padding: "4px 8px", borderRadius: "4px", fontSize: "14px"
            }}>
              {elapsedTime.toFixed(1)}초
            </div>
          </div>

          {/* 버튼 */}
          <button
            onClick={startRecognition}
            disabled={isRecognizing}
            style={{
              marginTop: "16px", padding: "12px 36px",
              marginBottom: "16px",
              fontSize: "18px",
              background: isRecognizing ? "#555" : "#111",
              color: "#fff", border: "none", borderRadius: "8px",
              cursor: isRecognizing ? "not-allowed" : "pointer"
            }}
          >
            {isRecognizing ? "인식중…" : "인식 시작"}
          </button>
        </animated.div>
        
        
        

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
      </animated.div>
    );
  };

  export default MainPage;  
  // MainPage 컴포넌트를 외부에서 사용할 수 있도록 export 합니다.
