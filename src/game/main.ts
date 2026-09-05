import { AUTO, Game } from "phaser";
import { Boot } from "./scenes/Boot";
import { Preloader } from "./scenes/Preloader";
import { RaidScene } from "./scenes/RaidScene";
import { StashScene } from "./scenes/StashScene";
import { ShopScene } from "./scenes/ShopScene";
import { EquipmentScene } from "./scenes/EquipmentScene";

const config: Phaser.Types.Core.GameConfig = {
  type: AUTO,
  width: 1024,
  height: 768,
  parent: "game-container",
  backgroundColor: "#1b1f1b",

  physics: {
    default: "arcade",
    arcade: {
      debug: false,
    },
  },

  scene: [Boot, Preloader, StashScene, ShopScene, EquipmentScene, RaidScene],
};

const StartGame = (parent: string) => {
  return new Game({
    ...config,
    parent,
  });
};

export default StartGame;
