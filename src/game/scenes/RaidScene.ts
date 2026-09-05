import * as Phaser from "phaser";
import { Scene } from "phaser";

import { RAID_CONFIG } from "../config/raidConfig";

import { createPlayer } from "../entities/createPlayer";
import { createBulletTexture } from "../entities/createBulletTexture";
import { createLootTexture } from "../entities/createLoot";

import { clearLoadout, getLoadoutState } from "../systems/loadoutState";

import type { Enemy } from "../entities/enemy";
import type { Loot } from "../entities/loot";

import { getSelectedWeapon } from "../weapons/weaponState";

import { WEAPON_CONFIG } from "../weapons/weaponConfig";

import type { WeaponConfig, WeaponType } from "../weapons/weaponConfig";

import { createRaidEnemies } from "../entities/createRaidEnemies";
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

import { getSelectedArmor } from "../armor/armorState";

import { ARMOR_CONFIG } from "../armor/armorConfig";

import type { ArmorConfig, ArmorType } from "../armor/armorConfig";

import type { RaidInventory } from "../inventory/raidInventory";
import { createInventoryPanel } from "../ui/createInventoryPanel";
import { stopRaidActors } from "../systems/raid/stopRaidActors";

import { createPlayerState } from "../systems/playerState";

import { getMovementVelocity } from "../systems/playerMovement";

import { createRaidMaze } from "../world/createRaidMaze";

import { reloadWeapon } from "../systems/weapon/reloadWeapon";

import { useMedkit } from "../systems/player/useMedkit";

import { pickupLoot } from "../systems/loot/pickupLoot";

import type { LootCrate } from "../entities/lootCrate";
import { createLootCrate } from "../entities/createLootCrate";
import { openLootCrate } from "../systems/loot/openLootCrate";
import { createLootCratePanel } from "../ui/createLootCratePanel";
import { createLoot } from "../entities/createLoot";
import { ENEMY_CONFIG } from "../config/enemyConfig";

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

  private selectedWeapon!: WeaponType;
  private weaponConfig!: WeaponConfig;
  private lastShotAt = 0;

  private selectedArmor: ArmorType | null = null;
  private armorConfig: ArmorConfig | null = null;

  private magazineAmmo = 0;
  private actionKey!: Phaser.Input.Keyboard.Key;
  constructor() {
    super("RaidScene");
  }

  init() {
    this.lastShotAt = 0;
    this.loot = [];
    this.lootCrates = [];
    this.selectedWeapon = getSelectedWeapon();
    this.weaponConfig = WEAPON_CONFIG[this.selectedWeapon];

    this.selectedArmor = getSelectedArmor();

    this.armorConfig = this.selectedArmor
      ? ARMOR_CONFIG[this.selectedArmor]
      : null;

    this.magazineAmmo = this.weaponConfig.magazineSize;
    this.activeLootCrate = null;

    const loadout = getLoadoutState();

    let startingInventory = loadout.map((item) => ({
      ...item,
    }));

    startingInventory = addItemToInventory(
      startingInventory,
      "ammo",
      RAID_CONFIG.player.startingAmmo,
    );

    this.raidInventory = startingInventory;

    clearLoadout();
    this.inventoryOpen = false;

    this.playerState = createPlayerState(RAID_CONFIG.player.hp);

    this.enemies = [];

    this.lastEnemyHitAt = 0;
    this.raidStatus = "playing";
  }

  create() {
    const { width, height } = RAID_CONFIG.world;

    this.physics.world.setBounds(0, 0, width, height);

    this.cameras.main.setBounds(0, 0, width, height);

    const { walls, extractionPoints, lootCrateSpawnPoints, isWalkablePoint } =
      createRaidMaze(this);

    createBulletTexture(this);
    createLootTexture(this);

    this.bullets = this.physics.add.group();

    this.physics.add.collider(this.bullets, walls, (bullet) => {
      bullet.destroy();
    });

    const spawn = RAID_CONFIG.player.spawn;

    this.player = createPlayer(this, spawn.x, spawn.y);

    this.physics.add.collider(this.player, walls);

    const crateSpawnPoints = Phaser.Utils.Array.Shuffle([
      ...lootCrateSpawnPoints,
    ]).slice(0, 5);

    this.lootCrates = crateSpawnPoints.map((point) =>
      createLootCrate(this, point.x, point.y),
    );

    const activeExtractionPoint =
      Phaser.Utils.Array.GetRandom(extractionPoints);

    for (const point of extractionPoints) {
      const isActive = point === activeExtractionPoint;

      const zone = this.add.rectangle(
        point.x,
        point.y,
        RAID_CONFIG.extraction.size,
        RAID_CONFIG.extraction.size,
        isActive ? 0x00ff00 : 0xff0000,
        0.3,
      );

      zone.setStrokeStyle(4, isActive ? 0x00ff00 : 0xff0000);

      if (isActive) {
        this.extractionZone = zone;
      }
    }

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

    this.enemies = createRaidEnemies(this, isWalkablePoint);

    for (const enemy of this.enemies) {
      this.physics.add.collider(enemy.sprite, walls);
    }

    for (const enemy of this.enemies) {
      setupBulletEnemyOverlap(this, this.bullets, enemy, this.loot);

      const baseDamage = ENEMY_CONFIG[enemy.type].damage;

      const enemyDamage = this.armorConfig
        ? baseDamage * (1 - this.armorConfig.damageReduction)
        : baseDamage;

      setupEnemyPlayerOverlap({
        scene: this,
        enemy,
        player: this.player,

        damage: enemyDamage,

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

    const camera = this.cameras.main;

    camera.setBounds(0, 0, width, height);

    camera.setZoom(1);

    camera.startFollow(this.player, true, 1, 1);
    // CAMERA DEBUG — вся карта целиком

    // const camera = this.cameras.main;

    // camera.stopFollow();

    // camera.setBounds(0, 0, width, height);

    // const zoom = Math.min(camera.width / width, camera.height / height) * 0.95;

    // camera.setZoom(zoom);

    // camera.centerOn(width / 2, height / 2);
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

    if (this.selectedWeapon === "rifle" && this.input.activePointer.isDown) {
      this.tryShoot(this.input.activePointer);
    }

    for (const enemy of this.enemies) {
      updateEnemy(enemy, this.player, this.enemies);
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
      if (!pointer.leftButtonDown()) {
        return;
      }

      if (this.selectedWeapon !== "pistol") {
        return;
      }

      this.tryShoot(pointer);
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
      magazineSize: this.weaponConfig.magazineSize,
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

  private tryShoot(pointer: Phaser.Input.Pointer) {
    if (
      this.inventoryOpen ||
      this.activeLootCrate ||
      this.raidStatus !== "playing"
    ) {
      return;
    }

    if (this.magazineAmmo <= 0) {
      return;
    }

    const now = this.time.now;

    if (now - this.lastShotAt < this.weaponConfig.fireRate) {
      return;
    }

    shootBullet(
      this,
      this.player,
      this.bullets,
      pointer,
      this.weaponConfig.damage,
    );

    this.lastShotAt = now;

    this.magazineAmmo -= 1;

    this.updateLootHud();
  }
}
