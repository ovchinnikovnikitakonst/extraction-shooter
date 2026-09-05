import * as Phaser from "phaser";
import { Scene } from "phaser";

import {
  getStashItemAmount,
  sellAllStashItems,
  sellStashItem,
} from "../systems/stashState";

import { addMoney, getMoney } from "../systems/moneyState";

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
      .text(centerX, 90, "STASH", {
        fontSize: "42px",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    this.add
      .text(centerX, 135, `Total value: $${totalValue}`, {
        fontSize: "18px",
        color: "#aaaaaa",
      })
      .setOrigin(0.5);

    this.add
      .text(centerX, 165, `Money: $${money}`, {
        fontSize: "18px",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    const scrapSlot = createInventorySlot({
      scene: this,
      x: centerX - 150,
      y: 250,
      label: "SCRAP",
      amount: scrapAmount,
    });

    makeSellable(scrapSlot, "scrap");

    this.add
      .text(centerX - 150, 315, `$${scrapValue}`, {
        fontSize: "16px",
        color: "#aaaaaa",
      })
      .setOrigin(0.5);

    const ammoSlot = createInventorySlot({
      scene: this,
      x: centerX,
      y: 250,
      label: "AMMO",
      amount: ammoAmount,
    });

    makeSellable(ammoSlot, "ammo");

    this.add
      .text(centerX, 315, `$${ammoValue}`, {
        fontSize: "16px",
        color: "#aaaaaa",
      })
      .setOrigin(0.5);

    const medkitSlot = createInventorySlot({
      scene: this,
      x: centerX + 150,
      y: 250,
      label: "MEDKIT",
      amount: medkitAmount,
    });

    makeSellable(medkitSlot, "medkit");

    this.add
      .text(centerX + 150, 315, `$${medkitValue}`, {
        fontSize: "16px",
        color: "#aaaaaa",
      })
      .setOrigin(0.5);

    const electronicsSlot = createInventorySlot({
      scene: this,
      x: centerX - 150,
      y: 390,
      label: "ELECTRONICS",
      amount: electronicsAmount,
    });

    makeSellable(electronicsSlot, "electronics");

    this.add
      .text(centerX - 150, 455, `$${electronicsValue}`, {
        fontSize: "16px",
        color: "#aaaaaa",
      })
      .setOrigin(0.5);

    const foodSlot = createInventorySlot({
      scene: this,
      x: centerX,
      y: 390,
      label: "FOOD",
      amount: foodAmount,
    });

    makeSellable(foodSlot, "food");

    this.add
      .text(centerX, 455, `$${foodValue}`, {
        fontSize: "16px",
        color: "#aaaaaa",
      })
      .setOrigin(0.5);

    const valuableSlot = createInventorySlot({
      scene: this,
      x: centerX + 150,
      y: 390,
      label: "VALUABLE",
      amount: valuableAmount,
    });

    makeSellable(valuableSlot, "valuable");

    this.add
      .text(centerX + 150, 455, `$${valuableValue}`, {
        fontSize: "16px",
        color: "#aaaaaa",
      })
      .setOrigin(0.5);

    const sellButton = this.add
      .text(centerX, 510, "SELL ALL", {
        fontSize: "18px",
        color: "#ffffff",
        backgroundColor: "#333333",
        padding: {
          x: 16,
          y: 8,
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

    const shopButton = this.add
      .text(centerX - 90, 570, "OPEN SHOP", {
        fontSize: "18px",
        color: "#ffffff",
        backgroundColor: "#333333",
        padding: {
          x: 16,
          y: 8,
        },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    shopButton.on("pointerdown", () => {
      this.scene.start("ShopScene");
    });

    const equipmentButton = this.add
      .text(centerX + 90, 570, "EQUIPMENT", {
        fontSize: "18px",
        color: "#ffffff",
        backgroundColor: "#333333",
        padding: {
          x: 16,
          y: 8,
        },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    equipmentButton.on("pointerdown", () => {
      this.scene.start("EquipmentScene");
    });

    this.add
      .text(centerX, 650, "Press R to start raid", {
        fontSize: "20px",
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
