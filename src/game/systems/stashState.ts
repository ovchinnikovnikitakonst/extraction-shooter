import type { InventoryItem, ItemType } from "../inventory/types";
import { ITEM_CONFIG } from "../inventory/itemConfig";

export type StashState = InventoryItem[];

let stashState: StashState = [];

export const getStashState = () => stashState;

export const addItemToStash = (type: ItemType, amount: number) => {
  const existingItem = stashState.find((item) => item.type === type);

  if (!existingItem) {
    stashState = [
      ...stashState,
      {
        type,
        amount,
      },
    ];

    return;
  }

  stashState = stashState.map((item) =>
    item.type === type
      ? {
          ...item,
          amount: item.amount + amount,
        }
      : item,
  );
};

export const addInventoryToStash = (inventory: InventoryItem[]) => {
  for (const item of inventory) {
    addItemToStash(item.type, item.amount);
  }
};

export const getStashItemAmount = (type: ItemType) => {
  return stashState.find((item) => item.type === type)?.amount ?? 0;
};

export const sellAllStashItems = () => {
  const totalValue = stashState.reduce((total, item) => {
    return total + item.amount * ITEM_CONFIG[item.type].value;
  }, 0);

  stashState = [];

  return totalValue;
};

export const sellStashItem = (type: ItemType) => {
  const item = stashState.find((stashItem) => stashItem.type === type);

  if (!item) {
    return 0;
  }

  const value = item.amount * ITEM_CONFIG[type].value;

  stashState = stashState.filter((stashItem) => stashItem.type !== type);

  return value;
};

export const removeItemFromStash = (type: ItemType, amount: number) => {
  const item = stashState.find((stashItem) => stashItem.type === type);

  if (!item || item.amount < amount) {
    return false;
  }

  if (item.amount === amount) {
    stashState = stashState.filter((stashItem) => stashItem.type !== type);

    return true;
  }

  stashState = stashState.map((stashItem) =>
    stashItem.type === type
      ? {
          ...stashItem,
          amount: stashItem.amount - amount,
        }
      : stashItem,
  );

  return true;
};
