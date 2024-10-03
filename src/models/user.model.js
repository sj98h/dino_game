const users = []; //connection등의 이벤트가 발생할경우 세션에 유저의 정보를 객체로 저장

//유저 생성
export const addUser = (user) => {
  users.push(user);
};
//유저 확인
export const getUser = () => {
  return users;
};

//유저 삭제
//disconnect 유저가 접속을 종료할 경우
export const removeUser = (socketId) => {
  const index = users.findIndex((user) => {
    user.socketId === socketId;
  });
  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
};
