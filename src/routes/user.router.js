import { redisClient } from "../app.js";
import express from "express";

const router = express.Router();

// 하이스코어 조회하는 api
router.get("/get-highscore/:userId", async (req, res, next) => {
  try {
    const { userId } = req.params;

    // *하이스코어 조회
    const highScore = await redisClient.zscore(userId, "highScore");

    // *하이스코어 반환
    if (!highScore) {
      return res.status(400).json({ message: "최고 점수 없음" });
    }

    return res.status(200).json({ highScore });
  } catch (error) {
    console.log(error, "너의 어머니");
  }
});

export default router;
