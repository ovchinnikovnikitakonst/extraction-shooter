import * as Phaser from "phaser";

type CreateInventorySlotParams = {
  scene: Phaser.Scene;
  x: number;
  y: number;
  label: string;
  amount: number;
};

export const createInventorySlot = ({
  scene,
  x,
  y,
  label,
  amount,
}: CreateInventorySlotParams) => {
  const background = scene.add
    .rectangle(x, y, 120, 120, 0x222222, 1)
    .setStrokeStyle(2, 0x666666);

  const nameText = scene.add
    .text(x, y - 25, label, {
      fontSize: "18px",
      color: "#ffffff",
    })
    .setOrigin(0.5);

  const amountText = scene.add
    .text(x, y + 25, `x${amount}`, {
      fontSize: "22px",
      color: "#ffffff",
    })
    .setOrigin(0.5);

  return {
    background,
    nameText,
    amountText,
  };
};
