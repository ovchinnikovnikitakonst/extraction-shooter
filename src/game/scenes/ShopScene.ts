import * as Phaser from "phaser";
import { Scene } from "phaser";

import { addItemToStash } from "../systems/stashState";

import { getMoney, spendMoney } from "../systems/moneyState";

import { buyWeapon, getOwnedWeapons } from "../weapons/weaponState";

import { WEAPON_CONFIG } from "../weapons/weaponConfig";

export class ShopScene extends Scene {
  constructor() {
    super("ShopScene");
  }

  create() {
    const centerX = this.scale.width / 2;

    const money = getMoney();

    const ownedWeapons = getOwnedWeapons();

    const hasRifle = ownedWeapons.includes("rifle");

    this.add
      .text(centerX, 100, "SHOP", {
        fontSize: "48px",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    this.add
      .text(centerX, 155, `Money: $${money}`, {
        fontSize: "20px",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    this.add
      .text(centerX, 220, "CONSUMABLES", {
        fontSize: "22px",
        color: "#aaaaaa",
      })
      .setOrigin(0.5);

    const buyAmmoButton = this.add
      .text(centerX - 130, 280, "BUY AMMO x30\n$100", {
        fontSize: "18px",
        color: "#ffffff",
        backgroundColor: "#333333",
        align: "center",
        padding: {
          x: 14,
          y: 10,
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
      .text(centerX + 130, 280, "BUY MEDKIT x1\n$150", {
        fontSize: "18px",
        color: "#ffffff",
        backgroundColor: "#333333",
        align: "center",
        padding: {
          x: 14,
          y: 10,
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
      .text(centerX, 380, "WEAPONS", {
        fontSize: "22px",
        color: "#aaaaaa",
      })
      .setOrigin(0.5);

    this.add
      .text(centerX - 130, 450, "PISTOL\nOWNED", {
        fontSize: "18px",
        color: "#ffffff",
        backgroundColor: "#333333",
        align: "center",
        padding: {
          x: 18,
          y: 12,
        },
      })
      .setOrigin(0.5);

    const rifleButton = this.add
      .text(
        centerX + 130,
        450,
        hasRifle ? "RIFLE\nOWNED" : `BUY RIFLE\n$${WEAPON_CONFIG.rifle.price}`,
        {
          fontSize: "18px",
          color: "#ffffff",
          backgroundColor: "#333333",
          align: "center",
          padding: {
            x: 18,
            y: 12,
          },
        },
      )
      .setOrigin(0.5);

    if (!hasRifle) {
      rifleButton
        .setInteractive({ useHandCursor: true })
        .on("pointerdown", () => {
          const bought = spendMoney(WEAPON_CONFIG.rifle.price);

          if (!bought) {
            return;
          }

          buyWeapon("rifle");

          this.scene.restart();
        });
    }

    const backButton = this.add
      .text(centerX, 600, "BACK TO STASH", {
        fontSize: "20px",
        color: "#ffffff",
        backgroundColor: "#333333",
        padding: {
          x: 18,
          y: 10,
        },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    backButton.on("pointerdown", () => {
      this.scene.start("StashScene");
    });
  }
}
