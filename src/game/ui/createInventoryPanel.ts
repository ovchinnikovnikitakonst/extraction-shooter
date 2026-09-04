import * as Phaser from "phaser";

type InventorySlot = {
  background: Phaser.GameObjects.Rectangle;
  nameText: Phaser.GameObjects.Text;
  amountText: Phaser.GameObjects.Text;
};

type CreateInventoryPanelParams = {
  scene: Phaser.Scene;
};

type InventoryPanel = {
  background: Phaser.GameObjects.Rectangle;
  title: Phaser.GameObjects.Text;
  closeText: Phaser.GameObjects.Text;

  scrapSlot: InventorySlot;
  ammoSlot: InventorySlot;
  medkitSlot: InventorySlot;
  electronicsSlot: InventorySlot;
  foodSlot: InventorySlot;
  valuableSlot: InventorySlot;

  setVisible: (visible: boolean) => void;
};

const createInventorySlot = (
  scene: Phaser.Scene,
  x: number,
  y: number,
  label: string,
): InventorySlot => {
  const background = scene.add
    .rectangle(x, y, 120, 96, 0x222222, 0.9)
    .setStrokeStyle(2, 0x777777)
    .setScrollFactor(0);

  const nameText = scene.add
    .text(x, y - 22, label, {
      fontSize: "14px",
      color: "#ffffff",
      fontFamily: "monospace",
    })
    .setOrigin(0.5)
    .setScrollFactor(0);

  const amountText = scene.add
    .text(x, y + 18, "x0", {
      fontSize: "18px",
      color: "#ffffff",
      fontFamily: "monospace",
    })
    .setOrigin(0.5)
    .setScrollFactor(0);

  return {
    background,
    nameText,
    amountText,
  };
};

export const createInventoryPanel = ({
  scene,
}: CreateInventoryPanelParams): InventoryPanel => {
  const centerX = scene.scale.width / 2;
  const centerY = scene.scale.height / 2;

  const panelWidth = 540;
  const panelHeight = 340;

  const background = scene.add
    .rectangle(centerX, centerY, panelWidth, panelHeight, 0x000000, 0.82)
    .setStrokeStyle(2, 0x555555)
    .setScrollFactor(0);

  const title = scene.add
    .text(centerX, centerY - 132, "INVENTORY", {
      fontSize: "24px",
      color: "#ffffff",
      fontFamily: "monospace",
    })
    .setOrigin(0.5)
    .setScrollFactor(0);

  const slotWidth = 120;
  const slotHeight = 96;

  const gapX = 30;
  const gapY = 20;

  const gridWidth = slotWidth * 3 + gapX * 2;

  const startX = centerX - gridWidth / 2 + slotWidth / 2;

  const row1Y = centerY - 45;

  const row2Y = row1Y + slotHeight + gapY;

  const col1X = startX;

  const col2X = startX + slotWidth + gapX;

  const col3X = startX + (slotWidth + gapX) * 2;

  const scrapSlot = createInventorySlot(scene, col1X, row1Y, "SCRAP");

  const ammoSlot = createInventorySlot(scene, col2X, row1Y, "AMMO");

  const medkitSlot = createInventorySlot(scene, col3X, row1Y, "MEDKIT");

  const electronicsSlot = createInventorySlot(
    scene,
    col1X,
    row2Y,
    "ELECTRONICS",
  );

  const foodSlot = createInventorySlot(scene, col2X, row2Y, "FOOD");

  const valuableSlot = createInventorySlot(scene, col3X, row2Y, "VALUABLE");

  const closeText = scene.add
    .text(centerX, centerY + 138, "Press Tab to close", {
      fontSize: "14px",
      color: "#aaaaaa",
      fontFamily: "monospace",
    })
    .setOrigin(0.5)
    .setScrollFactor(0);

  const allObjects = [
    background,
    title,
    closeText,

    scrapSlot.background,
    scrapSlot.nameText,
    scrapSlot.amountText,

    ammoSlot.background,
    ammoSlot.nameText,
    ammoSlot.amountText,

    medkitSlot.background,
    medkitSlot.nameText,
    medkitSlot.amountText,

    electronicsSlot.background,
    electronicsSlot.nameText,
    electronicsSlot.amountText,

    foodSlot.background,
    foodSlot.nameText,
    foodSlot.amountText,

    valuableSlot.background,
    valuableSlot.nameText,
    valuableSlot.amountText,
  ];

  const setVisible = (visible: boolean) => {
    for (const object of allObjects) {
      object.setVisible(visible);
    }
  };

  setVisible(false);

  return {
    background,
    title,
    closeText,

    scrapSlot,
    ammoSlot,
    medkitSlot,
    electronicsSlot,
    foodSlot,
    valuableSlot,

    setVisible,
  };
};
