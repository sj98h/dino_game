import express from "express";
import { createServer } from "http";
import initSocket from "./init/socket.js";
import { loadGameAssets } from "./init/assets.js";

const app = express();

// http 서버 인스턴스
const server = createServer(app);

const PORT = 3000;

// 미들웨어
app.use(express.json()); // json 요청 처리
app.use(express.urlencoded({ extended: false })); // url 인코딩된 요청 본문 처리
app.use(express.static("public")); // 정적파일 제공

// Socket.io 초기화
initSocket(server);

// root 경로 테스트
app.get("/", (req, res, next) => {
  res.send("hello world12");
});

// 생성된 http server 인스턴스에서 호출
server.listen(PORT, async () => {
  console.log(`서버가 ${PORT}번 포트에서 실행되었습니다`);

  try {
    // 이곳에서 파일 읽음
    const assets = await loadGameAssets();
    console.log(assets);
    console.log("assets loaded successfully");
  } catch (e) {
    console.error("failed to load game assets:" + e);
  }
});
