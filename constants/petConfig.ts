export interface PetVisualConfig {
  baseSprites: {
    FELIZ: any;
    NEUTRO: any;
    MORTO: any;
  };
}

export const PETS_CONFIG: Record<string, PetVisualConfig> = {
  Biscuit: {
    baseSprites: {
      FELIZ: require('../assets/images/biscuit.png'),
      NEUTRO: require('../assets/images/biscuit-serio.png'),
      MORTO: require('../assets/images/biscuit.png'),
    },
  },
  Bartolomeo: {
    baseSprites: {
      FELIZ: require('../assets/images/Bartolomeo-feliz.png'), 
      NEUTRO: require('../assets/images/Bartolomeo-serio.png'),
      MORTO: require('../assets/images/Bartolomeo-feliz.png'),
    },
  },
  Betty: {
    baseSprites: {
      FELIZ: require('../assets/images/betty-Feliz.png'), 
      NEUTRO: require('../assets/images/betty-serio.png'),
      MORTO: require('../assets/images/betty-serio.png'),
    },
  },
};