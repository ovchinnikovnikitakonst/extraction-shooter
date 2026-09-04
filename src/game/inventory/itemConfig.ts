import type { ItemType } from "./types";

export type ItemRarity = "common" | "uncommon" | "rare" | "epic";

type ItemConfig = {
  maxStack: number;
  rarity: ItemRarity;
  value: number;
};
export const ITEM_CONFIG: Record<ItemType, ItemConfig> = {
  ammo: {
    maxStack: 60,
    rarity: "common",
    value: 2,
  },

  medkit: {
    maxStack: 2,
    rarity: "uncommon",
    value: 40,
  },

  scrap: {
    maxStack: 20,
    rarity: "common",
    value: 5,
  },

  electronics: {
    maxStack: 5,
    rarity: "rare",
    value: 120,
  },

  food: {
    maxStack: 5,
    rarity: "common",
    value: 15,
  },

  valuable: {
    maxStack: 1,
    rarity: "epic",
    value: 500,
  },
};
