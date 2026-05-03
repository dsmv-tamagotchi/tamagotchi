import { Tamagotchi } from "../types/tamagotchi";

export function getCriticalState(pet: Tamagotchi) {
  if (pet.hunger >= 0.8) return "HUNGER";
  if (pet.energy <= 0.2) return "ENERGY";
  if (pet.happiness <= 0.2) return "HAPPINESS";
  return null;
}