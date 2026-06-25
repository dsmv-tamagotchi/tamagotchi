export interface Tamagotchi {
    energy: number;
    experience: number;
    happiness: number;
    hunger: number;
    isSleeping: boolean;
    dirtyLevel: number;
    name: string;
    sleepStartedAt?: Date;
}

export interface Reward {
    requiredExperience: number;
    resource: any;
}

export const rewards: Reward[] = [
    { requiredExperience: 2, resource: require('../assets/images/ACC-chapeuBill.png') },
    { requiredExperience: 3, resource: require('../assets/images/ACC-coroaJujuba.png') },
    { requiredExperience: 5, resource: require('../assets/images/ACC-lacinho.png') },
    { requiredExperience: 6, resource: require('../assets/images/ACC-nao-Intendo.png') },
    { requiredExperience: 12, resource: require('../assets/images/ACC-oculos.png') },
    { requiredExperience: 16, resource: require('../assets/images/IF-scenery-DAY.png') },
];

export const isEligibleFor = (tamagotchi: Tamagotchi, reward: Reward): boolean => {
    return reward.requiredExperience <= tamagotchi.experience;
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const increase = (value: number) => clamp(value + 0.1, 0, 1);
const increaseSmall = (value: number) => clamp(value + 0.04, 0, 1);
const increaseBig = (value: number) => clamp(value + 0.15, 0, 1);

const decrease = (value: number) => clamp(value - 0.1, 0, 1);
const decreaseSmall = (value: number) => clamp(value - 0.05, 0, 1);

export const increaseExperience = (tamagotchi: Tamagotchi) => {
    return {
        ...tamagotchi,
        experience: clamp(tamagotchi.experience + 0.1, 0, 100),
    };
};

export const feed = (tamagotchi: Readonly<Tamagotchi>): Tamagotchi => {
    if (tamagotchi.hunger <= 0) {
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
    return increaseExperience({
        ...tamagotchi,
        dirtyLevel: 0,
    });
};

// Nova regra: Limpeza gradual para o gesto de esfregar
export const washGradual = (tamagotchi: Readonly<Tamagotchi>): Tamagotchi => {
    return increaseExperience({
        ...tamagotchi,
        dirtyLevel: clamp(tamagotchi.dirtyLevel - 0.01, 0, 1),
    });
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

    return increaseExperience({
        ...tamagotchi,
        isSleeping: false,
        sleepStartedAt: undefined,
        energy: clamp(tamagotchi.energy + energyRecovery, 0, 1),
    });
};

export const isAlive = (tamagotchi: Readonly<Tamagotchi>): boolean => {
    const dead: boolean[] = [
        tamagotchi.energy <= 0.20,
        tamagotchi.hunger === 0.90,
        tamagotchi.happiness === 0.10
    ];

    //continua vivo se não atender as 3 condições acima
    return dead.filter(condition => condition).length !== dead.legth;
};

export const TICK_MS = 5000;

export const passTime = (tamagotchi: Readonly<Tamagotchi>, ticks: number = 1): Tamagotchi => {

  if (ticks <= 0) return tamagotchi;

  // Se ele estiver dormindo, recupera energia progressivamente a cada tick
  if (tamagotchi.isSleeping) {
    const energyRecoveryPerTick = 0.05 * ticks;

    return increaseExperience({
      ...tamagotchi,
      energy: clamp(tamagotchi.energy + energyRecoveryPerTick, 0, 1),
    });
  }
  
    return increaseExperience({
        ...tamagotchi,
        energy: clamp(tamagotchi.energy - (0.01 * ticks), 0, 1),
        hunger: clamp(tamagotchi.hunger + (0.01 * ticks), 0, 1), // a fome tem que aumentar com o tempo
        happiness: clamp(tamagotchi.happiness - (0.01 * ticks), 0, 1),
        dirtyLevel: clamp(tamagotchi.dirtyLevel + (0.01 * ticks), 0, 1) // sujeira aumenta com o tempo
    });
};
