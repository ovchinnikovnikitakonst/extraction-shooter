import * as Phaser from "phaser";

type CreateInventoryPanelParams = {
  scene: Phaser.Scene;
};

export const createInventoryPanel = ({ scene }: CreateInventoryPanelParams) => {
  const background = scene.add
    .rectangle(
      scene.scale.width / 2,
      scene.scale.height / 2,
      420,
      300,
      0x111111,
      0.9,
    )
    .setScrollFactor(0)
    .setVisible(false);

  const title = scene.add
    .text(scene.scale.width / 2, scene.scale.height / 2 - 110, "INVENTORY", {
      fontSize: "30px",
      color: "#ffffff",
    })
    .setOrigin(0.5)
    .setScrollFactor(0)
    .setVisible(false);

  const content = scene.add
    .text(scene.scale.width / 2, scene.scale.height / 2, "", {
      fontSize: "24px",
      color: "#ffffff",
      align: "center",
    })
    .setOrigin(0.5)
    .setScrollFactor(0)
    .setVisible(false);

  return {
    background,
    title,
    content,
  };
};
