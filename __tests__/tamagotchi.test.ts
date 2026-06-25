import { play, type Tamagotchi } from '@/types/tamagotchi';

const applyNTimes = <T>(fn: (arg: T) => T, n: number, initialValue: T): T => {
  return Array.from({ length: n }).reduce((acc) => fn(acc as T), initialValue) as T;
};

it('too much play makes tamagotchi tired', () => {
  const tamagotchi: Tamagotchi = {
    energy: 1,
    happiness: 1,
    hunger: 0,
    isSleeping: false,
    name: 'Tama',
  };

  const playTooMuch = (t: Tamagotchi) => applyNTimes<Tamagotchi>(play, 5, t);

  expect(playTooMuch(tamagotchi).energy).toBeCloseTo(0.5);
});
