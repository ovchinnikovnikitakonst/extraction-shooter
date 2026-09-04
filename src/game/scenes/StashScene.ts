import * as Phaser from "phaser";
import { Scene } from "phaser";

import {
  getStashItemAmount,
  sellAllStashItems,
  sellStashItem,
} from "../systems/stashState";

import { getMoney, addMoney } from "../systems/moneyState";

import { createInventorySlot } from "../ui/createInventorySlot";
import { ITEM_CONFIG } from "../inventory/itemConfig";

export class StashScene extends Scene {
  private startRaidKey!: Phaser.Input.Keyboard.Key;

  constructor() {
    super("StashScene");
  }

  create() {
    const scrapAmount = getStashItemAmount("scrap");
    const ammoAmount = getStashItemAmount("ammo");
    const medkitAmount = getStashItemAmount("medkit");
    const electronicsAmount = getStashItemAmount("electronics");
    const foodAmount = getStashItemAmount("food");
    const valuableAmount = getStashItemAmount("valuable");

    const scrapValue = scrapAmount * ITEM_CONFIG.scrap.value;

    const ammoValue = ammoAmount * ITEM_CONFIG.ammo.value;

    const medkitValue = medkitAmount * ITEM_CONFIG.medkit.value;

    const electronicsValue = electronicsAmount * ITEM_CONFIG.electronics.value;

    const foodValue = foodAmount * ITEM_CONFIG.food.value;

    const valuableValue = valuableAmount * ITEM_CONFIG.valuable.value;

    const totalValue =
      scrapValue +
      ammoValue +
      medkitValue +
      electronicsValue +
      foodValue +
      valuableValue;

    const money = getMoney();

    const centerX = this.scale.width / 2;

    const makeSellable = (
      slot: ReturnType<typeof createInventorySlot>,
      type: keyof typeof ITEM_CONFIG,
    ) => {
      slot.background
        .setInteractive({ useHandCursor: true })
        .on("pointerdown", () => {
          const soldValue = sellStashItem(type);

          if (soldValue <= 0) {
            return;
          }

          addMoney(soldValue);

          this.scene.restart();
        });
    };

    this.add
      .text(centerX, 220, "STASH", {
        fontSize: "48px",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    this.add
      .text(centerX, 275, `Total value: $${totalValue}`, {
        fontSize: "20px",
        color: "#aaaaaa",
      })
      .setOrigin(0.5);

    this.add
      .text(centerX, 305, `Money: $${money}`, {
        fontSize: "20px",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    const scrapSlot = createInventorySlot({
      scene: this,
      x: centerX - 150,
      y: 390,
      label: "SCRAP",
      amount: scrapAmount,
    });

    makeSellable(scrapSlot, "scrap");

    scrapSlot.background
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => {
        const soldValue = sellStashItem("scrap");

        if (soldValue <= 0) {
          return;
        }

        addMoney(soldValue);

        this.scene.restart();
      });

    this.add
      .text(centerX - 150, 455, `$${scrapValue}`, {
        fontSize: "16px",
        color: "#aaaaaa",
      })
      .setOrigin(0.5);

    const ammoSlot = createInventorySlot({
      scene: this,
      x: centerX,
      y: 390,
      label: "AMMO",
      amount: ammoAmount,
    });

    makeSellable(ammoSlot, "ammo");

    this.add
      .text(centerX, 455, `$${ammoValue}`, {
        fontSize: "16px",
        color: "#aaaaaa",
      })
      .setOrigin(0.5);

    const medkitSlot = createInventorySlot({
      scene: this,
      x: centerX + 150,
      y: 390,
      label: "MEDKIT",
      amount: medkitAmount,
    });

    makeSellable(medkitSlot, "medkit");
    this.add
      .text(centerX + 150, 455, `$${medkitValue}`, {
        fontSize: "16px",
        color: "#aaaaaa",
      })
      .setOrigin(0.5);

    const electronicsSlot = createInventorySlot({
      scene: this,
      x: centerX - 150,
      y: 530,
      label: "ELECTRONICS",
      amount: electronicsAmount,
    });

    makeSellable(electronicsSlot, "electronics");

    this.add
      .text(centerX - 150, 595, `$${electronicsValue}`, {
        fontSize: "16px",
        color: "#aaaaaa",
      })
      .setOrigin(0.5);

    const foodSlot = createInventorySlot({
      scene: this,
      x: centerX,
      y: 530,
      label: "FOOD",
      amount: foodAmount,
    });

    makeSellable(foodSlot, "food");

    this.add
      .text(centerX, 595, `$${foodValue}`, {
        fontSize: "16px",
        color: "#aaaaaa",
      })
      .setOrigin(0.5);

    const valuableSlot = createInventorySlot({
      scene: this,
      x: centerX + 150,
      y: 530,
      label: "VALUABLE",
      amount: valuableAmount,
    });

    makeSellable(valuableSlot, "valuable");

    this.add
      .text(centerX + 150, 595, `$${valuableValue}`, {
        fontSize: "16px",
        color: "#aaaaaa",
      })
      .setOrigin(0.5);

    const sellButton = this.add
      .text(centerX, 650, "SELL ALL", {
        fontSize: "22px",
        color: "#ffffff",
        backgroundColor: "#333333",
        padding: {
          x: 18,
          y: 10,
        },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    sellButton.on("pointerdown", () => {
      const soldValue = sellAllStashItems();

      if (soldValue <= 0) {
        return;
      }

      addMoney(soldValue);

      this.scene.restart();
    });

    this.add
      .text(centerX, 720, "Press R to start raid", {
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
