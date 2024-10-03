import socket from "../init/socket.js";
import { addUser } from "../models/user.model.js";
import { v4 as uuidv4 } from "uuid";
import { handleDisconnect, handlerConnection, handlerEvent } from "./helper.js";

const registerHandler = (io) => {
  //coneection이라는 이벤트가 호출될때까지 일단 대기한다.
  io.on("connection", (socket) => {
    //socket인자 안에 socket.id가있음

    //유저가 접속한 시점
    const userUUID = uuidv4();
    addUser({ uuid: userUUID, socketId: socket.id });

    //접속시 이벤트
    handlerConnection(socket, userUUID);
    socket.on("event", (data) => {
      handlerEvent(io, socket, data);
    });
    //접속해제시 이벤트
    socket.on("disconnect", (socket) => {
      handleDisconnect(socket, userUUID);
    });
  });
};

export default registerHandler;
