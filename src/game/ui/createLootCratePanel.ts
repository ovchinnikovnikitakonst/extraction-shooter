import * as Phaser from "phaser";

import type { LootCrate } from "../entities/lootCrate";
import { ITEM_CONFIG } from "../inventory/itemConfig";

type CreateLootCratePanelParams = {
  scene: Phaser.Scene;
  onTakeItem: (itemIndex: number) => void;
};

const getRarityColor = (rarity: string) => {
  switch (rarity) {
    case "common":
      return "#ffffff";

    case "uncommon":
      return "#4ade80";

    case "rare":
      return "#60a5fa";

    case "epic":
      return "#c084fc";

    default:
      return "#ffffff";
  }
};

export const createLootCratePanel = ({
  scene,
  onTakeItem,
}: CreateLootCratePanelParams) => {
  const width = 360;
  const height = 280;

  const x = scene.scale.width / 2;
  const y = scene.scale.height / 2;

  const background = scene.add
    .rectangle(x, y, width, height, 0x111111, 0.95)
    .setScrollFactor(0)
    .setDepth(1000);

  const title = scene.add
    .text(x, y - 110, "Loot Crate", {
      fontSize: "22px",
      color: "#ffffff",
    })
    .setOrigin(0.5)
    .setScrollFactor(0)
    .setDepth(1001);

  const itemTexts: Phaser.GameObjects.Text[] = [];

  const hint = scene.add
    .text(x, y + 110, "Click item to take • E to close", {
      fontSize: "14px",
      color: "#aaaaaa",
    })
    .setOrigin(0.5)
    .setScrollFactor(0)
    .setDepth(1001);

  const clearItems = () => {
    for (const itemText of itemTexts) {
      itemText.destroy();
    }

    itemTexts.length = 0;
  };

  const setVisible = (visible: boolean) => {
    background.setVisible(visible);
    title.setVisible(visible);
    hint.setVisible(visible);

    for (const itemText of itemTexts) {
      itemText.setVisible(visible);
    }
  };

  const showCrate = (crate: LootCrate) => {
    clearItems();

    crate.items.forEach((item, index) => {
      const rarity = ITEM_CONFIG[item.type].rarity;

      const itemText = scene.add
        .text(x - 130, y - 70 + index * 36, `${item.type} x${item.amount}`, {
          fontSize: "18px",
          color: getRarityColor(rarity),
          backgroundColor: "#222222",
          padding: {
            x: 10,
            y: 6,
          },
        })
        .setScrollFactor(0)
        .setDepth(1001)
        .setInteractive({ useHandCursor: true });

      itemText.on("pointerdown", () => {
        onTakeItem(index);
      });

      itemTexts.push(itemText);
    });

    setVisible(true);
  };

  setVisible(false);

  return {
    showCrate,
    setVisible,
  };
};
