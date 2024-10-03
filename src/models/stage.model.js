//key : uuid , value: array -> stage정보는 배열

const stages = {};

//스테이지 초기화 / 처음시작?죽을경우? 새로고침?
export const createStage = (uuid) => {
  stages[uuid] = [];
};

//현재 유저의 스테이지 정보
export const getStage = (uuid) => {
  return stages[uuid];
};

//다음 스테이지를 추가?
export const setStage = (uuid, id, timeStamp) => {
  return stages[uuid].push({ id, timeStamp }); //스테이지의 ID
};

export const clearStage = (uuid) => {
  stages[uuid] = [];
};
