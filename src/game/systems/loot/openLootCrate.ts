import * as Phaser from "phaser";

import type { LootCrate } from "../../entities/lootCrate";

type OpenLootCrateParams = {
  player: Phaser.Physics.Arcade.Sprite;
  crate: LootCrate;
  interactDistance: number;
};

export const openLootCrate = ({
  player,
  crate,
  interactDistance,
}: OpenLootCrateParams) => {
  const distance = Phaser.Math.Distance.Between(
    player.x,
    player.y,
    crate.sprite.x,
    crate.sprite.y,
  );

  if (distance > interactDistance) {
    return {
      opened: false,
      crate: null,
    };
  }

  return {
    opened: true,
    crate,
  };
};
