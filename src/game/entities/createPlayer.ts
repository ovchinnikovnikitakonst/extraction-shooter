import * as Phaser from "phaser";

export const createPlayer = (scene: Phaser.Scene, x: number, y: number) => {
  const graphics = scene.add.graphics();

  graphics.fillStyle(0xffffff);
  graphics.fillRect(0, 0, 40, 20);

  graphics.generateTexture("player", 40, 20);

  graphics.destroy();

  const player = scene.physics.add.sprite(x, y, "player");

  player.setCollideWorldBounds(true);

  return player;
};
