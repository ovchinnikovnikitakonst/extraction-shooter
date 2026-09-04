let money = 0;

export const getMoney = () => {
  return money;
};

export const addMoney = (amount: number) => {
  money += amount;
};
