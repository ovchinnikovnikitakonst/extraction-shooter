import * as Phaser from "phaser";
import { Scene } from "phaser";

import { getStashItemAmount } from "../systems/stashState";

export class StashScene extends Scene {
  private startRaidKey!: Phaser.Input.Keyboard.Key;

  constructor() {
    super("StashScene");
  }

  create() {
    const scrapAmount = getStashItemAmount("scrap");

    const ammoAmount = getStashItemAmount("ammo");

    const medkitAmount = getStashItemAmount("medkit");

    this.add
      .text(this.scale.width / 2, 250, "STASH", {
        fontSize: "48px",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    this.add
      .text(
        this.scale.width / 2,
        350,
        [
          `Scrap: ${scrapAmount}`,
          `Ammo: ${ammoAmount}`,
          `Medkit: ${medkitAmount}`,
        ].join("\n"),
        {
          fontSize: "28px",
          color: "#ffffff",
          align: "center",
        },
      )
      .setOrigin(0.5);

    this.add
      .text(this.scale.width / 2, 480, "Press R to start raid", {
        fontSize: "22px",
        color: "#aaaaaa",
      })
      .setOrigin(0.5);

    const keyboard = this.input.keyboard;

    if (!keyboard) {
      return;
    }

    this.startRaidKey = keyboard.addKey("R");
  }

  update() {
    if (Phaser.Input.Keyboard.JustDown(this.startRaidKey)) {
      this.scene.start("RaidScene");
    }
  }
}
