import * as Phaser from "phaser";

import { ENEMY_CONFIG, type EnemyType } from "../config/enemyConfig";

export const createEnemy = (
  scene: Phaser.Scene,
  x: number,
  y: number,
  type: EnemyType,
) => {
  const config = ENEMY_CONFIG[type];

  const textureKey = `enemy-${type}`;

  if (!scene.textures.exists(textureKey)) {
    const graphics = scene.add.graphics();

    graphics.fillStyle(config.color);

    graphics.fillRect(0, 0, config.size, config.size);

    graphics.generateTexture(textureKey, config.size, config.size);

    graphics.destroy();
  }

  return scene.physics.add.sprite(x, y, textureKey);
};
