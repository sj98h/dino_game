import { sendEvent } from "./Socket.js";
import stages from "./assets/stage.json" with { type: "json" };
import itemUnlock from "./assets/item_unlock.json" with { type: "json" };
import items from "./assets/item.json" with { type: "json" };

class Score {
  score = 0;
  HIGH_SCORE_KEY = "highScore";
  stageIndex = 0;

  constructor(ctx, scaleRatio) {
    this.ctx = ctx;
    this.canvas = ctx.canvas;
    this.scaleRatio = scaleRatio;
  }

  update(deltaTime) {
    this.score += (deltaTime + stages.data[this.stageIndex].scorePerSecond) * 0.001;
    if (Math.floor(this.score) > stages.data[this.stageIndex].score) {
      console.log("현재 스테이지:", stages.data[this.stageIndex].id);
      if (this.stageIndex + 1 < stages.data.length) {
        sendEvent(11, {
          currentStage: stages.data[this.stageIndex].id,
          targetStage: stages.data[this.stageIndex + 1].id,
          clientScore: this.score,
          stageIndex: this.stageIndex,
        });
        this.stageIndex += 1;
      }
    }
  }

  getItem(itemId) {
    for (let i = 0; i < items.data.length; i++) {
      if (itemId === items.data[i].id) {
        this.score += items.data[i].score;
        sendEvent(10, {
          currentItem: items.data[i].id,
          stageIndex: this.stageIndex,
        });
      }
    }
  }
  reset() {
    this.score = 0;
    this.stageIndex = 1;
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
    this.ctx.fillStyle = "#000000";

    const scoreX = this.canvas.width - 150 * this.scaleRatio;
    const highScoreX = scoreX - 125 * this.scaleRatio;

    const scorePadded = Math.floor(this.score).toString().padStart(6, 0);
    const highScorePadded = highScore.toString().padStart(6, 0);

    // "STAGE" 텍스트를 맨 왼쪽에 배치
    const stageText = `STAGE ${this.stageIndex}`;
    const stageX = 20 * this.scaleRatio; // 왼쪽 여백
    this.ctx.fillText(stageText, stageX, y);

    this.ctx.fillText(`복무일: ${scorePadded}`, scoreX, y);
    this.ctx.fillText(`HI ${highScorePadded}`, highScoreX, y);
  }
}

export default Score;
