import { redisClient } from "../app.js";
import express from "express";

const router = express.Router();

// 하이스코어 조회하는 api
router.get("/rank", async (req, res, next) => {
  try {
    const leaderBoard = await redisClient.zrevrange("highScores", 0, 9, "WITHSCORES");

    const formattedScores = [];
    // [uuid1, score1, uuid2, score2] 형식으로 반환되기 때문에 +2 단위로 uuid만 지정
    for (let i = 0; i < leaderBoard.length; i += 2) {
      // uuid:timestamp 형식으로 낑겨넣었음 uuid와 timestamp를 분리
      const [uuid, timestamp] = leaderBoard[i].split(":");
      formattedScores.push({ score: leaderBoard[i + 1], uuid, timestamp });
    }
    console.log("내가 짱이야: ", formattedScores);

    return res.status(200).json({ formattedScores });
  } catch (error) {
    console.log(error, "너의 어머니");
  }
});

export default router;
