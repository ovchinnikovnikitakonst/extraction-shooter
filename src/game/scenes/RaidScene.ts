import * as Phaser from "phaser";
import { Scene } from "phaser";

import { RAID_CONFIG } from "../config/raidConfig";

import { createPlayer } from "../entities/createPlayer";
import { createBulletTexture } from "../entities/createBulletTexture";
import { createLootTexture } from "../entities/createLoot";

import type { Enemy } from "../entities/enemy";
import type { Loot } from "../entities/loot";

import { createRaidEnemies } from "../entities/createRaidEnemies";
import { createRaidWorld } from "../world/createRaidWorld";
import { createRaidHud } from "../ui/createRaidHud";
import { updateEnemy } from "../systems/updateEnemy";
import { shootBullet } from "../systems/shootBullet";
import { setupBulletEnemyOverlap } from "../systems/setupBulletEnemyOverlap";
import { setupEnemyPlayerOverlap } from "../systems/setupEnemyPlayerOverlap";
import type { RaidStatus } from "../systems/raidState";
import { showRaidResult } from "../ui/showRaidResult";
import { addInventoryToStash } from "../systems/stashState";
import {
  addItemToInventory,
  createRaidInventory,
  getItemAmount,
} from "../inventory/raidInventory";

import type { RaidInventory } from "../inventory/raidInventory";
import { createInventoryPanel } from "../ui/createInventoryPanel";
import { stopRaidActors } from "../systems/raid/stopRaidActors";

import { createPlayerState } from "../systems/playerState";

import { getMovementVelocity } from "../systems/playerMovement";

import { reloadWeapon } from "../systems/weapon/reloadWeapon";

import { useMedkit } from "../systems/player/useMedkit";

import { pickupLoot } from "../systems/loot/pickupLoot";

import type { LootCrate } from "../entities/lootCrate";
import { createLootCrate } from "../entities/createLootCrate";
import { openLootCrate } from "../systems/loot/openLootCrate";
import { createLootCratePanel } from "../ui/createLootCratePanel";
import { createLoot } from "../entities/createLoot";

