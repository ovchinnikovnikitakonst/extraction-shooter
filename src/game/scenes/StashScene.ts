import * as Phaser from "phaser";
import { Scene } from "phaser";

import { getStashItemAmount } from "../systems/stashState";
import { createInventorySlot } from "../ui/createInventorySlot";

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

    const centerX = this.scale.width / 2;

    createInventorySlot({
      scene: this,
      x: centerX - 150,
      y: 360,
      label: "SCRAP",
      amount: scrapAmount,
    });

    createInventorySlot({
      scene: this,
      x: centerX,
      y: 360,
      label: "AMMO",
      amount: ammoAmount,
    });

    createInventorySlot({
      scene: this,
      x: centerX + 150,
      y: 360,
      label: "MEDKIT",
      amount: medkitAmount,
    });

    this.add
      .text(this.scale.width / 2, 500, "Press R to start raid", {
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
