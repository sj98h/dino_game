// Node.js 내장 모듈
import fs from "fs"; // 파일 읽기, 쓰기
import path from "path"; // 파일 경로 처리
import { fileURLToPath } from "url"; // URL 형태의 경로를 로컬 파일 경로로 변환

// 여기에 게임 에셋 할당
let gameAssets = {};

// fileURLToPath: URL 형식의 문자열을 파일 시스템 경로로 변환하는 함수
// import.meta: ES 모듈에서 사용 가능한 객체. 현재 모듈에 대한 메타 정보 포함
// .url: file// 프로토콜 사용하는 URL 형식
const __filename = fileURLToPath(import.meta.url); // 현재 파일의 절대 경로
const __dirname = path.dirname(__filename);
// 최상위 경로 + assets 폴더
const basePath = path.join(__dirname, "../../public/assets");

// 파일 읽는 함수
// 비동기 병렬로 파일을 읽는다.
const readFileAsync = (filename) => {
  return new Promise((resolve, reject) => {
    fs.readFile(path.join(basePath, filename), "utf8", (err, data) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(JSON.parse(data));
    });
  });
};

// Promis.all()
export const loadGameAssets = async () => {
  try {
    const [stages, items, itemUnlocks] = await Promise.all([
      readFileAsync("stage.json"),
      readFileAsync("item.json"),
      readFileAsync("item_unlock.json"),
    ]);

    gameAssets = { stages, items, itemUnlocks };
    return gameAssets;
  } catch (e) {
    throw new Error("Failed to load game assets: " + e.message);
  }
};

export const getGameAssets = () => {
  return gameAssets;
};
