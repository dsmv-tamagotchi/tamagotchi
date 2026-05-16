import { Button, Text, View } from "react-native";
import { useHomeViewModel } from "../viewmodel/useHomeViewModel";

export default function Home() {
  const { 
    pet, 
    isPetAlive, 
    handleFeed, 
    handlePlay, 
    handleSleep, 
    handleWakeUp 
  } = useHomeViewModel();

  return (
    <View style={{ marginTop: 50, paddingHorizontal: 20 }}>
      
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 15 }}>
        Status: {isPetAlive ? "Vivo" : "Morto"}
      </Text>

      <Text>Fome: {(pet.hunger * 100).toFixed(0)}%</Text>
      <Button 
        title="Alimentar" 
        onPress={handleFeed} 
        disabled={!isPetAlive || pet.isSleeping} 
      />

      <Text>Energia: {(pet.energy * 100).toFixed(0)}%</Text>
      <Button 
        title="Brincar" 
        onPress={handlePlay} 
        disabled={!isPetAlive || pet.isSleeping} 
      />

      <Text>Dormindo: {pet.isSleeping ? "Sim" : "Não"}</Text>
      <Button 
        title="Dormir" 
        onPress={handleSleep} 
        disabled={!isPetAlive || pet.isSleeping} 
      />

      <Button 
        title="Acordar" 
        onPress={handleWakeUp} 
        disabled={!isPetAlive || !pet.isSleeping} 
      />

    </View>
  );
}