export class RaidScene extends Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private bullets!: Phaser.Physics.Arcade.Group;

  private enemies: Enemy[] = [];

  private loot: Loot[] = [];
  private raidInventory: RaidInventory = createRaidInventory();

  private playerState = createPlayerState(RAID_CONFIG.player.hp);

  private lastEnemyHitAt = 0;
  private raidStatus: RaidStatus = "playing";

  private healthText!: Phaser.GameObjects.Text;
  private lootText!: Phaser.GameObjects.Text;

  private interactKey!: Phaser.Input.Keyboard.Key;

  private extractionZone!: Phaser.GameObjects.Rectangle;

  private inventoryOpen = false;

  private inventoryKey!: Phaser.Input.Keyboard.Key;

  private inventoryPanel!: ReturnType<typeof createInventoryPanel>;

  private lootCratePanel!: ReturnType<typeof createLootCratePanel>;

  private healKey!: Phaser.Input.Keyboard.Key;

  private wasd!: {
    W: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
  };

  private lootCrates: LootCrate[] = [];
  private activeLootCrate: LootCrate | null = null;

  private magazineAmmo: number = RAID_CONFIG.weapon.magazineSize;
  private actionKey!: Phaser.Input.Keyboard.Key;
  constructor() {
    super("RaidScene");
  }

  init() {
    this.loot = [];
    this.lootCrates = [];
    this.magazineAmmo = RAID_CONFIG.weapon.magazineSize;
    this.activeLootCrate = null;

    this.raidInventory = addItemToInventory(
      createRaidInventory(),
      "ammo",
      RAID_CONFIG.player.startingAmmo,
    );
    this.inventoryOpen = false;

    this.playerState = createPlayerState(RAID_CONFIG.player.hp);

    this.enemies = [];

    this.lastEnemyHitAt = 0;
    this.raidStatus = "playing";
  }

  create() {
    const { width, height } = RAID_CONFIG.world;

    const { extractionZone } = createRaidWorld(this);

    this.extractionZone = extractionZone;

    createBulletTexture(this);
    createLootTexture(this);

    this.bullets = this.physics.add.group();

    const spawn = RAID_CONFIG.player.spawn;

    this.player = createPlayer(this, spawn.x, spawn.y);

    this.lootCrates = [
      createLootCrate(this, 600, 500),
      createLootCrate(this, 1200, 900),
      createLootCrate(this, 1600, 1500),
    ];

    const hud = createRaidHud(this);

    this.healthText = hud.healthText;
    this.lootText = hud.lootText;

    this.updateHealthHud();
    this.updateLootHud();

    this.inventoryPanel = createInventoryPanel({
      scene: this,
      maxSlots: RAID_CONFIG.inventory.maxSlots,

      onDropItem: (itemIndex) => {
        this.dropInventoryItem(itemIndex);
      },
    });

    this.lootCratePanel = createLootCratePanel({
      scene: this,

      onTakeItem: (itemIndex) => {
        this.takeLootCrateItem(itemIndex);
      },
    });

    this.enemies = createRaidEnemies(this);

    for (const enemy of this.enemies) {
      setupBulletEnemyOverlap(this, this.bullets, enemy, this.loot);

      setupEnemyPlayerOverlap({
        scene: this,
        enemy,
        player: this.player,

        getPlayerState: () => this.playerState,

        setPlayerState: (state) => {
          this.playerState = state;
        },

        getLastHitAt: () => this.lastEnemyHitAt,

        setLastHitAt: (time) => {
          this.lastEnemyHitAt = time;
        },

        onHealthChange: () => {
          this.updateHealthHud();
        },

        onPlayerDeath: () => {
          this.killPlayer();
        },
      });
    }
    this.setupKeyboard();
    this.setupShooting();

    this.cameras.main.startFollow(this.player);

    this.cameras.main.setBounds(0, 0, width, height);
  }

  update() {
    if (this.raidStatus !== "playing") {
      if (Phaser.Input.Keyboard.JustDown(this.actionKey)) {
        this.scene.start("StashScene");
      }

      return;
    }

    if (
      this.activeLootCrate &&
      Phaser.Input.Keyboard.JustDown(this.interactKey)
    ) {
      this.lootCratePanel.setVisible(false);
      this.activeLootCrate = null;

      return;
    }

    if (this.activeLootCrate) {
      this.player.setVelocity(0, 0);
      return;
    }

    if (Phaser.Input.Keyboard.JustDown(this.inventoryKey)) {
      this.toggleInventory();
    }

    if (this.inventoryOpen) {
      this.player.setVelocity(0, 0);
      return;
    }

    if (Phaser.Input.Keyboard.JustDown(this.healKey)) {
      this.useMedkit();
    }

    if (Phaser.Input.Keyboard.JustDown(this.actionKey)) {
      this.reloadWeapon();
    }

    this.updatePlayerMovement();
    this.updatePlayerAim();

    for (const enemy of this.enemies) {
      updateEnemy(enemy, this.player);
    }

    if (Phaser.Input.Keyboard.JustDown(this.interactKey)) {
      if (this.isPlayerInExtractionZone()) {
        this.extract();
        return;
      }

      if (this.tryOpenLootCrate()) {
        return;
      }

      this.tryPickupLoot();
    }
  }

  private setupKeyboard() {
    const keyboard = this.input.keyboard;

    if (!keyboard) {
      return;
    }

    this.wasd = {
      W: keyboard.addKey("W"),
      A: keyboard.addKey("A"),
      S: keyboard.addKey("S"),
      D: keyboard.addKey("D"),
    };

    this.interactKey = keyboard.addKey("E");
    this.inventoryKey = keyboard.addKey("TAB");
    this.healKey = keyboard.addKey("H");
    this.actionKey = keyboard.addKey("R");
  }

  private setupShooting() {
    this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      if (this.inventoryOpen || this.activeLootCrate) {
        return;
      }

      if (this.raidStatus !== "playing") {
        return;
      }

      if (this.inventoryOpen) {
        return;
      }

      if (!pointer.leftButtonDown()) {
        return;
      }

      if (this.magazineAmmo <= 0) {
        return;
      }

      shootBullet(this, this.player, this.bullets, pointer);

      this.magazineAmmo -= 1;

      this.updateLootHud();
    });
  }

  private updatePlayerMovement() {
    const velocity = getMovementVelocity(
      {
        up: this.wasd.W.isDown,
        down: this.wasd.S.isDown,
        left: this.wasd.A.isDown,
        right: this.wasd.D.isDown,
      },
      RAID_CONFIG.player.speed,
    );

    this.player.setVelocity(velocity.x, velocity.y);
  }

  private updatePlayerAim() {
    const pointer = this.input.activePointer;

    const worldPoint = this.cameras.main.getWorldPoint(pointer.x, pointer.y);

    const angle = Phaser.Math.Angle.Between(
      this.player.x,
      this.player.y,
      worldPoint.x,
      worldPoint.y,
    );

    this.player.setRotation(angle);
  }

  private updateHealthHud() {
    this.healthText.setText(
      `HP: ${this.playerState.hp}/${this.playerState.maxHp}`,
    );
  }

  private killPlayer() {
    this.raidStatus = "dead";

    stopRaidActors(this.player, this.enemies);

    this.player.setAlpha(0.4);

    showRaidResult({
      scene: this,
      status: "dead",
      scrapCount: getItemAmount(this.raidInventory, "scrap"),
    });
  }

  private tryPickupLoot() {
    const result = pickupLoot({
      player: this.player,
      loot: this.loot,
      inventory: this.raidInventory,
      pickupDistance: RAID_CONFIG.loot.pickupDistance,
    });

    this.raidInventory = result.inventory;

    if (result.pickedUp) {
      this.updateLootHud();
    }
  }

  private updateLootHud() {
    const scrapAmount = getItemAmount(this.raidInventory, "scrap");

    const ammoAmount = getItemAmount(this.raidInventory, "ammo");

    const medkitAmount = getItemAmount(this.raidInventory, "medkit");

    this.lootText.setText(
      [
        `Scrap: ${scrapAmount}`,
        `Ammo: ${this.magazineAmmo}/${ammoAmount}`,
        `Medkit: ${medkitAmount}`,
      ].join("\n"),
    );
  }

  private isPlayerInExtractionZone() {
    const distance = Phaser.Math.Distance.Between(
      this.player.x,
      this.player.y,
      this.extractionZone.x,
      this.extractionZone.y,
    );

    return distance <= RAID_CONFIG.extraction.interactDistance;
  }

  private extract() {
    this.raidStatus = "extracted";

    const scrapAmount = getItemAmount(this.raidInventory, "scrap");

    addInventoryToStash(this.raidInventory);

    stopRaidActors(this.player, this.enemies);

    showRaidResult({
      scene: this,
      status: "extracted",
      scrapCount: scrapAmount,
    });
  }

  private toggleInventory() {
    this.inventoryOpen = !this.inventoryOpen;

    this.inventoryPanel.setVisible(this.inventoryOpen);

    if (this.inventoryOpen) {
      this.updateInventoryPanel();
    }
  }
  private updateInventoryPanel() {
    this.inventoryPanel.update(this.raidInventory);
  }

  private useMedkit() {
    const result = useMedkit({
      playerState: this.playerState,
      inventory: this.raidInventory,
      healAmount: RAID_CONFIG.medkit.healAmount,
    });

    this.playerState = result.playerState;
    this.raidInventory = result.inventory;

    this.updateHealthHud();
    this.updateLootHud();
  }

  private reloadWeapon() {
    const result = reloadWeapon({
      magazineAmmo: this.magazineAmmo,

      inventory: this.raidInventory,
    });

    this.magazineAmmo = result.magazineAmmo;

    this.raidInventory = result.inventory;

    this.updateLootHud();
  }

  private takeLootCrateItem(itemIndex: number) {
    if (!this.activeLootCrate) {
      return;
    }

    const item = this.activeLootCrate.items[itemIndex];

    if (!item) {
      return;
    }

    const beforeAmount = getItemAmount(this.raidInventory, item.type);

    const nextInventory = addItemToInventory(
      this.raidInventory,
      item.type,
      item.amount,
    );

    const afterAmount = getItemAmount(nextInventory, item.type);

    const addedAmount = afterAmount - beforeAmount;

    if (addedAmount <= 0) {
      return;
    }

    this.raidInventory = nextInventory;

    item.amount -= addedAmount;

    if (item.amount <= 0) {
      this.activeLootCrate.items.splice(itemIndex, 1);
    }

    this.updateLootHud();
    this.updateInventoryPanel();

    if (this.activeLootCrate.items.length === 0) {
      this.activeLootCrate.opened = true;
      this.activeLootCrate.sprite.setFillStyle(0x444444, 1);

      this.lootCratePanel.setVisible(false);
      this.activeLootCrate = null;

      return;
    }

    this.lootCratePanel.showCrate(this.activeLootCrate);
  }

  private tryOpenLootCrate() {
    for (const crate of this.lootCrates) {
      const result = openLootCrate({
        player: this.player,
        crate,
        interactDistance: RAID_CONFIG.lootCrate.interactDistance,
      });

      if (!result.opened || !result.crate) {
        continue;
      }

      this.activeLootCrate = result.crate;

      this.lootCratePanel.showCrate(this.activeLootCrate);

      this.player.setVelocity(0, 0);

      return true;
    }

    return false;
  }

  private dropInventoryItem(itemIndex: number) {
    const item = this.raidInventory[itemIndex];

    if (!item) {
      return;
    }

    const droppedLoot = createLoot(
      this,
      this.player.x + Phaser.Math.Between(-24, 24),
      this.player.y + Phaser.Math.Between(-24, 24),
      item.type,
      item.amount,
    );

    this.loot.push(droppedLoot);

    this.raidInventory = this.raidInventory.filter(
      (_, index) => index !== itemIndex,
    );

    this.updateLootHud();
    this.updateInventoryPanel();
  }
}
