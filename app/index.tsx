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

import { useState } from "react";
import { Button, Text, View } from "react-native";

import { Tamagotchi, feed, play, sleep, wakeUp } from "../types/tamagotchi";

export default function Home() {
  const [pet, setPet] = useState<Tamagotchi>({
    energy: 1,
    hunger: 0.5,
    happiness: 0.5,
    isSleeping: false,
    name: "Tama",
    sleepStartedAt: undefined,
  });

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

