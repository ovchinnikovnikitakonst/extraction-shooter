import * as Phaser from "phaser";

export const getShotDirection = (
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
) => {
  return new Phaser.Math.Vector2(toX - fromX, toY - fromY).normalize();
};
