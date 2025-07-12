// Passport와 Google Strategy 로드
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

// 세션에 사용자 전체 프로필을 저장/복원
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

// Google OAuth 전략 설정
passport.use(
  new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,         // .env 에 정의
      clientSecret: process.env.GOOGLE_CLIENT_SECRET, // .env 에 정의
      callbackURL: "http://localhost:5000/auth/google/callback"
    },
    (accessToken, refreshToken, profile, done) => {
      // 여기서 실제 DB 연동 가능 (profile.id 로 사용자 체크·저장)
      return done(null, profile);
    }
  )
);