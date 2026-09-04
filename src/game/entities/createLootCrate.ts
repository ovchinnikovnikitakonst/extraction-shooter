import * as Phaser from "phaser";

import type { LootCrate } from "./lootCrate";

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
  };
};
