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

  private healKey!: Phaser.Input.Keyboard.Key;

  private wasd!: {
    W: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
  };

  private magazineAmmo: number = RAID_CONFIG.weapon.magazineSize;
  private actionKey!: Phaser.Input.Keyboard.Key;
  constructor() {
    super("RaidScene");
  }

  init() {
    this.loot = [];
    this.magazineAmmo = RAID_CONFIG.weapon.magazineSize;

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

    const hud = createRaidHud(this);

    this.healthText = hud.healthText;
    this.lootText = hud.lootText;

    this.updateHealthHud();
    this.updateLootHud();

    this.inventoryPanel = createInventoryPanel({
      scene: this,
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
    const scrapAmount = getItemAmount(this.raidInventory, "scrap");

    const ammoAmount = getItemAmount(this.raidInventory, "ammo");

    const medkitAmount = getItemAmount(this.raidInventory, "medkit");

    const electronicsAmount = getItemAmount(this.raidInventory, "electronics");

    const foodAmount = getItemAmount(this.raidInventory, "food");

    const valuableAmount = getItemAmount(this.raidInventory, "valuable");

    this.inventoryPanel.scrapSlot.amountText.setText(`x${scrapAmount}`);

    this.inventoryPanel.ammoSlot.amountText.setText(`x${ammoAmount}`);

    this.inventoryPanel.medkitSlot.amountText.setText(`x${medkitAmount}`);

    this.inventoryPanel.electronicsSlot.amountText.setText(
      `x${electronicsAmount}`,
    );

    this.inventoryPanel.foodSlot.amountText.setText(`x${foodAmount}`);

    this.inventoryPanel.valuableSlot.amountText.setText(`x${valuableAmount}`);
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
}
