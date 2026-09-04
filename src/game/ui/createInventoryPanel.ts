import * as Phaser from "phaser";

import { createInventorySlot } from "./createInventorySlot";

type CreateInventoryPanelParams = {
  scene: Phaser.Scene;
};

export const createInventoryPanel = ({ scene }: CreateInventoryPanelParams) => {
  const centerX = scene.scale.width / 2;
  const centerY = scene.scale.height / 2;

  const background = scene.add
    .rectangle(centerX, centerY, 520, 360, 0x111111, 0.95)
    .setScrollFactor(0)
    .setVisible(false);

  const title = scene.add
    .text(centerX, centerY - 135, "INVENTORY", {
      fontSize: "30px",
      color: "#ffffff",
    })
    .setOrigin(0.5)
    .setScrollFactor(0)
    .setVisible(false);

  const scrapSlot = createInventorySlot({
    scene,
    x: centerX - 150,
    y: centerY,
    label: "SCRAP",
    amount: 0,
  });

  const ammoSlot = createInventorySlot({
    scene,
    x: centerX,
    y: centerY,
    label: "AMMO",
    amount: 0,
  });

  const medkitSlot = createInventorySlot({
    scene,
    x: centerX + 150,
    y: centerY,
    label: "MEDKIT",
    amount: 0,
  });

  const closeText = scene.add
    .text(centerX, centerY + 140, "Press Tab to close", {
      fontSize: "20px",
      color: "#aaaaaa",
    })
    .setOrigin(0.5)
    .setScrollFactor(0)
    .setVisible(false);

  const setVisible = (visible: boolean) => {
    background.setVisible(visible);
    title.setVisible(visible);
    closeText.setVisible(visible);

    scrapSlot.background.setVisible(visible);
    scrapSlot.nameText.setVisible(visible);
    scrapSlot.amountText.setVisible(visible);

    ammoSlot.background.setVisible(visible);
    ammoSlot.nameText.setVisible(visible);
    ammoSlot.amountText.setVisible(visible);

    medkitSlot.background.setVisible(visible);
    medkitSlot.nameText.setVisible(visible);
    medkitSlot.amountText.setVisible(visible);
  };

  setVisible(false);

  return {
    background,
    title,
    closeText,

    scrapAmountText: scrapSlot.amountText,

    ammoAmountText: ammoSlot.amountText,

    medkitAmountText: medkitSlot.amountText,

    setVisible,
  };
};
