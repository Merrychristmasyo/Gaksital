const express = require("express");
const passport = require("passport");
const router = express.Router();

// 1) 구글 로그인 요청
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// 2) 구글 콜백
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/auth/failure" }),
  (req, res) => {
    // 로그인 성공 시 클라이언트로 유저 전달
    const userData = encodeURIComponent(JSON.stringify(req.user));
    res.redirect(`http://localhost:3000?user=${userData}`);
  }
);

// 3) 실패 시
router.get("/failure", (req, res) => {
  res.status(401).send("Google 로그인에 실패했습니다.");
});

module.exports = router;