import { AUTO, Game } from "phaser";
import { Boot } from "./scenes/Boot";
import { Preloader } from "./scenes/Preloader";
import { RaidScene } from "./scenes/RaidScene";
import { StashScene } from "./scenes/StashScene";

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

  scene: [Boot, Preloader, StashScene, RaidScene],
};

const StartGame = (parent: string) => {
  return new Game({
    ...config,
    parent,
  });
};

export default StartGame;
