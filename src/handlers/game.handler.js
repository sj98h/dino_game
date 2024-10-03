import { getGameAssets } from "../init/assets.js";
import { clearStage, getStage, setStage } from "../models/stage.model.js";

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

export const gameEnd = (uuid, payload) => {
  //게임 종료 시 타임스탬프와 총 점수
  const { timeStamp: gameEndTime, score } = payload;
  const stages = getStage(uuid);

  if (!stages.length) {
    return { status: "fail", message: "스테이지가 이상합니다." };
  }

  //각 스테이지의 지속 시간을 계산하여 총 점수 계산
  let totalScore = 0;
  stages.forEach((stage, index) => {
    let stageEndTime;
    if (index === stages.length - 1) {
      stageEndTime = gameEndTime;
    } else {
      stageEndTime = stages[index + 1].timeStamp;
    }
    const stageDuration = (stageEndTime - stage.timeStamp) / 1000;
    totalScore += stageDuration; // 1초당 1점 스테이지마다 점수차를 내려면 json파일에 데이터 추가 과제
  });
  //점수와 타임스탬프 검증
  if (Math.abs(score - totalScore) > 5) {
    return { status: "fail", message: "점수 에러" };
  }

  return { status: "success", message: "게임 종료", score };
};
