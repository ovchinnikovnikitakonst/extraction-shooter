import * as Phaser from "phaser";

import type { Enemy } from "../entities/enemy";
import type { Loot } from "../entities/loot";

import { RAID_CONFIG } from "../config/raidConfig";
import { createLoot } from "../entities/createLoot";

import { applyDamage, isEnemyDead } from "./enemyState";

export const setupBulletEnemyOverlap = (
  scene: Phaser.Scene,
  bullets: Phaser.Physics.Arcade.Group,
  enemy: Enemy,
  loot: Loot[],
) => {
  scene.physics.add.overlap(bullets, enemy.sprite, (object1, object2) => {
    const first = object1 as Phaser.Physics.Arcade.Image;

    const second = object2 as Phaser.Physics.Arcade.Image;

    const bullet = first.texture.key === "bullet" ? first : second;

    bullet.disableBody(true, true);

    enemy.state = applyDamage(enemy.state, RAID_CONFIG.bullet.damage);

    if (!isEnemyDead(enemy.state)) {
      return;
    }

    const lootType = Math.random() < 0.5 ? "scrap" : "ammo";

    const droppedLoot = createLoot(
      scene,
      enemy.sprite.x,
      enemy.sprite.y,
      lootType,
    );

    loot.push(droppedLoot);

    enemy.sprite.destroy();
  });
};
