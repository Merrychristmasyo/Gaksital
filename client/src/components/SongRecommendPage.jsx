import React, { useEffect, useState } from "react";

/**
 * 추천 로직 플로우:
 * 1. 컴포넌트 마운트 시 사용자의 위치 기반 현재 날씨(온도)와 현지 시간(시간대)을 OpenWeatherMap API로 조회
 * 2. 시간대(아침/낮/저녁/밤) 및 온도를 바탕으로 'mood' 키워드 결정 (예: 'calm', 'energetic', 'cozy', 'chill')
 * 3. YouTube Data API (Music 카테고리)로 mood 키워드를 포함한 플레이리스트/뮤직 검색
 * 4. 상위 6~7곡 결과를 state에 저장
 * 5. UI 렌더: 각 곡 썸네일, 제목, 아티스트, 링크 표시
 *
 * 환경 변수:
 * REACT_APP_OPENWEATHER_KEY, REACT_APP_YOUTUBE_API_KEY
 */

const SongRecommendPage= () => {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 위치 정보 가져오기
        const position = await new Promise((res, rej) =>{
          navigator.geolocation.getCurrentPosition(res, rej);
        });
        const {latitude, longitude} = position.coords;

        // 날씨 정보 가져오기
        const weatherRes = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${process.env.REACT_APP_OPENWEATHER_KEY}`);
        const weatherData = await weatherRes.json();
        const temp = weatherData.main.temp;

        // 시간대 결정
        const hour = new Date().getHours();
        let timeMood;
        if(hour>=5 && hour<12) timeMood = 'morning';
        else if(hour>=12 && hour<18) timeMood = 'afternoon';
        else if(hour>=18 && hour<22) timeMood = 'evening';
        else timeMood = 'midnight';

        // 기온+시간대 기반 Mood 키워드
        let moodKeyword="";
        if(temp >= 25) moodKeyword = 'energetic';
        else if(temp >= 15) moodKeyword = 'cozy';
        else moodKeyword = 'chill';

        // 최종 Mood 키워드
        moodKeyword += `-${timeMood}`;

        const youtubeRes = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${moodKeyword}&type=video&maxResults=7&key=${process.env.REACT_APP_YOUTUBE_API_KEY}`);

        const youtubeData = await youtubeRes.json();
        const videoList = youtubeData.items.map(item => ({
          videoId: item.id.videoId,
          title: item.snippet.title,
          description: item.snippet.description,
          thumbnail: item.snippet.thumbnails.default.url,
        }));

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

      if (loading) return <div>추천 로딩 중...</div>;
      if (error) return <div>{error}</div>;

      return(
        <div style={{ padding: "16px" }}>
          <h2>오늘의 추천 플레이리스트</h2>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {songs.map(song => (
              <li key={song.videoId} style={{ marginBottom: "12px", display: "flex", alignItems: "center" }}>
                <a href={`https://music.youtube.com/watch?v=${song.videoId}`} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", textDecoration: "none", color: "inherit" }}>
                  <img src={song.thumbnail} alt={song.title} style={{ width: "120px", height: "90px", marginRight: "12px", borderRadius: "8px" }} />
                  <div>
                    <div style={{ fontWeight: "bold" }}>{song.title}</div>
                    <div style={{ fontSize: "14px", color: "#555" }}>{song.channel}</div>
                  </div>
                </a>
              </li>
            ))}
          </ul>
        </div>
      );
  };

  export default SongRecommendPage;