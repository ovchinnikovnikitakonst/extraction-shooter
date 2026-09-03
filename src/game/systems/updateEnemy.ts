import * as Phaser from "phaser";

import type { Enemy } from "../entities/enemy";
import { RAID_CONFIG } from "../config/raidConfig";
import { getEnemyVelocity } from "./enemyMovement";

export const updateEnemy = (
  enemy: Enemy,
  player: Phaser.Physics.Arcade.Sprite,
) => {
  if (!enemy.sprite.active) {
    return;
  }

  const distanceToPlayer = Phaser.Math.Distance.Between(
    enemy.sprite.x,
    enemy.sprite.y,
    player.x,
    player.y,
  );

  const { aggroDistance, loseAggroDistance, speed } = RAID_CONFIG.enemy;

  if (distanceToPlayer <= aggroDistance) {
    enemy.aggro = true;
  }

  if (distanceToPlayer >= loseAggroDistance) {
    enemy.aggro = false;
  }

  if (!enemy.aggro) {
    enemy.sprite.setVelocity(0, 0);
    return;
  }

  const velocity = getEnemyVelocity(
    enemy.sprite.x,
    enemy.sprite.y,
    player.x,
    player.y,
    speed,
  );

  enemy.sprite.setVelocity(velocity.x, velocity.y);
};
