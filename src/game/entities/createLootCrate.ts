import * as Phaser from "phaser";

import type { LootCrate } from "./lootCrate";
import type { ItemType } from "../inventory/types";

const getRandomLootType = (): ItemType => {
  const roll = Math.random();

  if (roll < 0.25) return "scrap";
  if (roll < 0.45) return "ammo";
  if (roll < 0.6) return "medkit";
  if (roll < 0.75) return "electronics";
  if (roll < 0.9) return "food";

  return "valuable";
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
    lootType: getRandomLootType(),
  };
};
