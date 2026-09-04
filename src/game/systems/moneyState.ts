let money = 0;

export const getMoney = () => {
  return money;
};

export const addMoney = (amount: number) => {
  money += amount;
};

export const spendMoney = (amount: number) => {
  if (money < amount) {
    return false;
  }

  money -= amount;

  return true;
};
