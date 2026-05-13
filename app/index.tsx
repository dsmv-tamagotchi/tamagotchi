import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { feed, isAlive, play, sleep, Tamagotchi, wakeUp, wash } from '../types/tamagotchi';

export default function App() {
  const [tama, setTama] = useState<Tamagotchi>({
    name: "Tamagotchi",
    energy: 1.0,
    happiness: 0.4,
    hunger: 0.7,
    isSleeping: false,
    dirtyLevel: 0,
  });

  const vivo = isAlive(tama);

  
  const getAvatarColor = () => {
    if (!vivo) return '#333333';             // Inativo (Cinza)
    if (tama.isSleeping) return '#9C27B0';    // Dormindo (Roxo)
    if (tama.energy <= 0.5) return '#2196F3';  // Cansado (Azul)
    if (tama.happiness <= 0.4) return '#F44336'; // Perigo (Vermelho)
    if (tama.hunger >= 0.7) return '#FFEB3B';  // Fome (Amarelo)
    if (tama.dirtyLevel >= 1.0) return '#849483'; //Sujo (Verde Musgo)
    return '#4CAF50';                         // Feliz/Ok (Verde)
  };

  const getAvatarFace = () => {
    if (!vivo) return "X_X"; 
    if (tama.isSleeping) return "zzz";
    if (tama.energy <= 0.5) return "-_-";
    if (tama.happiness <= 0.4) return "T-T";
    if (tama.hunger >= 0.7) return "o_o";
    if (tama.dirtyLevel >= 1.0) return "#_#";
    return ">u<";
  };

  const handleFeed = () => setTama(feed(tama));
  const handlePlay = () => setTama(play(tama));
  const handleWash = () => setTama(wash(tama));

  const handleSleepAction = () => {
    if (!tama.isSleeping) {
      setTama(sleep(tama));
    } else {
      setTama(wakeUp(tama, new Date()));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>{tama.name}</Text>
      
      <View style={[styles.avatar, { backgroundColor: getAvatarColor() }]}>
        <Text style={styles.avatarLabel}>
          {getAvatarFace()}
        </Text>
      </View>

      <View style={styles.statusCard}>
        <Text style={styles.statusText}>Energia: {(tama.energy * 100).toFixed(0)}%</Text>
        <Text style={styles.statusText}>Felicidade: {(tama.happiness * 100).toFixed(0)}%</Text>
        <Text style={styles.statusText}>Fome: {(tama.hunger * 100).toFixed(0)}%</Text>
        <Text style={styles.statusText}>Sujeira: {(tama.dirtyLevel * 100).toFixed(0)}%</Text>
        
        <View style={styles.divider} />

        <Text style={[styles.statusText, { color: vivo ? 'green' : 'red', fontWeight: 'bold' }]}>
          Status: {vivo ? 'Ativo' : 'Inativo'}
        </Text>
        
        <Text style={styles.statusText}>
          Estado: {tama.isSleeping ? "Dormindo" : "Acordado"}
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, !vivo && styles.buttonDisabled]} 
          onPress={handleFeed} 
          disabled={!vivo}
        >
          <Text style={styles.buttonText}>Alimentar</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, !vivo && styles.buttonDisabled]} 
          onPress={handlePlay} 
          disabled={!vivo}
        >
          <Text style={styles.buttonText}>Brincar</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, !vivo && styles.buttonDisabled]} 
          onPress={handleWash} 
          disabled={!vivo || tama.dirtyLevel === 0}
        >
          <Text style={styles.buttonText}>Banho</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[
            styles.button, 
            tama.isSleeping ? styles.buttonActive : styles.buttonDefault,
            !vivo && styles.buttonDisabled
          ]} 
          onPress={handleSleepAction}
          disabled={!vivo}
        >
          <Text style={styles.buttonText}>
            {tama.isSleeping ? "Acordar" : "Dormir"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: '#f0f0f0' 
  },
  title: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    marginBottom: 20 
  },
  // --- configuracao do bixinho ---
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#ddd'
  },
  avatarLabel: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff'
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 10
  },
  statusCard: { 
    backgroundColor: '#ffffff', 
    padding: 25, 
    borderRadius: 12, 
    width: '85%', 
    borderWidth: 1,
    borderColor: '#dddddd'
  },
  statusText: { 
    fontSize: 16, 
    marginVertical: 4,
    color: '#333333'
  },
  buttonContainer: { 
    flexDirection: 'row', 
    marginTop: 30, 
    gap: 10 
  },
  button: { 
    backgroundColor: '#2196F3', 
    paddingVertical: 12, 
    paddingHorizontal: 16, 
    borderRadius: 6 
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '600'
  },
  buttonDisabled: {
    backgroundColor: '#cccccc'
  },
  buttonActive: {
    backgroundColor: '#FFB300'
  },
  buttonDefault: {
    backgroundColor: '#2196F3'
  }
});
