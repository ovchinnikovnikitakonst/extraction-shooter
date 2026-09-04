import * as Phaser from "phaser";

import type { RaidInventory } from "../inventory/raidInventory";

type InventorySlot = {
  background: Phaser.GameObjects.Rectangle;
  nameText: Phaser.GameObjects.Text;
  amountText: Phaser.GameObjects.Text;
};

type CreateInventoryPanelParams = {
  scene: Phaser.Scene;
  maxSlots: number;
};

export const createInventoryPanel = ({
  scene,
  maxSlots,
}: CreateInventoryPanelParams) => {
  const centerX = scene.scale.width / 2;
  const centerY = scene.scale.height / 2;

  const panelWidth = 620;
  const panelHeight = 430;

  const background = scene.add
    .rectangle(centerX, centerY, panelWidth, panelHeight, 0x000000, 0.88)
    .setStrokeStyle(2, 0x555555)
    .setScrollFactor(0)
    .setDepth(1000);

  const title = scene.add
    .text(centerX, centerY - 180, "INVENTORY", {
      fontSize: "24px",
      color: "#ffffff",
      fontFamily: "monospace",
    })
    .setOrigin(0.5)
    .setScrollFactor(0)
    .setDepth(1001);

  const slotsText = scene.add
    .text(centerX, centerY - 145, "", {
      fontSize: "14px",
      color: "#aaaaaa",
      fontFamily: "monospace",
    })
    .setOrigin(0.5)
    .setScrollFactor(0)
    .setDepth(1001);

  const closeText = scene.add
    .text(centerX, centerY + 185, "Press Tab to close", {
      fontSize: "14px",
      color: "#aaaaaa",
      fontFamily: "monospace",
    })
    .setOrigin(0.5)
    .setScrollFactor(0)
    .setDepth(1001);

  const inventorySlots: InventorySlot[] = [];

  const columns = 4;

  const slotWidth = 120;
  const slotHeight = 80;

  const gap = 16;

  const gridWidth = slotWidth * columns + gap * (columns - 1);

  const startX = centerX - gridWidth / 2 + slotWidth / 2;

  const startY = centerY - 90;

  for (let index = 0; index < maxSlots; index++) {
    const column = index % columns;
    const row = Math.floor(index / columns);

    const x = startX + column * (slotWidth + gap);

    const y = startY + row * (slotHeight + gap);

    const slotBackground = scene.add
      .rectangle(x, y, slotWidth, slotHeight, 0x222222, 0.9)
      .setStrokeStyle(2, 0x555555)
      .setScrollFactor(0)
      .setDepth(1001);

    const nameText = scene.add
      .text(x, y - 16, "EMPTY", {
        fontSize: "13px",
        color: "#777777",
        fontFamily: "monospace",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(1002);

    const amountText = scene.add
      .text(x, y + 16, "", {
        fontSize: "16px",
        color: "#ffffff",
        fontFamily: "monospace",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(1002);

    inventorySlots.push({
      background: slotBackground,
      nameText,
      amountText,
    });
  }

  const update = (inventory: RaidInventory) => {
    slotsText.setText(`Slots: ${inventory.length}/${maxSlots}`);

    for (let index = 0; index < inventorySlots.length; index++) {
      const slot = inventorySlots[index];
      const item = inventory[index];

      if (!item) {
        slot.nameText.setText("EMPTY");
        slot.nameText.setColor("#777777");

        slot.amountText.setText("");

        slot.background.setStrokeStyle(2, 0x555555);

        continue;
      }

      slot.nameText.setText(item.type.toUpperCase());

      slot.nameText.setColor("#ffffff");

      slot.amountText.setText(`x${item.amount}`);

      slot.background.setStrokeStyle(2, 0x999999);
    }
  };

  const allObjects = [
    background,
    title,
    slotsText,
    closeText,

    ...inventorySlots.flatMap((slot) => [
      slot.background,
      slot.nameText,
      slot.amountText,
    ]),
  ];

  const setVisible = (visible: boolean) => {
    for (const object of allObjects) {
      object.setVisible(visible);
    }
  };

  setVisible(false);

  return {
    update,
    setVisible,
  };
};
