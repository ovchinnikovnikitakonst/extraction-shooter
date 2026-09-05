import * as Phaser from "phaser";

import type { LootCrate, LootCrateType } from "./lootCrate";

import type { InventoryItem, ItemType } from "../inventory/types";

import type { ItemRarity } from "../inventory/itemConfig";

const CRATE_COLORS: Record<
  LootCrateType,
  {
    fill: number;
    stroke: number;
  }
> = {
  common: {
    fill: 0x8b5a2b,
    stroke: 0xd2a679,
  },

  rare: {
    fill: 0x3366ff,
    stroke: 0x99bbff,
  },

  military: {
    fill: 0x2e8b57,
    stroke: 0x7fffaa,
  },
};

const RARITY_WEIGHTS: Record<ItemRarity, number> = {
  common: 60,
  uncommon: 25,
  rare: 10,
  epic: 5,
};

const getRandomLootType = (crateType: LootCrateType): ItemType => {
  const pools: Record<LootCrateType, ItemType[]> = {
    common: ["scrap", "ammo", "food", "medkit"],

    rare: ["ammo", "medkit", "electronics", "valuable", "scrap"],

    military: ["ammo", "medkit", "electronics", "valuable"],
  };

  return Phaser.Utils.Array.GetRandom(pools[crateType]);
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

const getItemCount = (crateType: LootCrateType) => {
  switch (crateType) {
    case "common":
      return Phaser.Math.Between(1, 2);

    case "rare":
      return Phaser.Math.Between(2, 4);

    case "military":
      return Phaser.Math.Between(3, 5);
  }
};

const createLootCrateItems = (crateType: LootCrateType): InventoryItem[] => {
  const itemCount = getItemCount(crateType);

  const items: InventoryItem[] = [];

  for (let i = 0; i < itemCount; i += 1) {
    const type = getRandomLootType(crateType);

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
  type: LootCrateType = "common",
): LootCrate => {
  const colors = CRATE_COLORS[type];

  const sprite = scene.add
    .rectangle(x, y, 48, 48, colors.fill, 1)
    .setStrokeStyle(2, colors.stroke);

  return {
    sprite,
    opened: false,
    items: createLootCrateItems(type),
    type,
  };
};
