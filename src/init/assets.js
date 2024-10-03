import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

let gameAssets = {}; //전역변수 여기에 json파일값을 받아옴

const __filename = fileURLToPath(import.meta.url);

// path.dirname() 함수는 파일 경로에서 디렉토리 경로만 추출 (파일 이름을 제외한 디렉토리의 전체 경로)
const __dirname = path.dirname(__filename);
const basePath = path.join(__dirname, "../../public/assets");
//파일 읽는 함수
//비동기 병렬 비동기 파일을 병렬로 동시에 처리한다.
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
//Promise.all
export const loadGameAssets = async () => {
  try {
    const [stages, items, itemUnlock] = await Promise.all([
      readFileAsync("stage.json"),
      readFileAsync("item.json"),
      readFileAsync("item_unlock.json"),
    ]);

    gameAssets = { stages, items, itemUnlock };
    return gameAssets;
  } catch (err) {
    throw new Error("assets파일 에러" + err.message);
  }
};

export const getGameAssets = () => {
  return gameAssets;
};
