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

export const removeItemFromLoadout = (type: ItemType, amount: number) => {
  const item = loadoutState.find((loadoutItem) => loadoutItem.type === type);

  if (!item || item.amount < amount) {
    return false;
  }

  if (item.amount === amount) {
    loadoutState = loadoutState.filter(
      (loadoutItem) => loadoutItem.type !== type,
    );

    return true;
  }

  loadoutState = loadoutState.map((loadoutItem) =>
    loadoutItem.type === type
      ? {
          ...loadoutItem,
          amount: loadoutItem.amount - amount,
        }
      : loadoutItem,
  );

  return true;
};
