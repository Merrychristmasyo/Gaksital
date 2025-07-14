// Passport와 Google Strategy 로드
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("./models/User");

// 세션에 사용자 전체 프로필을 저장/복원
passport.serializeUser((user, done) => done(null, user.googleId));
passport.deserializeUser(async (googleId, done) => {
  try {
    const user = await User.findOne({ googleId });
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// Google OAuth 전략 설정
passport.use(
  new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,         // .env 에 정의
      clientSecret: process.env.GOOGLE_CLIENT_SECRET, // .env 에 정의
      callbackURL: process.env.GOOGLE_CALLBACK_URL
    },
    async(accessToken, refreshToken, profile, done) => {
      // 여기서 실제 DB 연동 가능 (profile.id 로 사용자 체크·저장)
      try{
        let user = await User.findOne({ googleId: profile.id });
        if (user) {
          return done(null, user);
        } else {
          user = await User.create({
            googleId: profile.id,
            displayName: profile.displayName,
            email: profile.emails[0].value,
            photo: profile.photos[0].value,
          });
          done(null, user);
        }} catch(err){
          console.error("Passport Strategy Error:", err);
          done(err, null);
        }
      }
  )
);