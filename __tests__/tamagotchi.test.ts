import * as TamagotchiDomain from "../types/tamagotchi";
import { Tamagotchi } from "../types/tamagotchi";

describe("Unit tests", () => {
  describe("Funções de Domínio", () => {
    let mockTama: Tamagotchi;

    beforeEach(() => {
      mockTama = {
        name: "Biscuit",
        energy: 1.0,
        experience: 0.0,
        happiness: 1.0,
        hunger: 1.0,
        isSleeping: false,
        dirtyLevel: 1.0,
      };
    });

    it("deve alimentar o tamagotchi reduzindo a fome e aumentando energia/felicidade", () => {
      const updated = TamagotchiDomain.feed(mockTama);
      expect(updated.hunger).toBeLessThan(1.0);
    });

    it("não deve alterar o estado se o tamagotchi já não tiver fome", () => {
      mockTama.hunger = 0;
      const updated = TamagotchiDomain.feed(mockTama);
      expect(updated).toEqual(mockTama);
    });

    it("deve aumentar a sujeira e a fome ao passar o tempo", () => {
      mockTama.dirtyLevel = 0.5;
      mockTama.hunger = 0.5;
      const updated = TamagotchiDomain.passTime(mockTama, 1);
      expect(updated.dirtyLevel).toBeCloseTo(0.51);
      expect(updated.hunger).toBeCloseTo(0.51);
    });

    it("deve manter os status mas processar experiência se o tamagotchi estiver dormindo", () => {
      mockTama.isSleeping = true;
      const updated = TamagotchiDomain.passTime(mockTama, 1);
      expect(updated.experience).toBe(0.1);
      expect(updated.hunger).toBe(1.0);
    });

    it("deve identificar se o tamagotchi morreu pelas regras de negócio", () => {
      const deadTama: Tamagotchi = {
        ...mockTama,
        energy: 0.2,
        hunger: 0.9,
        happiness: 0.1,
      };
      expect(TamagotchiDomain.isAlive(deadTama)).toBe(false);
    });

    it("deve retornar true se o tamagotchi tiver experiência suficiente para a recompensa", () => {
      mockTama.experience = 5;
      const reward = TamagotchiDomain.rewards.find(
        (r) => r.requiredExperience === 5,
      )!;
      expect(TamagotchiDomain.isEligibleFor(mockTama, reward)).toBe(true);
    });

    it("deve retornar false se o tamagotchi não tiver experiência suficiente para a recompensa", () => {
      mockTama.experience = 2;
      const reward = TamagotchiDomain.rewards.find(
        (r) => r.requiredExperience === 5,
      )!;
      expect(TamagotchiDomain.isEligibleFor(mockTama, reward)).toBe(false);
    });

    it("deve diminuir energia e aumentar felicidade, sujeira e fome ao brincar", () => {
      mockTama.energy = 0.5;
      mockTama.happiness = 0.5;
      mockTama.dirtyLevel = 0.5;
      mockTama.hunger = 0.5;

      const updated = TamagotchiDomain.play(mockTama);

      expect(updated.energy).toBeCloseTo(0.46);
      expect(updated.happiness).toBeCloseTo(0.54);
      expect(updated.dirtyLevel).toBeCloseTo(0.53);
      expect(updated.hunger).toBeCloseTo(0.53);
    });

    it("deve zerar a sujeira e aumentar a experiência ao dar banho (wash)", () => {
      mockTama.dirtyLevel = 0.8;
      mockTama.experience = 0.0;
      const updated = TamagotchiDomain.wash(mockTama);

      expect(updated.dirtyLevel).toBe(0);
      expect(updated.experience).toBe(0.1);
    });

    it("deve diminuir a sujeira gradualmente ao esfregar (washGradual)", () => {
      mockTama.dirtyLevel = 0.5;
      const updated = TamagotchiDomain.washGradual(mockTama);

      expect(updated.dirtyLevel).toBeCloseTo(0.49);
    });

    it("deve colocar o tamagotchi para dormir e registrar o horário", () => {
      const updated = TamagotchiDomain.sleep(mockTama);
      expect(updated.isSleeping).toBe(true);
      expect(updated.sleepStartedAt).toBeDefined();
    });

    it("não deve alterar o estado de sono se já estiver dormindo", () => {
      mockTama.isSleeping = true;
      mockTama.sleepStartedAt = 1000 as any;
      const updated = TamagotchiDomain.sleep(mockTama);

      expect(updated.sleepStartedAt).toBe(1000);
    });

    it("deve acordar o tamagotchi e recuperar energia baseada no tempo dormido", () => {
      mockTama.isSleeping = true;
      mockTama.energy = 0.5;

      mockTama.sleepStartedAt = 1000000 as any;
      const fakeNow = 1010000 as any;

      const updated = TamagotchiDomain.wakeUp(mockTama, fakeNow);

      expect(updated.isSleeping).toBe(false);
      expect(updated.sleepStartedAt).toBeUndefined();

      // (1010000 - 1000000 / 10000) * 0.2 = 0.2 de recuperação -> 0.5 + 0.2 = 0.7
      expect(updated.energy).toBeCloseTo(0.7);
    });

    it("não deve passar de 100 de experiência (clamp)", () => {
      mockTama.experience = 99.95;
      const updated = TamagotchiDomain.increaseExperience(mockTama);
      expect(updated.experience).toBe(100);
    });

    it("não deve alterar o estado se passTime receber ticks iguais ou menores que 0", () => {
      const updated = TamagotchiDomain.passTime(mockTama, 0);
      const updatedNegative = TamagotchiDomain.passTime(mockTama, -5);

      expect(updated).toEqual(mockTama);
      expect(updatedNegative).toEqual(mockTama);
    });

    it("deve considerar o tamagotchi vivo se apenas 1 ou 2 condições de morte forem atingidas", () => {
      const almostDeadTama: Tamagotchi = {
        ...mockTama,
        energy: 0.2, // Condição de morte 1
        hunger: 0.9, // Condição de morte 2
        happiness: 0.5,
      };
      expect(TamagotchiDomain.isAlive(almostDeadTama)).toBe(true);
    });
  });
});
