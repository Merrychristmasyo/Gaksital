require("dotenv").config();
const express = require("express");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");
const connectDB = require("./config/db");
require("./auth");
const authRoutes   = require("./routes/auth");
const recordRouter = require("./routes/records");
const savedSongsRouter = require("./routes/savedSongs");

const app = express();

// 1) MongoDB 연결
connectDB();

// 2) CORS 설정 (쿠키 전달을 위해 가장 먼저)  
app.use(cors({  
  origin: "http://localhost:3000",  
  credentials: true,  
}));

// 3) JSON 바디 파싱 ★ 변경  
//    → 반드시 /records 보다 **위**에 와야 req.body를 인식합니다.
app.use(express.json({ limit: "10mb" }));

// 4) 세션 미들웨어 ★ 변경  
//    → passport.session() 전에 등록해야 세션이 정상 동작합니다.
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      sameSite: "none",
      secure: false
    }
  })
);

// 5) Passport 초기화 및 세션 연동  
app.use(passport.initialize());
app.use(passport.session());

// 6) 헬스체크
app.get("/", (req, res) => res.json({ status: "ok" }));

// 7) 인증 라우트  
app.use("/auth", authRoutes);

// 8) 기록 라우트 ★ 변경  
//    → express.json(), session, passport.session() 이후에 등록해야  
//      req.body 와 req.user 를 모두 사용할 수 있습니다.
app.use("/records", recordRouter);
app.use("/api/saved-songs", savedSongsRouter);

// 9) 서버 시작
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server listening on http://localhost:${PORT}`)
);