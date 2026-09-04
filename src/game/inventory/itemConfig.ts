import type { ItemType } from "./types";

type ItemConfig = {
  maxStack: number;
};

export const ITEM_CONFIG: Record<ItemType, ItemConfig> = {
  ammo: {
    maxStack: 60,
  },

  medkit: {
    maxStack: 2,
  },

  scrap: {
    maxStack: 20,
  },

  electronics: {
    maxStack: 5,
  },

  food: {
    maxStack: 5,
  },

  valuable: {
    maxStack: 1,
  },
};
