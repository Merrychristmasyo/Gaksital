const cors = require("cors");  
require("dotenv").config();         // .env 로드
const express = require("express");
const session = require("express-session");
const passport = require("passport");
require("./auth");                  // 위에서 설정한 passport 전략 임포트

const app = express();

app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
}));
// 1) 세션 미들웨어: 로그인 상태 유지용
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);

// 2) Passport 초기화 및 세션 연동
app.use(passport.initialize());
app.use(passport.session());

// 헬스체크용 라우트 (프론트가 이 응답 보고 정상 여부 판단)
app.get("/", (req, res) => {
  res.json({ status: "ok" });
});

// 3) Google OAuth 1차 요청
app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// 4) Google OAuth 콜백 처리
app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login-failure" }),
  (req, res) => {
    // 인증 성공 시 React 앱으로 유저 정보 전달
    const userData = encodeURIComponent(JSON.stringify(req.user));
    res.redirect(`http://localhost:3000?user=${userData}`);
  }
);

// 실패 시 라우트
app.get("/login-failure", (req, res) => {
  res.send("Google 로그인에 실패했습니다.");
});

// 서버 시작
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});