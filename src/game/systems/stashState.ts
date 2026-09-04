import type { InventoryItem, ItemType } from "../inventory/types";

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
