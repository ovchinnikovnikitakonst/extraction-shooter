import * as Phaser from "phaser";
import { Scene } from "phaser";

import {
  addItemToStash,
  getStashItemAmount,
  removeItemFromStash,
  sellAllStashItems,
  sellStashItem,
} from "../systems/stashState";

import { addMoney, getMoney, spendMoney } from "../systems/moneyState";

import { addItemToLoadout, getLoadoutState } from "../systems/loadoutState";

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

    const loadout = getLoadoutState();

    const loadoutAmmo =
      loadout.find((item) => item.type === "ammo")?.amount ?? 0;

    const loadoutMedkit =
      loadout.find((item) => item.type === "medkit")?.amount ?? 0;

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
      .text(centerX, 70, "STASH", {
        fontSize: "42px",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    this.add
      .text(centerX, 115, `Total value: $${totalValue}`, {
        fontSize: "18px",
        color: "#aaaaaa",
      })
      .setOrigin(0.5);

    this.add
      .text(centerX, 145, `Money: $${money}`, {
        fontSize: "18px",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    const scrapSlot = createInventorySlot({
      scene: this,
      x: centerX - 150,
      y: 230,
      label: "SCRAP",
      amount: scrapAmount,
    });

    makeSellable(scrapSlot, "scrap");

    this.add
      .text(centerX - 150, 295, `$${scrapValue}`, {
        fontSize: "16px",
        color: "#aaaaaa",
      })
      .setOrigin(0.5);

    const ammoSlot = createInventorySlot({
      scene: this,
      x: centerX,
      y: 230,
      label: "AMMO",
      amount: ammoAmount,
    });

    makeSellable(ammoSlot, "ammo");

    this.add
      .text(centerX, 295, `$${ammoValue}`, {
        fontSize: "16px",
        color: "#aaaaaa",
      })
      .setOrigin(0.5);

    const medkitSlot = createInventorySlot({
      scene: this,
      x: centerX + 150,
      y: 230,
      label: "MEDKIT",
      amount: medkitAmount,
    });

    makeSellable(medkitSlot, "medkit");

    this.add
      .text(centerX + 150, 295, `$${medkitValue}`, {
        fontSize: "16px",
        color: "#aaaaaa",
      })
      .setOrigin(0.5);

    const electronicsSlot = createInventorySlot({
      scene: this,
      x: centerX - 150,
      y: 370,
      label: "ELECTRONICS",
      amount: electronicsAmount,
    });

    makeSellable(electronicsSlot, "electronics");

    this.add
      .text(centerX - 150, 435, `$${electronicsValue}`, {
        fontSize: "16px",
        color: "#aaaaaa",
      })
      .setOrigin(0.5);

    const foodSlot = createInventorySlot({
      scene: this,
      x: centerX,
      y: 370,
      label: "FOOD",
      amount: foodAmount,
    });

    makeSellable(foodSlot, "food");

    this.add
      .text(centerX, 435, `$${foodValue}`, {
        fontSize: "16px",
        color: "#aaaaaa",
      })
      .setOrigin(0.5);

    const valuableSlot = createInventorySlot({
      scene: this,
      x: centerX + 150,
      y: 370,
      label: "VALUABLE",
      amount: valuableAmount,
    });

    makeSellable(valuableSlot, "valuable");

    this.add
      .text(centerX + 150, 435, `$${valuableValue}`, {
        fontSize: "16px",
        color: "#aaaaaa",
      })
      .setOrigin(0.5);

    const sellButton = this.add
      .text(centerX, 485, "SELL ALL", {
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

    this.add
      .text(centerX, 525, "SHOP", {
        fontSize: "16px",
        color: "#888888",
      })
      .setOrigin(0.5);

    const buyAmmoButton = this.add
      .text(centerX - 130, 565, "BUY AMMO x30\n$100", {
        fontSize: "16px",
        color: "#ffffff",
        backgroundColor: "#333333",
        align: "center",
        padding: {
          x: 12,
          y: 8,
        },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    buyAmmoButton.on("pointerdown", () => {
      const bought = spendMoney(100);

      if (!bought) {
        return;
      }

      addItemToStash("ammo", 30);

      this.scene.restart();
    });

    const buyMedkitButton = this.add
      .text(centerX + 130, 565, "BUY MEDKIT x1\n$150", {
        fontSize: "16px",
        color: "#ffffff",
        backgroundColor: "#333333",
        align: "center",
        padding: {
          x: 12,
          y: 8,
        },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    buyMedkitButton.on("pointerdown", () => {
      const bought = spendMoney(150);

      if (!bought) {
        return;
      }

      addItemToStash("medkit", 1);

      this.scene.restart();
    });

    this.add
      .text(
        centerX,
        625,
        `LOADOUT: Ammo x${loadoutAmmo} | Medkit x${loadoutMedkit}`,
        {
          fontSize: "16px",
          color: "#ffffff",
        },
      )
      .setOrigin(0.5);

    const takeAmmoButton = this.add
      .text(centerX - 130, 665, "TAKE AMMO x30", {
        fontSize: "15px",
        color: "#ffffff",
        backgroundColor: "#333333",
        padding: {
          x: 10,
          y: 8,
        },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    takeAmmoButton.on("pointerdown", () => {
      const removed = removeItemFromStash("ammo", 30);

      if (!removed) {
        return;
      }

      addItemToLoadout("ammo", 30);

      this.scene.restart();
    });

    const takeMedkitButton = this.add
      .text(centerX + 130, 665, "TAKE MEDKIT x1", {
        fontSize: "15px",
        color: "#ffffff",
        backgroundColor: "#333333",
        padding: {
          x: 10,
          y: 8,
        },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    takeMedkitButton.on("pointerdown", () => {
      const removed = removeItemFromStash("medkit", 1);

      if (!removed) {
        return;
      }

      addItemToLoadout("medkit", 1);

      this.scene.restart();
    });

    this.add
      .text(centerX, 720, "Press R to start raid", {
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
