//key : uuid , value: array -> stage정보는 배열

const items = {};

//아이템 초기화
export const createItem = (uuid) => {
  items[uuid] = [];
};

//현재 유저의 아이템 정보
export const getItem = (uuid) => {
  return items[uuid];
};

//다음 아이템 추가?
export const setItem = (uuid, id) => {
  return items[uuid].push({ id }); //스테이지의 ID
};

export const clearItem = (uuid) => {
  items[uuid] = [];
};
