import * as Phaser from "phaser";

import type { Loot } from "./loot";
import type { ItemType } from "../inventory/types";

export const createLootTexture = (scene: Phaser.Scene) => {
  if (!scene.textures.exists("loot-scrap")) {
    const graphics = scene.add.graphics();

    graphics.fillStyle(0x33ff99);
    graphics.fillRect(0, 0, 16, 16);

    graphics.generateTexture("loot-scrap", 16, 16);

    graphics.destroy();
  }

  if (!scene.textures.exists("loot-ammo")) {
    const graphics = scene.add.graphics();

    graphics.fillStyle(0xffcc33);
    graphics.fillRect(0, 0, 16, 16);

    graphics.generateTexture("loot-ammo", 16, 16);

    graphics.destroy();
  }
};

export const createLoot = (
  scene: Phaser.Scene,
  x: number,
  y: number,
  type: ItemType = "scrap",
): Loot => ({
  sprite: scene.physics.add.image(x, y, `loot-${type}`),
  type,
});
