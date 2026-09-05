import * as Phaser from "phaser";

import { RAID_CONFIG } from "../config/raidConfig";
import { getShotDirection } from "./shooting";

const BULLET_MAX_DISTANCE = 1200;

export const shootBullet = (
  scene: Phaser.Scene,
  player: Phaser.Physics.Arcade.Sprite,
  bullets: Phaser.Physics.Arcade.Group,
  pointer: Phaser.Input.Pointer,
  damage: number,
) => {
  const worldPoint = scene.cameras.main.getWorldPoint(pointer.x, pointer.y);

  const direction = getShotDirection(
    player.x,
    player.y,
    worldPoint.x,
    worldPoint.y,
  );

  const bullet = bullets.create(
    player.x,
    player.y,
    "bullet",
  ) as Phaser.Physics.Arcade.Image;

  bullet.setData("damage", damage);

  bullet.setData("startX", player.x);
  bullet.setData("startY", player.y);

  bullet.setVelocity(
    direction.x * RAID_CONFIG.bullet.speed,
    direction.y * RAID_CONFIG.bullet.speed,
  );

  scene.events.on("update", () => {
    if (!bullet.active) {
      return;
    }

    const distance = Phaser.Math.Distance.Between(
      bullet.getData("startX"),
      bullet.getData("startY"),
      bullet.x,
      bullet.y,
    );

    if (distance >= BULLET_MAX_DISTANCE) {
      bullet.destroy();
    }
  });
};
