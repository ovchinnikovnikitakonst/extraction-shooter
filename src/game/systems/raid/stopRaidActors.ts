import * as Phaser from "phaser";

import type { Enemy } from "../../entities/enemy";

export const stopRaidActors = (
  player: Phaser.Physics.Arcade.Sprite,
  enemies: Enemy[],
) => {
  player.setVelocity(0, 0);

  for (const enemy of enemies) {
    if (enemy.sprite.active) {
      enemy.sprite.setVelocity(0, 0);
    }
  }
};
