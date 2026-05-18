/*import { Text, View } from "react-native";

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Edit app/index.tsx to edit this screen.</Text>
    </View>
  );
}*/

import { useEffect, useRef, useState } from "react";

import { AppState, AppStateStatus, Button, Text, View } from "react-native";

import { Tamagotchi, feed, isAlive, play, sleep, wakeUp } from "../types/tamagotchi";

export default function Home() {
  const [pet, setPet] = useState<Tamagotchi>({
    energy: 1,
    hunger: 0.5,
    happiness: 0.5,
    isSleeping: false,
    name: "Tama",
    sleepStartedAt: undefined,
  });

  const appState = useRef(AppState.currentStats);

  const lastTickTime = useRef(Date.now());

  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    const interval = setInterval(() => {
      if (appState.current === 'active' && isAlive(tamagotchi)) {
        setPet(previous => passTime(previous, 1));

        lastTickTime.current = Date.now();
      }
    }, TICK_MS);

    return () => {
      subscription.remove();

      clearInterval(interval);
    };
  }, [pet]);

  const handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
      const now = Date.now();

      const elapsedMs = now - lastTickTime.current;

      const ticksToApply = Math.floor(elapsedMs / TICK_MS);

      if (ticksToApply > 0) {
        setPet(previous => passTime(previous, ticksToApply));
      }

      lastTickTime.current = now;
    }

    appState.current = nextAppState;
  };

  return (
    <View style={{ marginTop: 50 }}>
      
      <Text>Fome: {pet.hunger.toFixed(2)}</Text>
      <Button title="Alimentar" onPress={() => setPet(prev => feed(prev))} />

      <Text>Energia: {pet.energy.toFixed(2)}</Text>
      <Button title="Brincar" onPress={() => setPet(prev => play(prev))} />

      <Text>Dormindo: {pet.isSleeping ? "Sim" : "Não"}</Text>
      <Button title="Dormir" onPress={() => setPet(prev => sleep(prev))} />

      <Button title="Acordar" onPress={() => setPet(prev => wakeUp(prev, new Date()))} />

    </View>
  );
}
