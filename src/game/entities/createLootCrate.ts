import * as Phaser from "phaser";

import type { LootCrate } from "./lootCrate";
import type { InventoryItem, ItemType } from "../inventory/types";
import { ITEM_CONFIG } from "../inventory/itemConfig";
import type { ItemRarity } from "../inventory/itemConfig";

const RARITY_WEIGHTS: Record<ItemRarity, number> = {
  common: 60,
  uncommon: 25,
  rare: 10,
  epic: 5,
};

const getRandomRarity = (): ItemRarity => {
  const roll = Phaser.Math.Between(1, 100);

  if (roll <= RARITY_WEIGHTS.common) {
    return "common";
  }

  if (roll <= RARITY_WEIGHTS.common + RARITY_WEIGHTS.uncommon) {
    return "uncommon";
  }

  if (
    roll <=
    RARITY_WEIGHTS.common + RARITY_WEIGHTS.uncommon + RARITY_WEIGHTS.rare
  ) {
    return "rare";
  }

  return "epic";
};

const getRandomLootType = (): ItemType => {
  const rarity = getRandomRarity();

  const availableTypes = (Object.keys(ITEM_CONFIG) as ItemType[]).filter(
    (type) => ITEM_CONFIG[type].rarity === rarity,
  );

  return Phaser.Utils.Array.GetRandom(availableTypes);
};

const createLootCrateItems = (): InventoryItem[] => {
  const itemCount = Phaser.Math.Between(1, 3);

  const items: InventoryItem[] = [];

  for (let i = 0; i < itemCount; i += 1) {
    const type = getRandomLootType();

    const existingItem = items.find((item) => item.type === type);

    const amount = getRandomItemAmount(type);

    if (existingItem) {
      existingItem.amount += amount;
      continue;
    }

    items.push({
      type,
      amount,
    });
  }

  return items;
};

export const createLootCrate = (
  scene: Phaser.Scene,
  x: number,
  y: number,
): LootCrate => {
  const sprite = scene.add
    .rectangle(x, y, 48, 48, 0x8b5a2b, 1)
    .setStrokeStyle(2, 0xd2a679);

  return {
    sprite,
    opened: false,
    items: createLootCrateItems(),
  };
};

const getRandomItemAmount = (type: ItemType) => {
  switch (type) {
    case "ammo":
      return Phaser.Math.Between(15, 45);

    case "medkit":
      return Phaser.Math.Between(1, 2);

    case "scrap":
      return Phaser.Math.Between(3, 10);

    case "electronics":
      return Phaser.Math.Between(1, 3);

    case "food":
      return Phaser.Math.Between(1, 3);

    case "valuable":
      return 1;
  }
};
