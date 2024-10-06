import { CLIENT_VERSION } from "./Constants.js";

const socket = io("http://43.201.113.94:3333", {
  query: {
    clientVersion: CLIENT_VERSION,
  },
});

let userId = null;
socket.on("response", (data) => {
  console.log(data);
});

socket.on("connection", (data) => {
  console.log("connection: ", data);
  userId = data.uuid;
});

const sendEvent = async (handlerId, payload) => {
  socket.emit("event", {
    userId,
    clientVersion: CLIENT_VERSION,
    handlerId,
    payload,
  });
};

export { sendEvent, userId };
