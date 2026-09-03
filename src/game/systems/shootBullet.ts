import * as Phaser from "phaser";

import { RAID_CONFIG } from "../config/raidConfig";
import { getShotDirection } from "./shooting";

export const shootBullet = (
  scene: Phaser.Scene,
  player: Phaser.Physics.Arcade.Sprite,
  bullets: Phaser.Physics.Arcade.Group,
  pointer: Phaser.Input.Pointer,
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

  bullet.setVelocity(
    direction.x * RAID_CONFIG.bullet.speed,
    direction.y * RAID_CONFIG.bullet.speed,
  );
};
