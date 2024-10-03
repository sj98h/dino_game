import { gameEnd, gameStart } from "./game.handler.js";
import { itemHandler } from "./item.handler.js";
import { moveStageHandler } from "./stage.handler.js";

const handlerMapping = {
  2: gameStart,
  3: gameEnd,
  10: itemHandler,
  11: moveStageHandler,
};

export default handlerMapping;
