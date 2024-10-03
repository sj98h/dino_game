import { getGameAssets } from "../init/assets.js";
import { getItems, setItems } from "../models/item.model.js";
export const itemHandler = (userId, payload) => {
  const { itemUnlock, items } = getGameAssets();
  if (
    !itemUnlock.data[payload.stageIndex - 1].item_id.some(
      (item) => item === payload.currentItem - 1,
    )
  ) {
    console.log("itemUnlock.data[0].item_id:", itemUnlock.data[payload.stageIndex].item_id);
    console.log("payload.currentItem:", payload.currentItem - 1);
    return { status: "fail", message: "아이템 없음" };
  }
  let currentItems = getItems(userId);
  if (!currentItems) {
    console.log(currentItems);
    return { status: "fail", message: "아이템이 상했어요" };
  }
  console.log(currentItems);
  if (items.itemFrequency) {
    items.itemFrequency = false;
    setTimeout(() => {
      items.itemFrequency = true;
    }, 1000);
    setItems(userId, payload.currentItem);
  } else if (!items.itemFrequency) {
    return { status: "fail", message: "범법 행위를 자제해주세요." };
  }
  return { status: "seccess", message: "아이템먹음" };
};
