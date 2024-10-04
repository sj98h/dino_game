import { sendEvent, userId } from "./Socket.js";
import stages from "./assets/stage.json" with { type: "json" };
import itemUnlock from "./assets/item_unlock.json" with { type: "json" };
import items from "./assets/item.json" with { type: "json" };

class Score {
  score = 0;
  highScore = 0;
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

  // 로컬스토리지에 하이스코어를 저장하고 있음
  async setHighScore() {
    // Redis에 기록된 하이스코어 조회
    // 근데 프론트에선 redisClient에 직접 접근이 불가능하다
    // 하이스코어 조회 api 작성후 fetch로 호출하여 접근...
    try {
      const res = await fetch(`/api/get-highscore/${userId}`);
      const data = await res.json();

      console.log("하이스코어:", data.highScore);
      this.highScore = data.highScore;
    } catch (error) {
      console.log(error);
    }
  }

  getScore() {
    return this.score;
  }

  draw() {
    const y = 20 * this.scaleRatio;

    const fontSize = 20 * this.scaleRatio;
    this.ctx.font = `${fontSize}px serif`;
    this.ctx.fillStyle = "#000000";

    const scoreX = this.canvas.width - 150 * this.scaleRatio;
    const highScoreX = scoreX - 125 * this.scaleRatio;

    const scorePadded = Math.floor(this.score).toString().padStart(6, 0);
    const highScorePadded = this.highScore.toString().padStart(6, 0);

    // "STAGE" 텍스트를 맨 왼쪽에 배치
    let stageText;
    switch (this.stageIndex) {
      case 1:
        stageText = "이병";
        break;
      case 2:
        stageText = "일병";
        break;
      case 3:
        stageText = "상병";
        break;
      case 4:
        stageText = "병장";
        break;
      case 5:
        stageText = "전문하사";
        break;
      default:
        stageText = this.stageIndex;
    }
    const stageX = 20 * this.scaleRatio; // 왼쪽 여백
    this.ctx.fillText(`STAGE: ${stageText}`, stageX, y);

    this.ctx.fillText(`복무일: ${scorePadded}`, scoreX, y);
    this.ctx.fillText(`HI ${highScorePadded}`, highScoreX, y);
  }
}

export default Score;
