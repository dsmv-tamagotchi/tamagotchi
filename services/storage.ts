import AsyncStorage from '@react-native-async-storage/async-storage';
import { type Tamagotchi } from '../types/tamagotchi';

const PETS_LIST_KEY = '@tamagotchi_list';

export const saveTamagotchiState = async (tamagotchi: Tamagotchi): Promise<void> => {
  try {
    const currentPets = await getAllTamagotchis();
    currentPets[tamagotchi.name] = tamagotchi;
    await AsyncStorage.setItem(PETS_LIST_KEY, JSON.stringify(currentPets));
  } catch (error) {
    console.error('Failed to Save Tamagotchi State', error);
  }
};

export const getAllTamagotchis = async (): Promise<Record<string, Tamagotchi>> => {
  try {
    const state = await AsyncStorage.getItem(PETS_LIST_KEY);
    return state ? JSON.parse(state) : {};
  } catch (error) {
    console.error('Failed to Read Tamagotchi States', error);
    return {};
  }
};

export const getTamagotchiByName = async (name: string): Promise<Tamagotchi | null> => {
  const pets = await getAllTamagotchis();
  return pets[name] || null;
};
