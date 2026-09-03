import * as Phaser from "phaser";

export const createEnemy = (scene: Phaser.Scene, x: number, y: number) => {
  const graphics = scene.add.graphics();

  graphics.fillStyle(0xff3333);
  graphics.fillRect(0, 0, 40, 40);

  graphics.generateTexture("enemy", 40, 40);

  graphics.destroy();

  return scene.physics.add.sprite(x, y, "enemy");
};
