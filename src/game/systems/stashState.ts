export type StashState = {
  scrap: number;
};

let stashState: StashState = {
  scrap: 0,
};

export const getStashState = () => stashState;

export const addScrapToStash = (amount: number) => {
  stashState = {
    ...stashState,
    scrap: stashState.scrap + amount,
  };
};
