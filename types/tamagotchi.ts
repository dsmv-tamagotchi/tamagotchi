export interface Tamagotchi {
  energy: number;
  happiness: number;
  hunger: number;
  isSleeping: boolean;
  dirtyLevel: number;
  name: string;
  sleepStartedAt?: Date;
}

export interface Reward {
    requiredExperience: number;
    resource: string;
}

export const isEligibleFor = (tamagotchi: Tamagotchi, reward: Reward): boolean => {
    return reward.requiredExperience <= tamagotchi.experience;
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const increase = (value: number) => clamp(value + 0.1, 0, 1);
const increaseSmall = (value: number) => clamp(value + 0.04, 0, 1);
const increaseBig = (value: number) => clamp(value + 0.15, 0, 1);

const decrease = (value: number) => clamp(value - 0.1, 0, 1);
const decreaseSmall = (value: number) => clamp(value -0.05, 0, 1);

export const feed = (tamagotchi: Readonly<Tamagotchi>): Tamagotchi => {
  if(tamagotchi.hunger <=0){
    return tamagotchi;
  }
  return {
    ...tamagotchi,
    happiness: increaseSmall(tamagotchi.happiness),
    hunger: decrease(tamagotchi.hunger),
    energy: increaseSmall(tamagotchi.energy),
  };
};

export const play = (tamagotchi: Readonly<Tamagotchi>): Tamagotchi => {
    return {
        ...tamagotchi,
        energy: clamp(tamagotchi.energy - 0.04, 0, 1),       // Cai menos energia por carinho
        happiness: clamp(tamagotchi.happiness + 0.04, 0, 1),   // Sobe felicidade mais suavemente
        dirtyLevel: clamp(tamagotchi.dirtyLevel + 0.03, 0, 1),
        hunger: clamp(tamagotchi.hunger + 0.03, 0, 1),
    };
};

export const wash = (tamagotchi: Readonly<Tamagotchi>): Tamagotchi => {
  return {
    ...tamagotchi,
    dirtyLevel: 0,
  };
};

// Nova regra: Limpeza gradual para o gesto de esfregar
export const washGradual = (tamagotchi: Readonly<Tamagotchi>): Tamagotchi => {
    return {
        ...tamagotchi,
        dirtyLevel: clamp(tamagotchi.dirtyLevel - 0.01, 0, 1),
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
  const dead: boolean[] = [
    tamagotchi.energy <= 0.20,
    tamagotchi.hunger === 0.90,
    tamagotchi.happiness === 0.10
  ];

  return dead.filter(condition => condition).length !== 3;//continua vivo se não atender as 3 condições acima
};

export const TICK_MS = 5000;

export const passTime = (tamagotchi: Readonly<Tamagotchi>, ticks: number = 1): Tamagotchi => {
  if (tamagotchi.isSleeping || ticks <= 0) {
    return tamagotchi;
  };

  return {
    ...tamagotchi,
    energy: clamp(tamagotchi.energy - (0.01 * ticks), 0, 1),
    hunger: clamp(tamagotchi.hunger + (0.01 * ticks), 0, 1), // a fome tem que aumentar com o tempo
    happiness: clamp(tamagotchi.happiness - (0.01 * ticks), 0, 1),
    dirtyLevel: clamp(tamagotchi.dirtyLevel + (0.01*ticks), 0, 1) // sujeira aumenta com o tempo
  };
};
