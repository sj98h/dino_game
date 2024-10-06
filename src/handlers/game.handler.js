import { getGameAssets } from "../init/assets.js";
import { clearStage, getStage, setStage } from "../models/stage.model.js";
import { redisClient } from "../app.js";

export const gameStart = (uuid, payload) => {
  //접속하자마자 시작함
  //접속하자마자 스테이지의 정보를 넣어줘야함
  const { stages } = getGameAssets();

  //새 게임 시작시 이전 데이터 삭제
  clearStage(uuid);
  //stages 배열의 0번째 === 첫 스테이지
  setStage(uuid, stages.data[0].id, payload.timeStamp);
  console.log("스테이지:", getStage(uuid));
  return { status: "success" };
};

export const gameEnd = async (uuid, payload) => {
  try {
    //게임 종료 시 타임스탬프와 총 점수
    const { timeStamp: gameEndTime, score } = payload;
    const stages = getStage(uuid);

    // *redis에 uuid, 점수, 시간 기록 (Sorted Sets ZSets)

    // 1. 유저 개개인의 하이스코어를 기록하여 localStorage 대신 사용
    // 1-1. 하이스코어에 해당하는 타임스탬프는 별도로 관리
    // 2. 리더보드는 1에서 기록한 값들을 모두 모아 내부 로직에서 특정 순위까지 조회 (top 10)
    // 3. top10 랭킹을 위해 전체 유저 하이스코어 모아놓은 highScores에도 기록

    // 기존 하이스코어가 없으면 새로 생성
    const created = await redisClient.zadd(uuid, "NX", Math.floor(score), "highScore");
    // 기존 하이스코어가 있으면 새 점수가 더 클 때만 업데이트
    const updated = await redisClient.zadd(uuid, "XX", "GT", Math.floor(score), "highScore");
    console.log(`${uuid} 게임오버: redis 업데이트`);
    /**
     * NX: 키 or 멤버가 존재하지 않을 때만 요소 추가
     * XX: 키 or 멤버가 이미 존재할 때만 요소 추가
     * 기본값 없음 옵션 안 넣으면 항상 새 요소 추가
     */

    // 하이스코어 새로 기록되면 타임스탬프 별도로 저장
    if (created || updated) {
      await redisClient.hset(`${uuid}:timestamp`, "highScoreTimestamp", gameEndTime);
    }

    // 유저 전체 하이스코어에 저장 + 멤버값에 타임스탬프 낑겨넣음
    await redisClient.zadd("highScores", Math.floor(score), `${uuid}:${gameEndTime}`);

    if (!stages.length) {
      return { status: "fail", message: "스테이지가 이상합니다." };
    }

    // //각 스테이지의 지속 시간을 계산하여 총 점수 계산
    // let totalScore = 0;
    // stages.forEach((stage, index) => {
    //   let stageEndTime;
    //   if (index === stages.length - 1) {
    //     stageEndTime = gameEndTime;
    //   } else {
    //     stageEndTime = stages[index + 1].timeStamp;
    //   }
    //   const stageDuration = (stageEndTime - stage.timeStamp) / 1000;
    //   totalScore += stageDuration; // 1초당 1점 스테이지마다 점수차를 내려면 json파일에 데이터 추가 과제
    // });
    // //점수와 타임스탬프 검증
    // if (Math.abs(score - totalScore) > 5) {
    //   return { status: "fail", message: "점수 에러" };
    // }

    return { status: "success", message: "게임 종료", score };
  } catch (error) {
    console.log(error);
  }
};
