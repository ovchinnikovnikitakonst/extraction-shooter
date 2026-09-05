import { Scene } from "phaser";

import {
  addItemToLoadout,
  getLoadoutState,
  removeItemFromLoadout,
} from "../systems/loadoutState";

import {
  addItemToStash,
  getStashItemAmount,
  removeItemFromStash,
} from "../systems/stashState";

import {
  getOwnedWeapons,
  getSelectedWeapon,
  selectWeapon,
} from "../weapons/weaponState";

import {
  clearSelectedArmor,
  getOwnedArmor,
  getSelectedArmor,
  selectArmor,
} from "../armor/armorState";

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

    const ownedArmor = getOwnedArmor();
    const selectedArmor = getSelectedArmor();

    const hasLightArmor = ownedArmor.includes("light");
    const hasHeavyArmor = ownedArmor.includes("heavy");

    this.add
      .text(centerX, 60, "EQUIPMENT", {
        fontSize: "40px",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    this.add
      .text(centerX, 115, "WEAPON", {
        fontSize: "20px",
        color: "#aaaaaa",
      })
      .setOrigin(0.5);

    this.add
      .text(centerX, 150, `Selected: ${selectedWeapon.toUpperCase()}`, {
        fontSize: "18px",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    if (hasPistol) {
      const pistolButton = this.add
        .text(centerX - 120, 195, "PISTOL", {
          fontSize: "16px",
          color: "#ffffff",
          backgroundColor: selectedWeapon === "pistol" ? "#555555" : "#333333",
          padding: {
            x: 16,
            y: 8,
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
        .text(centerX + 120, 195, "RIFLE", {
          fontSize: "16px",
          color: "#ffffff",
          backgroundColor: selectedWeapon === "rifle" ? "#555555" : "#333333",
          padding: {
            x: 16,
            y: 8,
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
      .text(centerX, 260, "ARMOR", {
        fontSize: "20px",
        color: "#aaaaaa",
      })
      .setOrigin(0.5);

    this.add
      .text(
        centerX,
        295,
        `Selected: ${selectedArmor ? selectedArmor.toUpperCase() : "NONE"}`,
        {
          fontSize: "18px",
          color: "#ffffff",
        },
      )
      .setOrigin(0.5);

    const noArmorButton = this.add
      .text(centerX, 335, "NO ARMOR", {
        fontSize: "15px",
        color: "#ffffff",
        backgroundColor: selectedArmor === null ? "#555555" : "#333333",
        padding: {
          x: 12,
          y: 7,
        },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    noArmorButton.on("pointerdown", () => {
      clearSelectedArmor();
      this.scene.restart();
    });

    if (hasLightArmor) {
      const lightArmorButton = this.add
        .text(centerX - 120, 380, "LIGHT ARMOR", {
          fontSize: "15px",
          color: "#ffffff",
          backgroundColor: selectedArmor === "light" ? "#555555" : "#333333",
          padding: {
            x: 10,
            y: 7,
          },
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });

      lightArmorButton.on("pointerdown", () => {
        selectArmor("light");
        this.scene.restart();
      });
    }

    if (hasHeavyArmor) {
      const heavyArmorButton = this.add
        .text(centerX + 120, 380, "HEAVY ARMOR", {
          fontSize: "15px",
          color: "#ffffff",
          backgroundColor: selectedArmor === "heavy" ? "#555555" : "#333333",
          padding: {
            x: 10,
            y: 7,
          },
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });

      heavyArmorButton.on("pointerdown", () => {
        selectArmor("heavy");
        this.scene.restart();
      });
    }

    this.add
      .text(centerX, 445, "CONSUMABLES", {
        fontSize: "20px",
        color: "#aaaaaa",
      })
      .setOrigin(0.5);

    this.add
      .text(
        centerX,
        480,
        `Loadout: Ammo x${loadoutAmmo} | Medkit x${loadoutMedkit}`,
        {
          fontSize: "16px",
          color: "#ffffff",
        },
      )
      .setOrigin(0.5);

    this.add
      .text(
        centerX,
        510,
        `Stash: Ammo x${stashAmmo} | Medkit x${stashMedkit}`,
        {
          fontSize: "15px",
          color: "#aaaaaa",
        },
      )
      .setOrigin(0.5);

    const takeAmmoButton = this.add
      .text(centerX - 120, 555, "TAKE AMMO x30", {
        fontSize: "14px",
        color: "#ffffff",
        backgroundColor: "#333333",
        padding: {
          x: 10,
          y: 7,
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
      .text(centerX + 120, 555, "TAKE MEDKIT x1", {
        fontSize: "14px",
        color: "#ffffff",
        backgroundColor: "#333333",
        padding: {
          x: 10,
          y: 7,
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

    const returnAmmoButton = this.add
      .text(centerX - 120, 600, "RETURN AMMO x30", {
        fontSize: "14px",
        color: "#ffffff",
        backgroundColor: "#333333",
        padding: {
          x: 10,
          y: 7,
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
      .text(centerX + 120, 600, "RETURN MEDKIT x1", {
        fontSize: "14px",
        color: "#ffffff",
        backgroundColor: "#333333",
        padding: {
          x: 10,
          y: 7,
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

    const backButton = this.add
      .text(centerX, 675, "BACK TO STASH", {
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

    backButton.on("pointerdown", () => {
      this.scene.start("StashScene");
    });
  }
}
