import { getStage, setStage } from "../models/stage.models.js";
import { getGameAssets } from "../init/assets.js";

// 유저는 스테이지를 하나씩 올라갈 수 있다. 1->2 , 2->3
// 유저는 일정 점수가 되면 다음 스테이지로 간다
export const moveStageHandler = (userId, payload) => {
  // 유저의 현재 스테이지 정보
  let currentStages = getStage(userId);
  if (!currentStages.length) {
    return { status: "fail", message: "No stages found for user" };
  }

  //   오름차순 -> 가장 큰 스테이지 ID를 확인 <= 유저의 현재 스테이지
  currentStages.sort((a, b) => a.id - b.id);
  const currentStage = currentStages[currentStages.length - 1];

  // 클라이언트 vs 서버 비교
  // if (currentStage.id !== payload.currentStage) {
  //   return {
  //     status: "fail",
  //     message: "Current stage invalid",
  //     var: `Server currentStage: ${currentStage.id}, Client currentStage: ${payload.currentStage}`,
  //   };
  // }

  // 점수 검증
  const serverTime = Date.now(); // 현재 타임 스탬프
  const elapsedTime = (serverTime - currentStage.timestamp) / 1000;

  //  1스테이지 -> 2스테이지로 넘어가는 과정
  //   5-> 임의로 정한 오차범위
  // if (elapsedTime < 5 || elapsedTime > 20) {
  //   return { status: "fail", message: "Invalid elapsed time" };
  // }

  //   targetStage 대한 검증 <- 게임 에셋에 존재하는가?
  const { stages } = getGameAssets();
  if (!stages.data.some((stage) => stage.id === payload.targetStage)) {
    return { status: "fail", message: "Target stage not found" };
  }

  // 스테이지 업데이트 클라이언트로 결과 전송
  const updatedStage = setStage(userId, payload.targetStage, serverTime);

  return { status: "success", updatedStage, message: "씨발" };
};
