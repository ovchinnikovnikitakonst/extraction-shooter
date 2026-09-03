export type PlayerState = {
  hp: number;
  maxHp: number;
};

export const createPlayerState = (hp: number): PlayerState => ({
  hp,
  maxHp: hp,
});

export const applyPlayerDamage = (
  player: PlayerState,
  damage: number,
): PlayerState => ({
  ...player,
  hp: Math.max(0, player.hp - damage),
});

export const isPlayerDead = (player: PlayerState) => player.hp <= 0;
