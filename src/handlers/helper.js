import handlerMappings from "./handlerMapping.js";
import { getUser, removeUser } from "../models/user.models.js";
import { CLIENT_VERSION } from "../../public/Constants.js";
import { createStage } from "../models/stage.models.js";

export const handleDisconnect = (socket, uuid) => {
  removeUser(socket.id);
  console.log(`User disconnected: ${socket.id}`);
  console.log("Current users: ", getUser());
};

export const handleConnection = (socket, uuid) => {
  console.log(`New user connected!: ${uuid} with socket ID ${socket.id}`);
  console.log("Current users: ", getUser());

  createStage(uuid);

  socket.emit("connection", { uuid });
};

export const handlerEvent = (io, socket, data) => {
  if (!CLIENT_VERSION.includes(data.clientVersion)) {
    socket.emit("response", {
      status: "fail",
      message: "Client version mismatch",
    });
    return;
  }

  const handler = handlerMappings[data.handlerId];
  if (!handler) {
    socket.emit("response", { status: "fail", message: "Handler not found" });
    return;
  }

  const response = handler(data.userId, data.payload);

  if (response.broadcast) {
    io.emit("response", "broadcast");
    return;
  }

  socket.emit("response", response);
};
