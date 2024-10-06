import Player from "./Player.js";
import Ground from "./Ground.js";
import CactiController from "./CactiController.js";
import Score from "./Score.js";
import ItemController from "./ItemController.js";
import "./Socket.js";
import { sendEvent } from "./Socket.js";

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

//게임 속도 조절
const GAME_SPEED_START = 1;
const GAME_SPEED_INCREMENT = 0.00001;

// 게임 크기
const GAME_WIDTH = 800;
const GAME_HEIGHT = 220;

// 플레이어
// 800 * 200 사이즈의 캔버스에서는 이미지의 기본크기가 크기때문에 1.5로 나눈 값을 사용. (비율 유지)
const PLAYER_WIDTH = 88 / 1.5; // 58
const PLAYER_HEIGHT = 94 / 1.5; // 62
const MAX_JUMP_HEIGHT = GAME_HEIGHT - 20;
const MIN_JUMP_HEIGHT = 150;

// 땅
const GROUND_WIDTH = 2400;
const GROUND_HEIGHT = 1;
const GROUND_SPEED = 0.5;

// 선인장
const CACTI_CONFIG = [
  { width: 50 / 1.5, height: 50 / 1.5, image: "images/cactus_1.png" },
  { width: 70 / 1, height: 70 / 1, image: "images/cactus_3.png" },
  { width: 99 / 1.5, height: 99 / 1.5, image: "images/cactus_2.png" },
];

// 아이템
const ITEM_CONFIG = [
  { width: 50 / 1.5, height: 50 / 1.5, id: 1, image: "images/items/item1.png" },
  { width: 50 / 1.5, height: 50 / 1.5, id: 2, image: "images/items/item2.png" },
  { width: 50 / 1.5, height: 50 / 1.5, id: 3, image: "images/items/item3.png" },
  { width: 50 / 1.2, height: 50 / 1.2, id: 4, image: "images/items/item4.png" },
  { width: 50 / 1.1, height: 50 / 1.1, id: 5, image: "images/items/item5.png" },
];

// 게임 요소들
let player = null;
let ground = null;
let cactiController = null;
let itemController = null;
let score = null;

let scaleRatio = null;
let previousTime = null;
let gameSpeed = GAME_SPEED_START;
let gameover = false;
let hasAddedEventListenersForRestart = false;
let waitingToStart = true;

// 랭크 관련 시작 =========================================

// 랭크 조회 API 호출
async function getRank() {
  const res = await fetch("/api/rank");
  const data = await res.json();

  console.log(data);
  return data.formattedScores; // [{ uuid, timestamp, score }, ...] 형태
}
getRank(); // 접속 후 1번 불러옴

// 테이블에 점수 추가
async function appendTable() {
  const rankList = document.getElementById("rank-list"); // tbody
  const scores = await getRank();

  // 기존 내용 초기화
  rankList.innerHTML = "";

  if (!scores || scores.length === 0) {
    // 데이터가 없을 경우
    const row = document.createElement("tr");
    const nullField = document.createElement("td");

    nullField.textContent = "데이터 없음";
    nullField.setAttribute("colspan", 3); // 3개 컬럼 병합
    nullField.style.textAlign = "center"; // 가운데 정렬

    row.appendChild(nullField);
    rankList.appendChild(row);
    return; // 더 이상 처리하지 않음
  }

  // 객체 데이터 1개 단위로 순회
  scores.forEach(({ uuid, timestamp, score }) => {
    const row = document.createElement("tr");

    // 복무일, 관등성명, 날짜 데이터 추가
    const scoreField = document.createElement("td");
    scoreField.textContent = score; // 복무일
    row.appendChild(scoreField);

    const uuidField = document.createElement("td");
    uuidField.textContent = uuid; // 관등성명
    row.appendChild(uuidField);

    const dateField = document.createElement("td");
    const date = new Date(parseInt(timestamp)); // 타임스탬프를 Date 객체로
    dateField.textContent = date.toLocaleDateString(); // 날짜 형식으로
    row.appendChild(dateField);

    rankList.appendChild(row); // 테이블에 행 추가
  });
}

// 랭크 관련 끝 =============================================

function createSprites() {
  // 비율에 맞는 크기
  // 유저
  const playerWidthInGame = PLAYER_WIDTH * scaleRatio;
  const playerHeightInGame = PLAYER_HEIGHT * scaleRatio;
  const minJumpHeightInGame = MIN_JUMP_HEIGHT * scaleRatio;
  const maxJumpHeightInGame = MAX_JUMP_HEIGHT * scaleRatio;

  // 땅
  const groundWidthInGame = GROUND_WIDTH * scaleRatio;
  const groundHeightInGame = GROUND_HEIGHT * scaleRatio;

  player = new Player(
    ctx,
    playerWidthInGame,
    playerHeightInGame,
    minJumpHeightInGame,
    maxJumpHeightInGame,
    scaleRatio,
  );

  ground = new Ground(ctx, groundWidthInGame, groundHeightInGame, GROUND_SPEED, scaleRatio);

  const cactiImages = CACTI_CONFIG.map((cactus) => {
    const image = new Image();
    image.src = cactus.image;
    return {
      image,
      width: cactus.width * scaleRatio,
      height: cactus.height * scaleRatio,
    };
  });

  cactiController = new CactiController(ctx, cactiImages, scaleRatio, GROUND_SPEED);

  const itemImages = ITEM_CONFIG.map((item) => {
    const image = new Image();
    image.src = item.image;
    return {
      image,
      id: item.id,
      width: item.width * scaleRatio,
      height: item.height * scaleRatio,
    };
  });

  itemController = new ItemController(ctx, itemImages, scaleRatio, GROUND_SPEED);

  score = new Score(ctx, scaleRatio);
}

