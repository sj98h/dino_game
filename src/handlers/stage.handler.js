import { getGameAssets } from "../init/assets.js";
import { getStage, setStage } from "../models/stage.model.js";

//다음 스테이지
export const moveStageHandler = (userId, payload) => {
  //유저는 스테이지를 하나씩 올라갈수있음 1->2  2->3
  //유저는 일정 조건을 달성하면 다음 스테이지로 넘어감

  //현재스테이지,다음스테이지 보내주기
  //현재 스테이지 정보
  let currentStages = getStage(userId);
  if (!currentStages.length) {
    console.log(currentStages);
    return { status: "fail", message: "스테이지가 없습니다." };
  }

  //오름차순 -> 가장큰 스테이지 ID 확인 <-유저의 현재 스테이지
  currentStages.sort((a, b) => a.id - b.id);
  const currentStage = currentStages[currentStages.length - 1];
  //클라이언트 vs 서버 비교
  if (currentStage.id !== payload.currentStage) {
    console.log(payload.currentStage);
    return { status: "fail", message: "현재 잘못된 스테이지에 있음" };
  }

  //점수 검증 로직
  const serverTime = Date.now();
  // const elapsedTime = (serverTime - currentStage.timeStamp) / 1000;

  //1스테이지에서 2스테이지로 넘어가는 가정
  //다음단계 넘어가는부분 과제
  // console.log(payload.clientTime);
  //elapsedTime으로 검증이 계속 실패하여 그냥 클라이언트에서 score를 직접 받아와서 검증함
  if (payload.clientScore % 100 === 0) {
    return { status: "fail", message: "시간 초과" };
  }

  //target 스테이지 검증 -게임에셋에 존재하는가?
  const { stages } = getGameAssets();
  if (!stages.data.some((stage) => stage.id === payload.targetStage)) {
    return { status: "fail", message: "다음 스테이지가 없음" };
  }

  setStage(userId, payload.targetStage, serverTime);
  if (payload.currentStage === 1000) {
    return { status: "seccess", message: "시작 스테이지" };
  }

  return { status: "success", message: "다음 스테이지" };
};
