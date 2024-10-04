import express from "express";
import { createServer } from "http";
import initSocket from "./init/socket.js";
import { loadGameAssets } from "./init/assets.js";

const app = express();
const server = createServer(app);

const PORT = 3333;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"));

initSocket(server);

server.listen(PORT, async () => {
  console.log(`${PORT}포트가 열림`);
  try {
    const assets = await loadGameAssets();
    console.log(assets);

    console.log("Assets 파일 제대로 읽음");
  } catch (err) {
    console.error("Game Assets 이상함" + err.message);
  }
});

import Redis from "ioredis";
// const dotenv = require('dotenv');
// dotenv.config(); // env환경변수 파일 가져오기
const redisClient = new Redis({
  host: "redis-10913.c340.ap-northeast-2-1.ec2.redns.redis-cloud.com", // Redis 클라우드 호스트
  port: "10913", // Redis 클라우드 포트
  password: "tPgvUPy6ocqVj47ZymHyJsKX6TMLhuRa", // Redis 비밀번호
});

redisClient.on("connect", () => {
  console.info("Redis connected!");
});

// redisClient.set("foo", "bar");
redisClient.get("foo", function (err, result) {
  console.log(result);
});

redisClient.on("error", (err) => {
  console.error("Redis Client Error", err);
});
