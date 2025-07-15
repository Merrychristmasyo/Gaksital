const express   = require("express");
const router    = express.Router();
const SavedSong = require("../models/SavedSong");

/**
 * 1) 노래 저장 (클릭 시)
 *    POST /api/saved-songs
 *    body: { userId, date, song }
 */
router.post("/", async (req, res) => {
  const { userId, date, song } = req.body;
  if (!userId || !date || !song || !song.videoId) {
    return res.status(400).json({ error: "userId, date, song.videoId 이 필요합니다." });
  }

  try {
    const saved = await SavedSong.create({
      user: userId,
      date,
      song
    });
    return res.status(201).json(saved);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * 2) 날짜별 저장된 노래 가져오기
 *    GET /api/saved-songs?userId=…&date=YYYY-MM-DD
 */
router.get("/", async (req, res) => {
  const { userId, date } = req.query;
  if (!userId) {
    return res.status(400).json({ error: "userId 쿼리 필요" });
  }

  const filter = { user: userId };
  if (date) filter.date = date;

  try {
    const list = await SavedSong
      .find(filter)
      .sort({ createdAt: -1 });
    return res.json(list);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * 3) 저장곡 삭제
 *    DELETE /api/saved-songs/:id
 */
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await SavedSong.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ error: "해당 ID의 저장곡이 없습니다." });
    }
    return res.sendStatus(204);  // No Content
  } catch (err) {
    console.error("❌ DELETE /api/saved-songs/:id error:", err);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;