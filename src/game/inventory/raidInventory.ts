import type { InventoryItem, ItemType } from "./types";
import { RAID_CONFIG } from "../config/raidConfig";

export type RaidInventory = InventoryItem[];

export const createRaidInventory = (): RaidInventory => [];

export const addItemToInventory = (
  inventory: RaidInventory,
  type: ItemType,
  amount = 1,
): RaidInventory => {
  const existingItem = inventory.find((item) => item.type === type);

  if (existingItem) {
    return inventory.map((item) =>
      item.type === type
        ? {
            ...item,
            amount: item.amount + amount,
          }
        : item,
    );
  }

  if (!hasInventorySpace(inventory)) {
    return inventory;
  }

  return [
    ...inventory,
    {
      type,
      amount,
    },
  ];
};

export const getItemAmount = (inventory: RaidInventory, type: ItemType) => {
  return inventory.find((item) => item.type === type)?.amount ?? 0;
};

export const removeItemFromInventory = (
  inventory: RaidInventory,
  type: ItemType,
  amount = 1,
): RaidInventory => {
  return inventory
    .map((item) =>
      item.type === type
        ? {
            ...item,
            amount: Math.max(0, item.amount - amount),
          }
        : item,
    )
    .filter((item) => item.amount > 0);
};

export const getUsedSlots = (inventory: RaidInventory) => {
  return inventory.length;
};

export const hasInventorySpace = (inventory: RaidInventory) => {
  return getUsedSlots(inventory) < RAID_CONFIG.inventory.maxSlots;
};
