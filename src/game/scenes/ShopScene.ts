import { Scene } from "phaser";

import { addItemToStash } from "../systems/stashState";

import { getMoney, spendMoney } from "../systems/moneyState";

import { buyWeapon, getOwnedWeapons } from "../weapons/weaponState";

import { WEAPON_CONFIG } from "../weapons/weaponConfig";

import { ARMOR_CONFIG } from "../armor/armorConfig";

import { buyArmor, getOwnedArmor } from "../armor/armorState";

export class ShopScene extends Scene {
  constructor() {
    super("ShopScene");
  }

  create() {
    const centerX = this.scale.width / 2;

    const money = getMoney();

    const ownedWeapons = getOwnedWeapons();
    const ownedArmor = getOwnedArmor();

    const hasRifle = ownedWeapons.includes("rifle");

    const hasLightArmor = ownedArmor.includes("light");
    const hasHeavyArmor = ownedArmor.includes("heavy");

    this.add
      .text(centerX, 65, "SHOP", {
        fontSize: "42px",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    this.add
      .text(centerX, 105, `Money: $${money}`, {
        fontSize: "18px",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    this.add
      .text(centerX, 155, "CONSUMABLES", {
        fontSize: "20px",
        color: "#aaaaaa",
      })
      .setOrigin(0.5);

    const buyAmmoButton = this.add
      .text(centerX - 130, 205, "BUY AMMO x30\n$100", {
        fontSize: "16px",
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
      .text(centerX + 130, 205, "BUY MEDKIT x1\n$150", {
        fontSize: "16px",
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
      .text(centerX, 285, "WEAPONS", {
        fontSize: "20px",
        color: "#aaaaaa",
      })
      .setOrigin(0.5);

    this.add
      .text(centerX - 130, 335, "PISTOL\nOWNED", {
        fontSize: "16px",
        color: "#ffffff",
        backgroundColor: "#333333",
        align: "center",
        padding: {
          x: 18,
          y: 10,
        },
      })
      .setOrigin(0.5);

    const rifleButton = this.add
      .text(
        centerX + 130,
        335,
        hasRifle ? "RIFLE\nOWNED" : `BUY RIFLE\n$${WEAPON_CONFIG.rifle.price}`,
        {
          fontSize: "16px",
          color: "#ffffff",
          backgroundColor: "#333333",
          align: "center",
          padding: {
            x: 18,
            y: 10,
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

    this.add
      .text(centerX, 415, "ARMOR", {
        fontSize: "20px",
        color: "#aaaaaa",
      })
      .setOrigin(0.5);

    const lightArmorButton = this.add
      .text(
        centerX - 130,
        475,
        hasLightArmor
          ? "LIGHT ARMOR\nOWNED"
          : `BUY LIGHT ARMOR\n$${ARMOR_CONFIG.light.price}`,
        {
          fontSize: "16px",
          color: "#ffffff",
          backgroundColor: "#333333",
          align: "center",
          padding: {
            x: 16,
            y: 10,
          },
        },
      )
      .setOrigin(0.5);

    if (!hasLightArmor) {
      lightArmorButton
        .setInteractive({ useHandCursor: true })
        .on("pointerdown", () => {
          const bought = spendMoney(ARMOR_CONFIG.light.price);

          if (!bought) {
            return;
          }

          buyArmor("light");

          this.scene.restart();
        });
    }

    const heavyArmorButton = this.add
      .text(
        centerX + 130,
        475,
        hasHeavyArmor
          ? "HEAVY ARMOR\nOWNED"
          : `BUY HEAVY ARMOR\n$${ARMOR_CONFIG.heavy.price}`,
        {
          fontSize: "16px",
          color: "#ffffff",
          backgroundColor: "#333333",
          align: "center",
          padding: {
            x: 16,
            y: 10,
          },
        },
      )
      .setOrigin(0.5);

    if (!hasHeavyArmor) {
      heavyArmorButton
        .setInteractive({ useHandCursor: true })
        .on("pointerdown", () => {
          const bought = spendMoney(ARMOR_CONFIG.heavy.price);

          if (!bought) {
            return;
          }

          buyArmor("heavy");

          this.scene.restart();
        });
    }

    const backButton = this.add
      .text(centerX, 590, "BACK TO STASH", {
        fontSize: "18px",
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
