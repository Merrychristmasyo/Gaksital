// server/src/routes/records.js

const express = require("express");
const router  = express.Router();
const Record  = require("../models/Record");
const User    = require("../models/User");

/**
 * GET /records?date=YYYY-MM-DD&userId=<ObjectId>
 * - body 없이 쿼리로 date, userId 둘 다 필수
 */
router.get("/", async (req, res) => {
  try {
    const { date, userId } = req.query;
    if (!date) {
      return res.status(400).json({ error: "date 쿼리가 필요합니다." });
    }
    // ✨ 변경: 인증 없이 userId 쿼리로 받기
    if (!userId) {
      return res.status(400).json({ error: "userId 쿼리가 필요합니다." });
    }

    const start = new Date(date);
    const end   = new Date(date);
    end.setDate(end.getDate() + 1);

    const recs = await Record.find({
      user:      userId,                  // ✨ 변경: 여기 userId 사용
      timestamp: { $gte: start, $lt: end }
    }).sort({ timestamp: 1 });

    return res.json(recs);
  } catch (err) {
    console.error("❌ GET /records 에러:", err);
    return res.status(500).json({ error: err.message });
  }
});

/**
 * POST /records
 * body: { userId, timestamp, values, blinkCounts, blinkTimestamps }
 * - userId: 로그인된 사용자의 ObjectId
 */
router.post("/", async (req, res) => {
  console.log("▶▶▶ /records POST 호출됨", req.body);
  try {
    const { userId, timestamp, values, blinkCounts, blinkTimestamps } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "userId가 필요합니다." });
    }
    if (
      !Array.isArray(values) ||
      !Array.isArray(blinkCounts) ||
      !Array.isArray(blinkTimestamps)
    ) {
      return res.status(400).json({
        error:
          "`values`, `blinkCounts`, `blinkTimestamps` 모두 배열로 제공되어야 합니다."
      });
    }

    // ✨ 변경: body.userId (ObjectId) 로 User 검증
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "해당하는 userId가 없습니다." });
    }

    const rec = await Record.create({
      user:            user._id,
      timestamp:       new Date(timestamp),
      values,
      blinkCounts,
      blinkTimestamps
    });

    console.log("✅ /records POST 저장 성공:", rec._id);
    return res.status(201).json(rec);
  } catch (err) {
    console.error("❌ /records POST 에러:", err);
    return res.status(500).json({ error: err.message });
  }
});

/**
 * DELETE /records/:id?userId=<ObjectId>
 * - userId 쿼리로 본인 확인 후 삭제
 */
router.delete("/:id", async (req, res) => {
  try {
    const { id }     = req.params;
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: "userId 쿼리가 필요합니다." });
    }

    // 1) 존재 여부 확인
    const record = await Record.findById(id);
    if (!record) {
      return res.status(404).json({ error: "레코드를 찾을 수 없습니다." });
    }

    // 2) 소유자 검증
    if (record.user.toString() !== userId) {
      return res.status(403).json({ error: "삭제 권한이 없습니다." });
    }

    // 3) 삭제
    await record.deleteOne();
    return res.json({ message: "삭제 완료" });
  } catch (err) {
    console.error("❌ DELETE /records/:id 에러:", err);
    return res.status(500).json({ error: "서버 에러" });
  }
});

module.exports = router;
