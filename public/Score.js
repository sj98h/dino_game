import { sendEvent, setStageUpdateCallback } from "./Socket.js";

class Score {
  score = 0;
  HIGH_SCORE_KEY = "highScore";
  stageChange = true;
  currentStage = 1; // 기본 스테이지 값

  constructor(ctx, scaleRatio) {
    this.ctx = ctx;
    this.canvas = ctx.canvas;
    this.scaleRatio = scaleRatio;

    // 스테이지 업데이트 콜백 설정
    setStageUpdateCallback((updatedStage) => {
      this.currentStage = updatedStage;
      console.log("현재 스테이지:", this.currentStage);
    });
  }

  update(deltaTime) {
    this.score += deltaTime * 0.001;
    // 점수가 100점 이상이 될 시 서버에 메세지 전송
    if (Math.floor(this.score) === 10 && this.stageChange) {
      this.stageChange = false;
      sendEvent(11, { currentStage: 1000, targetStage: 1001 });
    }
  }

  getItem(itemId) {
    this.score += 0;
  }

  reset() {
    this.score = 0;
  }

  setHighScore() {
    const highScore = Number(localStorage.getItem(this.HIGH_SCORE_KEY));
    if (this.score > highScore) {
      localStorage.setItem(this.HIGH_SCORE_KEY, Math.floor(this.score));
    }
  }

  getScore() {
    return this.score;
  }

  draw() {
    const highScore = Number(localStorage.getItem(this.HIGH_SCORE_KEY));
    const y = 20 * this.scaleRatio;

    const fontSize = 20 * this.scaleRatio;
    this.ctx.font = `${fontSize}px serif`;
    this.ctx.fillStyle = "#525250";

    const scoreX = this.canvas.width - 75 * this.scaleRatio;
    const highScoreX = scoreX - 125 * this.scaleRatio;
    const stageX = highScoreX - 175 * this.scaleRatio;

    const scorePadded = Math.floor(this.score).toString().padStart(6, 0);
    const highScorePadded = highScore.toString().padStart(6, 0);
    const stagePadded = this.currentStage.toString().padStart(3, 0);

    this.ctx.fillText(scorePadded, scoreX, y);
    this.ctx.fillText(`HI ${highScorePadded}`, highScoreX, y);
    this.ctx.fillText(`STAGE ${stagePadded}`, stageX, y);
  }
}

export default Score;
