import * as Phaser from "phaser";

import type { Enemy } from "../entities/enemy";
import type { Loot } from "../entities/loot";

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

    const damage = bullet.getData("damage") as number;

    enemy.state = applyDamage(enemy.state, damage);

    if (!isEnemyDead(enemy.state)) {
      return;
    }

    const roll = Math.random();

    const lootType =
      roll < 0.25
        ? "scrap"
        : roll < 0.45
          ? "ammo"
          : roll < 0.6
            ? "medkit"
            : roll < 0.75
              ? "electronics"
              : roll < 0.9
                ? "food"
                : "valuable";

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
