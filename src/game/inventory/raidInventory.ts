import type { InventoryItem, ItemType } from "./types";
import { RAID_CONFIG } from "../config/raidConfig";
import { ITEM_CONFIG } from "./itemConfig";

export type RaidInventory = InventoryItem[];

export const createRaidInventory = (): RaidInventory => [];

export const addItemToInventory = (
  inventory: RaidInventory,
  type: ItemType,
  amount = 1,
): RaidInventory => {
  const maxStack = ITEM_CONFIG[type].maxStack;

  const nextInventory = inventory.map((item) => ({ ...item }));

  let remainingAmount = amount;

  for (const item of nextInventory) {
    if (item.type !== type) {
      continue;
    }

    if (item.amount >= maxStack) {
      continue;
    }

    const freeSpace = maxStack - item.amount;
    const amountToAdd = Math.min(freeSpace, remainingAmount);

    item.amount += amountToAdd;
    remainingAmount -= amountToAdd;

    if (remainingAmount <= 0) {
      return nextInventory;
    }
  }

  while (
    remainingAmount > 0 &&
    nextInventory.length < RAID_CONFIG.inventory.maxSlots
  ) {
    const amountToAdd = Math.min(maxStack, remainingAmount);

    nextInventory.push({
      type,
      amount: amountToAdd,
    });

    remainingAmount -= amountToAdd;
  }

  return nextInventory;
};

export const getItemAmount = (inventory: RaidInventory, type: ItemType) => {
  return inventory.reduce(
    (total, item) => (item.type === type ? total + item.amount : total),
    0,
  );
};

export const removeItemFromInventory = (
  inventory: RaidInventory,
  type: ItemType,
  amount = 1,
): RaidInventory => {
  let remainingAmount = amount;

  return inventory
    .map((item) => {
      if (item.type !== type || remainingAmount <= 0) {
        return item;
      }

      const amountToRemove = Math.min(item.amount, remainingAmount);

      remainingAmount -= amountToRemove;

      return {
        ...item,
        amount: item.amount - amountToRemove,
      };
    })
    .filter((item) => item.amount > 0);
};

export const getUsedSlots = (inventory: RaidInventory) => {
  return inventory.length;
};

export const hasInventorySpace = (inventory: RaidInventory) => {
  return getUsedSlots(inventory) < RAID_CONFIG.inventory.maxSlots;
};
