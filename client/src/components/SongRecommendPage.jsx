import React, { useEffect, useState, useMemo } from "react";
import './SongRecommendPage.css';
import { fetchSongsByDate, toggleSaveSong, deleteSavedSong, fetchSavedSongs, saveSong } from '../services/api';
/**
 * 추천 로직 플로우:
 * 1. 컴포넌트 마운트 시 사용자의 위치 기반 현재 날씨(온도)와 현지 시간(시간대)을 OpenWeatherMap API로 조회
 * 2. 시간대(아침/낮/저녁/밤) 및 온도를 바탕으로 'mood' 키워드 결정 (예: 'calm', 'energetic', 'cozy', 'chill')
 * 3. YouTube Data API (Music 카테고리)로 mood 키워드를 포함한 플레이리스트/뮤직 검색
 * 4. 상위 6~7곡 결과를 state에 저장 -> 나중에 내가 뭘 저장했었는 지 확인하 수 있도록
 * 5. UI 렌더: 각 곡 썸네일, 제목, 아티스트, 링크 표시
 * 환경 변수:
 * REACT_APP_OPENWEATHER_KEY, REACT_APP_YOUTUBE_API_KEY
 */

const SongRecommendPage = ({ user }) => {
  console.log("받아온 user:", user);
  const userId = user._id || user.googleId;
  console.log("▶ userId:", userId);
  // 추천된 유튜브 비디오 목록을 담는 배열 
  const [songs, setSongs] = useState([]);
  // !!! 저장한(담기 체크한) 영상들
  const [savedSongs, setSavedSongs] = useState([]);
  // 데이터 로딩 중인지 여부 
  const [loading, setLoading] = useState(true);
  // 에러 메시지를 담는 상태 
  const [error, setError] = useState(null);
  // 날씨 아이콘 상태 추가 
  const [weatherIcon, setWeatherIcon] = useState("☁️");


  // !!!! 날씨·시간·키워드 관련
  const [temp, setTemp] = useState(null);
  const [locationName, setLocationName] = useState('');
  const [currentTimeStr, setCurrentTimeStr] = useState('');
  const [currentDateStr, setCurrentDateStr] = useState('');
  const [hashtags, setHashtags] = useState([]);

  // !!!!날짜 선택(좌측 패널)
  const today = new Date();
  const year = today.getFullYear(); // 추가! -> 서버로 디비 전송할 때 필요 
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [selectedDay, setSelectedDay] = useState(today.getDate());

  // !!!!왼쪽: 해당 월의 날짜 배열
  const daysInMonth = useMemo(
    () => new Date(today.getFullYear(), month, 0).getDate(),
    [month, today]
  );
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);


  useEffect(() => {
    console.log('🎯 YT_KEY =', process.env.REACT_APP_YOUTUBE_API_KEY);
    const fetchData = async () => {
      try {
        // 위치 정보 가져오기: navigator.geolocation.getCurrentPosition -> 브라우저의 위치 권한을 요청해 위도/경도를 얻음 
        const position = await new Promise((res, rej) =>{
          navigator.geolocation.getCurrentPosition(res, rej);
        });
        const {latitude, longitude} = position.coords;

        // 날씨 정보 가져오기: process.env.REACT_APP_OPENWEATHER_KEY -> 환경 변수에서 날씨 API 키를 가져옴 / .env 파일에 저장된 API 키를 사용 
        const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`);
        const { current_weather } = await weatherRes.json();
        if (!current_weather) throw new Error('날씨 데이터가 없습니다.');
        const t = current_weather.temperature;
        setTemp(Math.round(t));
        // !!! 날씨 아이콘 설정  
        const code = current_weather.weathercode;
        const weatherCodeToEmoji = {
          0: "☀️",      // 맑음
          1: "🌤",      // 거의 맑음
          2: "⛅️",      // 일부 구름
          3: "☁️",      // 구름 많음
          45: "🌫",     // 안개
          48: "🌫",     // 안개 얼음
          51: "🌦",     // 이슬비
          53: "🌦",
          55: "🌦",
          61: "🌧",     // 약한 비
          63: "🌧",
          65: "🌧",
          71: "❄️",     // 약한 눈
          73: "❄️",
          75: "❄️",
          80: "🌦",     // 소나기
          81: "🌦",
          82: "🌧",
          95: "⛈",     // 뇌우
          96: "⛈",
          99: "⛈"
        };
        setWeatherIcon(weatherCodeToEmoji[code] || "❓");


        // !!! 시간/날짜 
        const now = new Date();
        const hour = now.getHours();
        setCurrentTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        setCurrentDateStr(now.toLocaleDateString());

        //!!! 시간대 키워드 
        let timeMood = '';
        if(hour>=5 && hour<12) timeMood = 'morning';
        else if(hour>=12 && hour<18) timeMood = 'afternoon';
        else if(hour>=18 && hour<22) timeMood = 'evening';
        else timeMood = 'midnight';

        // !!! 계절
        const m = now.getMonth() + 1;
        let season = '';
        if ([12,1,2].includes(m)) season = 'winter';
        else if ([3,4,5].includes(m)) season = 'spring';
        else if ([6,7,8].includes(m)) season = 'summer';
        else season = 'autumn';

        // 기온+시간대 기반 Mood 키워드
        let moodKeyword="";
        if(t >= 30) moodKeyword = 'hot';
        else if(t >= 25) moodKeyword = 'energetic';
        else if(t >= 15) moodKeyword = 'cozy';
        else if(t >= 10) moodKeyword = 'chill';
        else moodKeyword = 'cold';
        moodKeyword += `-${timeMood}`;

        setHashtags([`#${timeMood}`, `#${season}`, `#${moodKeyword}`]);

        // 유튜브 검색하기 
        const youtubeRes = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${moodKeyword}&type=video&videoCategoryId=10&order=viewCount&maxResults=10&key=${process.env.REACT_APP_YOUTUBE_API_KEY}`);

        //const youtubeRes = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${moodKeyword}&type=video&maxResults=10&key=${process.env.REACT_APP_YOUTUBE_API_KEY}`);

        const youtubeData = await youtubeRes.json();

        // 유튜브 검색 결과 처리: 
        const videoList = youtubeData.items.map(item => ({
          videoId: item.id.videoId,
          title: item.snippet.title,
          description: item.snippet.description,
          thumbnail: item.snippet.thumbnails.default.url,
          channelTitle: item.snippet.channelTitle,
          // artist 정보가 별도 제공되지 않으면 채널명으로 대체
          artist: item.snippet.channelTitle,
          url: `https://www.youtube.com/watch?v=${item.id.videoId}`
        }));

        // 결과를 상태에 저장: 성공 시 songs 배열에 저장, 로딩 상태 업데이트 
        setSongs(videoList);
        setLoading(false);
      } catch (err){
          console.error(err);
          setError("추천을 불러오는 데 실패했습니다.");
          setLoading(false);
        }
      };
        fetchData();
      }, []);

        // 공통으로 쓰는 날짜 문자열 생성 함수
      const getDateStr = () =>
        `${year}-${String(month).padStart(2,'0')}-${String(selectedDay).padStart(2,'0')}`;
        // 1) 저장곡 불러오는 함수 (초기 로드·토글 후 재로딩 모두 사용)
        const loadSaved = async () => {
        try {
          const dateStr = getDateStr();
          const res = await fetchSavedSongs(userId, dateStr);
          setSavedSongs(
            res.data.map(item => ({
            ...item.song,
           savedId: item._id,
           url: `https://www.youtube.com/watch?v=${item.song.videoId}` //!!! 여기서도 유튜브 링크 추가하기~!!!!!
          }))
      );
    } catch (err) {
      console.error("로드 실패:", err);
      setSavedSongs([]);
    }
  };

      // 1. 날짜가 바뀔 때마다 서버에서 저장된 음악 불러오기
      useEffect(() => {
        const loadSaved = async () => {
          const dateStr = `${year}-${String(month).padStart(2,'0')}-${String(selectedDay).padStart(2,'0')}`;
          try {
            const res = await fetchSavedSongs(userId, dateStr);
            console.log("▶ 서버에서 받아온 raw saved list:", res.data);
            const mapped = res.data.map(item => ({
              ...item.song,
              savedId: item._id
            }));
            console.log("▶ mapped savedSongs:", mapped);
            setSavedSongs(mapped);
          } catch (err) {
            console.error("서버 에러:", err);
            setSavedSongs([]);
          }
        };
        loadSaved();
      }, [month, selectedDay]);
      

      // 2. 음악을 선택/해제할 때 서버에 저장/삭제 요청
      const handleToggleSave = async (song) => {
        const dateStr = `${year}-${month.toString().padStart(2, '0')}-${selectedDay.toString().padStart(2, '0')}`;
        try {
          const exists = savedSongs.some(s => s.videoId === song.videoId);
          if (exists) {
          // 이미 저장돼 있으면 삭제
            const matched = savedSongs.find(s => s.videoId === song.videoId);
            if (matched && matched.savedId) {
              await deleteSavedSong(matched.savedId);
          }
          } else {
          // 저장
            await saveSong(userId, dateStr, song);
          }
          // 변경 후 다시 불러오기
          await loadSaved();
          /*const res = await fetchSavedSongs(userId, dateStr);
          setSavedSongs(res.data.map(item => ({
            ...item.song,
            savedId: item._id
          })));
          */
          } catch (err) {
            console.error("토글 실패:", err.response?.data || err);
          }
        };

      if (loading) return <div>추천 로딩 중...</div>;
      if (error) return <div>{error}</div>;

      return (
        <div className="song-recommend-page">
          {/* LEFT PANEL */}
          <div className="left-panel">
            <div className="date-selector">
              <select value={month} onChange={e => setMonth(Number(e.target.value))}>
                {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                  <option key={m} value={m}>{m}월</option>
                ))}
              </select>
              <div className="day-scroll">
                {daysArray.map(day => {
                  const diff = Math.abs(day - selectedDay);
                  const size = 56 - diff * 8 > 32 ? 56 - diff * 8 : 32; // 최대 56px, 최소 32px / 글씨 크기 조절 
                  const opacity = 1 - diff * 0.07 > 0.2 ? 1 - diff * 0.07 : 0.2;
                  const isSelected = diff === 0;
                  return (
                    <div
                      key={day}
                      style={{
                        width: size,
                        height: size,
                        background: isSelected
                          ? "linear-gradient(135deg, #bbaaff 60%, #e3dbff 100%)"
                          : "#ede6ff",
                        opacity: isSelected ? 1 : opacity,
                        color: isSelected ? "#fff" : "#a084ff",
                        fontWeight: isSelected ? "bold" : "normal",
                        transition: "all 0.2s"
                      }}
                      className="day-item"
                      onClick={() => setSelectedDay(day)}
                    >
                      {day}
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="saved-list">
              {savedSongs.map(song => (
                <div key={song.videoId} className={`song-item${savedSongs.some(s => s.videoId === song.videoId) ? ' selected' : ''}`} 
                onClick={() => handleToggleSave(song)}  // 저장/해제 토글 -> onClick으로 리스트에서 사라지지 않도록 처리 
                style={{ cursor: 'pointer' }}
                >
                    <a
                      href={song.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={e => e.stopPropagation()}    // 부모 onClick 차단
                    >
                     <img src={song.thumbnail} alt={song.title} />
                  </a>
                  <div className="info">
                    <div className="title">{song.title}</div>
                    <div className="channel">{song.channelTitle}</div>
                    <div className="artist">{song.artist}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
    
          {/* RIGHT PANEL */}
          <div className="right-panel">
            <div className="right-panel-top">
              <div className="weather-container">
                {/* 나중에 아이콘 컴포넌트로 대체 가능 */}
                <div className="weather-icon">{weatherIcon}</div>
                <div className="weather-info">
                  <div>{locationName}</div>
                  <div>{temp}°C</div>
                </div>
              </div>
              <div className="time-container">
                <div className="time-big">{currentTimeStr}</div>
                <div className="date-small">{currentDateStr}</div>
              </div>
            </div>
            <div className="hashtags">
              {hashtags.map(tag => <span key={tag}>{tag}</span>)}
            </div>
            <div className="songs-list">
              {songs.map(song => (
                <div
                  key={song.videoId}
                  className={`song-item${savedSongs.some(s => s.videoId === song.videoId) ? ' selected' : ''}`}
                  onClick={() => handleToggleSave(song)}
                  style={{ cursor: 'pointer' }}
                >
                  <img src={song.thumbnail} alt={song.title} />
                  <div className="song-info">
                    <div className="title">{song.title}</div>
                    <div className="channel">{song.channelTitle}</div>
                  </div>
                  {/* 체크박스 완전히 제거 */}
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    };

  export default SongRecommendPage;