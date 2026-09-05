import * as Phaser from "phaser";

import type { Enemy } from "../entities/enemy";
import type { PlayerState } from "./playerState";

import { RAID_CONFIG } from "../config/raidConfig";

import { applyPlayerDamage, isPlayerDead } from "./playerState";

type SetupEnemyPlayerOverlapParams = {
  scene: Phaser.Scene;
  enemy: Enemy;
  player: Phaser.Physics.Arcade.Sprite;

  damage: number;

  getPlayerState: () => PlayerState;
  setPlayerState: (state: PlayerState) => void;

  getLastHitAt: () => number;
  setLastHitAt: (time: number) => void;

  onHealthChange: () => void;
  onPlayerDeath: () => void;
};

export const setupEnemyPlayerOverlap = ({
  scene,
  enemy,
  player,
  damage,
  getPlayerState,
  setPlayerState,
  getLastHitAt,
  setLastHitAt,
  onHealthChange,
  onPlayerDeath,
}: SetupEnemyPlayerOverlapParams) => {
  scene.physics.add.overlap(enemy.sprite, player, () => {
    const now = scene.time.now;

    if (now - getLastHitAt() < RAID_CONFIG.enemy.hitCooldown) {
      return;
    }

    setLastHitAt(now);

    const nextPlayerState = applyPlayerDamage(getPlayerState(), damage);

    setPlayerState(nextPlayerState);

    onHealthChange();

    if (isPlayerDead(nextPlayerState)) {
      onPlayerDeath();
    }
  });
};
