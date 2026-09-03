import * as Phaser from "phaser";

export const createBulletTexture = (scene: Phaser.Scene) => {
  const graphics = scene.add.graphics();

  graphics.fillStyle(0xffff00);
  graphics.fillCircle(4, 4, 4);

  graphics.generateTexture("bullet", 8, 8);

  graphics.destroy();
};
