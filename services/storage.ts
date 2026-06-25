import AsyncStorage from '@react-native-async-storage/async-storage';

import { type Tamagotchi } from '../types/tamagotchi';

const TAMAGOTCHI_STORAGE_KEY: string = '@tamagotchi';

export const saveTamagotchiState = async (tamagotchi: Tamagotchi): Promise<void> => {
    try {
        const state = JSON.stringify(tamagotchi);

        await AsyncStorage.setItem(TAMAGOTCHI_STORAGE_KEY, state);
    } catch (error) {
        console.error('Failed to Save Tamagotchi State', error);
    }
};

export const getLastTamagotchiState = async (): Promise<Tamagotchi> => {
    try {
        const state = await AsyncStorage.getItem(TAMAGOTCHI_STORAGE_KEY);

        return JSON.parse(state);
    } catch (error) {
        console.error('Failed to Read Last Tamagotchi State', error);
    }
};
