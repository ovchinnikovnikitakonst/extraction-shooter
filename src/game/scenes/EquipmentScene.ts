import * as Phaser from "phaser";
import { Scene } from "phaser";

import {
  addItemToLoadout,
  getLoadoutState,
  removeItemFromLoadout,
} from "../systems/loadoutState";

import {
  getStashItemAmount,
  removeItemFromStash,
  addItemToStash,
} from "../systems/stashState";

import {
  getOwnedWeapons,
  getSelectedWeapon,
  selectWeapon,
} from "../weapons/weaponState";

export class EquipmentScene extends Scene {
  constructor() {
    super("EquipmentScene");
  }

  create() {
    const centerX = this.scale.width / 2;

    const loadout = getLoadoutState();

    const loadoutAmmo =
      loadout.find((item) => item.type === "ammo")?.amount ?? 0;

    const loadoutMedkit =
      loadout.find((item) => item.type === "medkit")?.amount ?? 0;

    const stashAmmo = getStashItemAmount("ammo");
    const stashMedkit = getStashItemAmount("medkit");

    const ownedWeapons = getOwnedWeapons();
    const selectedWeapon = getSelectedWeapon();

    const hasPistol = ownedWeapons.includes("pistol");
    const hasRifle = ownedWeapons.includes("rifle");

    this.add
      .text(centerX, 90, "EQUIPMENT", {
        fontSize: "42px",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    this.add
      .text(centerX, 150, "WEAPON", {
        fontSize: "22px",
        color: "#aaaaaa",
      })
      .setOrigin(0.5);

    this.add
      .text(centerX, 190, `Selected: ${selectedWeapon.toUpperCase()}`, {
        fontSize: "20px",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    if (hasPistol) {
      const pistolButton = this.add
        .text(centerX - 120, 250, "PISTOL", {
          fontSize: "18px",
          color: "#ffffff",
          backgroundColor: selectedWeapon === "pistol" ? "#555555" : "#333333",
          padding: {
            x: 18,
            y: 10,
          },
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });

      pistolButton.on("pointerdown", () => {
        selectWeapon("pistol");

        this.scene.restart();
      });
    }

    if (hasRifle) {
      const rifleButton = this.add
        .text(centerX + 120, 250, "RIFLE", {
          fontSize: "18px",
          color: "#ffffff",
          backgroundColor: selectedWeapon === "rifle" ? "#555555" : "#333333",
          padding: {
            x: 18,
            y: 10,
          },
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });

      rifleButton.on("pointerdown", () => {
        selectWeapon("rifle");

        this.scene.restart();
      });
    }

    this.add
      .text(centerX, 340, "CONSUMABLES", {
        fontSize: "22px",
        color: "#aaaaaa",
      })
      .setOrigin(0.5);

    this.add
      .text(
        centerX,
        385,
        `Loadout: Ammo x${loadoutAmmo} | Medkit x${loadoutMedkit}`,
        {
          fontSize: "18px",
          color: "#ffffff",
        },
      )
      .setOrigin(0.5);

    this.add
      .text(
        centerX,
        420,
        `Stash: Ammo x${stashAmmo} | Medkit x${stashMedkit}`,
        {
          fontSize: "16px",
          color: "#aaaaaa",
        },
      )
      .setOrigin(0.5);

    const takeAmmoButton = this.add
      .text(centerX - 120, 485, "TAKE AMMO x30", {
        fontSize: "16px",
        color: "#ffffff",
        backgroundColor: "#333333",
        padding: {
          x: 12,
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

    const returnAmmoButton = this.add
      .text(centerX - 120, 535, "RETURN AMMO x30", {
        fontSize: "16px",
        color: "#ffffff",
        backgroundColor: "#333333",
        padding: {
          x: 12,
          y: 8,
        },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    returnAmmoButton.on("pointerdown", () => {
      const removed = removeItemFromLoadout("ammo", 30);

      if (!removed) {
        return;
      }

      addItemToStash("ammo", 30);

      this.scene.restart();
    });

    const returnMedkitButton = this.add
      .text(centerX + 120, 535, "RETURN MEDKIT x1", {
        fontSize: "16px",
        color: "#ffffff",
        backgroundColor: "#333333",
        padding: {
          x: 12,
          y: 8,
        },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    returnMedkitButton.on("pointerdown", () => {
      const removed = removeItemFromLoadout("medkit", 1);

      if (!removed) {
        return;
      }

      addItemToStash("medkit", 1);

      this.scene.restart();
    });

    const takeMedkitButton = this.add
      .text(centerX + 120, 485, "TAKE MEDKIT x1", {
        fontSize: "16px",
        color: "#ffffff",
        backgroundColor: "#333333",
        padding: {
          x: 12,
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

    const backButton = this.add
      .text(centerX, 620, "BACK TO STASH", {
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
