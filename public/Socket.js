import { CLIENT_VERSION } from "./Constants.js";

const socket = io("http://localhost:3000", {
  query: {
    clientVersion: CLIENT_VERSION,
  },
});

let userId = null;
let onStageUpdate = null;

socket.on("response", (data) => {
  console.log(data);
  if (data.status === "success" && data.updatedStage !== undefined) {
    if (onStageUpdate) {
      onStageUpdate(data.updatedStage);
    }
  }
  return data.updatedStage;
});

socket.on("connection", (data) => {
  console.log("connection: ", data);
  userId = data.uuid;
});

const sendEvent = (handlerId, payload) => {
  socket.emit("event", {
    userId,
    clientVersion: CLIENT_VERSION,
    handlerId,
    payload,
  });
};

const setStageUpdateCallback = (callback) => {
  onStageUpdate = callback;
};

export { sendEvent, setStageUpdateCallback };
