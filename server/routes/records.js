const express = require("express");
const router  = express.Router();
const Record  = require("../models/Record");
const User    = require("../models/User"); // User 모델 import

/**
 * POST /records
 * body: { userId, timestamp, values, blinkCounts }
 *   userId: 구글 프로필 sub 문자열
 */
router.post("/", async (req, res) => {
  console.log("▶▶▶ /records POST 호출됨", req.body);

  try {
    const { userId, timestamp, values, blinkCounts } = req.body;

    if (!Array.isArray(values) || !Array.isArray(blinkCounts)) {
      return res
        .status(400)
        .json({ error: "`values` 배열과 `blinkCounts` 배열이 필요합니다." });
    }

    // 1) User 문서 조회 (googleId 필드로 저장해 두셨을 겁니다)
    let user = await User.findOne({ googleId: userId });
    if (!user) {
      user = await User.findById(userId);
    }
    if (!user) {
      return res.status(404).json({ error: "해당 구글 ID 사용자 없음" });
    }

    // 2) Record 생성 시, user._id (ObjectId) 사용
    const rec = await Record.create({
      user:      user._id,  // << 여기가 ObjectId 타입
      timestamp: new Date(timestamp),
      values,
      blinkCounts
    });

    console.log("✅ MongoDB 저장 성공:", rec._id);
    return res.status(201).json(rec);

  } catch (err) {
    console.error("❌ /records POST error:", err);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;