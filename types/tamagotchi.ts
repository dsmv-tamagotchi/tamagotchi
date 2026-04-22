export interface Tamagochi {
  energy: number;
  happiness: number;
  hunger: number;
  isSleeping: boolean;
  name: string;
  sleepStartedAt?: Date;
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const increase = (value: number) => clamp(value + 0.1, 0, 1);

const decrease = (value: number) => clamp(value - 0.1, 0, 1);

export const feed = (tamagotchi: Readonly<Tamagotchi>): Tamagotchi => {
  return {
    ...tamagotchi,
    happiness: increase(tamagotchi.happiness),
    hunger: decrease(tamagotchi.hunger),
  };
};

export const play = (tamagotchi: Readonly<Tamagotchi>): Tamagotchi => {
  return {
    ...tamagotchi,
    energy: decrease(tamagotchi.energy),
    happiness: increase(tamagotchi.happiness),
  };
};

export const sleep = (tamagotchi: Readonly<Tamagotchi>): Tamagotchi => {
  if (tamagotchi.isSleeping) {
    return tamagotchi;
  }

  return {
    ...tamagotchi,
    isSleeping: true,
    sleepStartedAt: Date.now(),
  };
};

export const wakeUp = (tamagotchi: Readonly<Tamagotchi>, now: Date): Tamagotchi => {
  if (!tamagotchi.isSleeping || !tamagotchi.sleepStartedAt) {
    return tamagotchi;
  }

  const timeSlept = now - tamagotchi.sleepStartedAt;

  const recoveryInMs = 10000;

  const energyRecovery = (timeSlept / recoveryInMs) * 0.2;

  return {
    ...tamagotchi,
    isSleeping: false,
    sleepStartedAt: undefined,
    energy: clamp(tamagotchi.energy + energyRecovery, 0, 1),
  };
};

export const isAlive = (tamagotchi: Readonly<Tamagotchi>): boolean => {
  const constraints: boolean[] = [
    tamagotchi.energy > 0.25,
    tamagotchi.hunger !== 1,
    tamagotchi.happiness !== 0
  ];

  return constraints.filter((constraint: boolean) => !constraint).length === 0;
};