function getScaleRatio() {
  const screenHeight = Math.min(window.innerHeight, document.documentElement.clientHeight);
  const screenWidth = Math.min(window.innerHeight, document.documentElement.clientWidth);

  // window is wider than the game width
  if (screenWidth / screenHeight < GAME_WIDTH / GAME_HEIGHT) {
    return screenWidth / GAME_WIDTH;
  } else {
    return screenHeight / GAME_HEIGHT;
  }
}

function setScreen() {
  scaleRatio = getScaleRatio();
  canvas.width = GAME_WIDTH * scaleRatio;
  canvas.height = GAME_HEIGHT * scaleRatio;
  createSprites();
}

setScreen();
window.addEventListener("resize", setScreen);

if (screen.orientation) {
  screen.orientation.addEventListener("change", setScreen);
}

//게임 시작 종료 텍스트 부분
function showGameOver() {
  const fontSize = 50 * scaleRatio;
  ctx.font = `${fontSize}px Verdana`;
  ctx.fillStyle = "red";
  const x = canvas.width / 3;
  const y = canvas.height / 2;
  ctx.fillText("작업 가야지?", x, y);
}

function showStartGameText() {
  const fontSize = 20 * scaleRatio;
  ctx.font = `${fontSize}px Verdana`;
  ctx.fillStyle = "";
  const text = "SPACE로 입대 / ESC로 랭크 보기";
  const textMetrics = ctx.measureText(text);
  const x = (canvas.width - textMetrics.width) / 2;
  const y = canvas.height / 1.2;
  ctx.fillText(text, x, y);
}

function updateGameSpeed(deltaTime) {
  gameSpeed += deltaTime * GAME_SPEED_INCREMENT;
}

function reset() {
  hasAddedEventListenersForRestart = false;
  gameover = false;
  waitingToStart = false;

  ground.reset();
  cactiController.reset();
  score.reset();
  gameSpeed = GAME_SPEED_START;
  itemController.reset();
  sendEvent(2, { timeStamp: Date.now() });

  const title = document.getElementById("title");
  if (title) {
    title.style.display = "none";
  }

  // Space 키 이벤트 리스너 제거 및 재등록
  window.removeEventListener("keyup", handleSpace);
  window.addEventListener("keyup", handleSpace);
}

let onceForReset = true;
let isEscListenerAdded = false;
function setupGameReset() {
  if (!hasAddedEventListenersForRestart) {
    hasAddedEventListenersForRestart = true;

    // ESC 키 이벤트 리스너를 한 번만 등록
    if (!isEscListenerAdded) {
      window.addEventListener("keyup", handleEsc);
      isEscListenerAdded = true;
    }
  }
}

// Space 키 처리 함수
function handleSpace(e) {
  const modal = document.getElementById("modal");
  if (e.code === "Space" && onceForReset && !modal.classList.contains("show")) {
    onceForReset = false;
    reset();
  }
}

// ESC 키 처리 함수
function handleEsc(e) {
  const modal = document.getElementById("modal");
  if (e.code === "Escape" && gameover) {
    // 데이터 불러오기
    appendTable();
    modal.classList.toggle("show");
  }
}

function clearScreen() {
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

async function gameLoop(currentTime) {
  if (previousTime === null) {
    previousTime = currentTime;
    requestAnimationFrame(gameLoop);
    return;
  }

  // 모든 환경에서 같은 게임 속도를 유지하기 위해 구하는 값
  // 프레임 렌더링 속도
  const deltaTime = currentTime - previousTime;
  previousTime = currentTime;

  clearScreen();

  if (!gameover && !waitingToStart) {
    // update
    // 땅이 움직임
    ground.update(gameSpeed, deltaTime);
    // 선인장
    cactiController.update(gameSpeed, deltaTime);
    itemController.update(gameSpeed, deltaTime);
    // 달리기
    player.update(gameSpeed, deltaTime);
    updateGameSpeed(deltaTime);

    score.update(deltaTime);
  }

  // 게임오버시 3번 sendevent
  if (!gameover && cactiController.collideWith(player)) {
    gameover = true;
    await sendEvent(3, {
      timeStamp: Date.now(),
      score: score.score,
    });
    score.setHighScore();

    onceForReset = true;
    setupGameReset();
  }

  const collideWithItem = itemController.collideWith(player);
  if (collideWithItem && collideWithItem.itemId) {
    score.getItem(collideWithItem.itemId);
  }

  // draw
  ground.draw();
  player.draw();
  cactiController.draw();
  score.draw();
  itemController.draw();

  if (gameover) {
    showGameOver();
  }

  if (waitingToStart) {
    showStartGameText();
  }

  // 재귀 호출 (무한반복)
  requestAnimationFrame(gameLoop);
}

// 게임 프레임을 다시 그리는 메서드
requestAnimationFrame(gameLoop);

let once = true;
setTimeout(() => {
  window.addEventListener("keyup", (e) => {
    const modal = document.getElementById("modal");
    if (e.key === " " && once && !modal.classList.contains("show")) {
      reset();
      once = false;
    }
  });

  // ESC 키를 눌렀을 때 모달 창 토글
  window.addEventListener("keyup", (e) => {
    if (e.key === "Escape" && waitingToStart) {
      // 데이터 불러오기
      appendTable();
      const modal = document.getElementById("modal");
      modal.classList.toggle("show");
    }
  });

  // 모달 닫기 버튼 이벤트 리스너 추가
  const closeModalButton = document.getElementById("close-modal");
  closeModalButton.addEventListener("click", () => {
    const modal = document.getElementById("modal");
    modal.classList.remove("show");
  });
}, 3000);

export { score };
