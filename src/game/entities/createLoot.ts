import * as Phaser from "phaser";
import type { Loot } from "./loot";

export const createLootTexture = (scene: Phaser.Scene) => {
  const graphics = scene.add.graphics();

  graphics.fillStyle(0x33ff99);
  graphics.fillRect(0, 0, 16, 16);

  graphics.generateTexture("loot-scrap", 16, 16);

  graphics.destroy();
};

export const createLoot = (
  scene: Phaser.Scene,
  x: number,
  y: number,
): Loot => ({
  sprite: scene.physics.add.image(x, y, "loot-scrap"),
  type: "scrap",
});
