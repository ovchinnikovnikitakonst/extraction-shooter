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

import { createPlayerState } from "../systems/playerState";

import { getMovementVelocity } from "../systems/playerMovement";

export class RaidScene extends Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private bullets!: Phaser.Physics.Arcade.Group;

  private enemies: Enemy[] = [];

  private loot: Loot[] = [];
  private scrapCount = 0;

  private playerState = createPlayerState(RAID_CONFIG.player.hp);

  private lastEnemyHitAt = 0;
  private playerDead = false;

  private healthText!: Phaser.GameObjects.Text;
  private deathText!: Phaser.GameObjects.Text;
  private lootText!: Phaser.GameObjects.Text;

  private restartKey!: Phaser.Input.Keyboard.Key;
  private interactKey!: Phaser.Input.Keyboard.Key;

  private extractionZone!: Phaser.GameObjects.Rectangle;

  private wasd!: {
    W: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
  };

  constructor() {
    super("RaidScene");
  }

  init() {
    this.loot = [];
    this.scrapCount = 0;

    this.playerState = createPlayerState(RAID_CONFIG.player.hp);

    this.enemies = [];

    this.lastEnemyHitAt = 0;
    this.playerDead = false;
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
    this.deathText = hud.deathText;

    this.updateHealthHud();
    this.updateLootHud();

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
    if (this.playerDead) {
      if (Phaser.Input.Keyboard.JustDown(this.restartKey)) {
        this.scene.restart();
      }

      return;
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

    this.restartKey = keyboard.addKey("R");
    this.interactKey = keyboard.addKey("E");
  }

  private setupShooting() {
    this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      if (this.playerDead) {
        return;
      }

      if (pointer.leftButtonDown()) {
        shootBullet(this, this.player, this.bullets, pointer);
      }
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
    this.playerDead = true;

    this.player.setVelocity(0, 0);

    for (const enemy of this.enemies) {
      if (enemy.sprite.active) {
        enemy.sprite.setVelocity(0, 0);
      }
    }

    this.player.setAlpha(0.4);

    this.deathText.setVisible(true);
  }

  private tryPickupLoot() {
    const pickupDistance = RAID_CONFIG.loot.pickupDistance;

    const loot = this.loot.find((item) => {
      if (!item.sprite.active) {
        return false;
      }

      const distance = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        item.sprite.x,
        item.sprite.y,
      );

      return distance <= pickupDistance;
    });

    if (!loot) {
      return;
    }

    this.scrapCount += 1;

    loot.sprite.destroy();

    this.updateLootHud();
  }

  private updateLootHud() {
    this.lootText.setText(`Scrap: ${this.scrapCount}`);
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
    this.playerDead = true;

    this.player.setVelocity(0, 0);

    for (const enemy of this.enemies) {
      if (enemy.sprite.active) {
        enemy.sprite.setVelocity(0, 0);
      }
    }

    this.add
      .text(
        this.scale.width / 2,
        this.scale.height / 2,
        `EXTRACTED\nScrap: ${this.scrapCount}`,
        {
          fontSize: "36px",
          color: "#00ff66",
          align: "center",
        },
      )
      .setOrigin(0.5)
      .setScrollFactor(0);
  }
}
