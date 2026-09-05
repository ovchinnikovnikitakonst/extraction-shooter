import type { InventoryItem, ItemType } from "../inventory/types";

export type LoadoutState = InventoryItem[];

let loadoutState: LoadoutState = [];

export const getLoadoutState = () => loadoutState;

export const addItemToLoadout = (type: ItemType, amount: number) => {
  const existingItem = loadoutState.find((item) => item.type === type);

  if (!existingItem) {
    loadoutState = [
      ...loadoutState,
      {
        type,
        amount,
      },
    ];

    return;
  }

  loadoutState = loadoutState.map((item) =>
    item.type === type
      ? {
          ...item,
          amount: item.amount + amount,
        }
      : item,
  );
};

export const clearLoadout = () => {
  loadoutState = [];
};
