// src/components/StatsPage.jsx

import React, { useState, useEffect, lazy, Suspense } from "react";
import axios from "axios";
import "react-calendar/dist/Calendar.css";
import './StatsPage.css';
import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer } from "recharts"
import { Trash2 } from "lucide-react";

const Calendar = lazy(() => import("react-calendar"));

const StatsPage = () => {
  // 1. 현재 선택된 날짜
  const [selectedDate, setSelectedDate] = useState(new Date());
  // 2. 그날의 모든 레코드
  const [records, setRecords] = useState([]);
  // 3. 선택된 개별 레코드
  const [selectedRecord, setSelectedRecord] = useState(null);
  // 4. 카드 hover 강조 인덱스
  const [highlightIdx, setHighlightIdx] = useState(null);

  const stored = localStorage.getItem("user");
  if(!stored) {
    console.warn("❌ 로컬스토리지 user가 없습니다.");
  }
  const userObj = stored ? JSON.parse(stored) : null;
  console.log("▶ 로컬스토리지 userObj:", userObj);
  const userId = userObj?._id || userObj?.id || null;

  // 5. 날짜 변경 시 API 호출
  useEffect(() => {

    if(!userId){
      console.warn("❌ userId가 없습니다.");
      return;
    }

    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const day = String(selectedDate.getDate()).padStart(2, '0');
    const isoDate = `${year}-${month}-${day}`;

    axios.get(`${process.env.REACT_APP_API_URL}/records?date=${isoDate}&userId=${userId}`, { withCredentials: true })
      .then(res => {
        setRecords(res.data);
        setSelectedRecord(null);
      })
      .catch(err => console.error("❌ 레코드 불러오기 실패", err));
  }, [selectedDate, userId]);

  // 6. 요약 카드 렌더링 (그래프 제거, 통계만)
  const renderSummary = () => {
    if (!selectedRecord) {
      return <div className="no-selection">카드를 클릭하여<br/>상세 정보를 보세요</div>;
    }
    const tsArr = Array.isArray(selectedRecord.blinkTimestamps)
      ? selectedRecord.blinkTimestamps
      : [];
    if (tsArr.length < 2) {
      return <div className="no-records">깜빡임 데이터가 충분하지 않습니다.</div>;
    }
    // 시간(ms) 배열로 변환
    const times = tsArr.map(t => {
      // 문자열이면 Date로, 숫자면 그대로
      return typeof t === 'number' ? t : new Date(t).getTime();
    });
    // 간격 계산 (초 단위)
    const intervals = [];
    for (let i = 1; i < times.length; i++) {
      intervals.push((times[i] - times[i-1]) / 1000);
    }
    // 최소/평균/최대
    const mn = intervals.length ? Math.min(...intervals).toFixed(1) : '0.0';
    const mx = intervals.length ? Math.max(...intervals).toFixed(1) : '0.0';
    const avg = intervals.length
      ? (intervals.reduce((a,b) => a+b, 0) / intervals.length).toFixed(1)
      : '0.0';

    return (
      <>
        <div className="summary-date">
          {new Date(selectedRecord.timestamp)
          .toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })}
        </div>
        <div className="summary-labels">
          <div>최소 간격(s)</div>
          <div>평균 간격(s)</div>
          <div>최대 간격(s)</div>
        </div>
        <div className="summary-values">
          <div>{mn}초</div>
          <div>{avg}초</div>
          <div>{mx}초</div>
        </div>
      </>
    );
  };

  const deleteRecord = async (id) => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/records/${id}?userId=${userId}`, { withCredentials: true });
      setRecords(prev => prev.filter(rec => rec._id !== id));
      setSelectedRecord(sr => sr?._id === id ? null : sr);
      alert("삭제되었습니다.");
    } catch (err) {
      console.error("❌ 레코드 삭제 실패", err);
      alert("삭제에 실패했습니다.");
    }
  }

  return (
    <div className="stats-page">
      {/* 좌측 패널 */}
      <div className="stats-left">
        <div className="stats-summary">
          {renderSummary()}
        </div>
        <div className="stats-calendar">
          <Suspense fallback={<div>Loading...</div>}>
            <Calendar
              onChange={date => setSelectedDate(date)}
              value={selectedDate}
              formatDay={(_, date) => date.getDate()}
              showFixedNumberOfWeeks={true} //이거 추가함.(07/16) -> false로 하면 달력에서 필요한 4-5주만 보여줌. true로 하면 6주까지 보여줌.
            /> 
          </Suspense>
        </div>
      </div>
      {/* 우측 패널 */}
      <div className="stats-right">
        {records.length ? records.map((rec, idx) => {
          const avgOpenness = rec.values.length
          ? (rec.values.reduce((a,b) => a + b, 0) / rec.values.length).toFixed(1)
          : '0.0';
          const chartData = rec.values.map((op, i) => ({ frame: i, openness: op }));
          return (
            <div
              key={rec._id}
              className={`record-card ${highlightIdx===idx?"highlight":""} ${selectedRecord?._id===rec._id?"selected":""}`}
              onClick={() => setSelectedRecord(rec)}
              onMouseEnter={() => setHighlightIdx(idx)}
              onMouseLeave={() => setHighlightIdx(null)}
            >
              <div className="card-header">
                {new Date(rec.timestamp).toLocaleTimeString()}  :  기록 {idx+1}
              </div>
              {selectedRecord?._id === rec._id && (
              <ResponsiveContainer width="100%" height={80}>
                <LineChart data={chartData} margin={{ top:0,right:0,left:0,bottom:0 }}>
                  <XAxis dataKey="frame" hide />
                  <Tooltip cursor={false} />
                  <Line type="monotone" dataKey="openness" stroke="#8884d8" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
              )}
              <div className="card-values">
                평균 개폐율: {avgOpenness}%
              </div>
              
              <button 
                className="delete-btn" 
                onClick={(e) => {
                  e.stopPropagation();
                  deleteRecord(rec._id);
                }}
              >
                <Trash2 size={16} />
              </button>
            </div>
          );
        }) : <div className="no-records">해당 날짜에 기록이 없습니다</div>}
      </div>
    </div>
  );
};

export default StatsPage;
