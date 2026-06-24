import { Accelerometer } from 'expo-sensors';

import { useEffect, useState } from 'react';

import { SafeAreaView, StyleSheet, Text, View } from 'react-native';

import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';

import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { useHomeViewModel } from '../viewmodel/useHomeViewModel';

const SHAKE_THRESHOLD: number = 12.0;

export default function App() {
  const {
    tama,
    vivo,
    avatarColor,
    avatarFace,
    handleFeed,
    handleGradualWash,
    handlePlay,
    handleSleepAction
  } = useHomeViewModel();

  // Configurações do Acelerômetro
  const [data, setData] = useState({
      x: 0,
      y: 0,
      z: 0,
  });

  const [subscription, setSubscription] = useState<any>(null);

  const subscribe = () => {
      Accelerometer.setUpdateInterval(100);

      let lastX = 0, lastY = 0, lastZ = 0;

      setSubscription(Accelerometer.addListener((accelerometerData) => {
        const { x, y, z } = accelerometerData;

        setData({ x, y , z });

        const dx: number = Math.abs(x - lastX);

        const dy: number = Math.abs(y - lastY);

        const dz: number = Math.abs(z - lastZ);

        if (dx + dy + dz > SHAKE_THRESHOLD) {
            handlePlay();
        }

        lastX = x;

        lastY = y;

        lastZ = z;
      }));
  };

  const unsubscribe = () => {
      subscription && subscription.remove();

      setSubscription(null);
  };

  //Configuração Física dos Gestos Animados
  const feedX = useSharedValue(0);
  const feedY = useSharedValue(0);
  const washX = useSharedValue(0);
  const washY = useSharedValue(0);

  const feedGesture = Gesture.Pan()
    .enabled(vivo)
    .onUpdate((e) => {
      feedX.value = e.translationX;
      feedY.value = e.translationY;
    })
    .onEnd(() => {
      if (feedY.value < -100 && Math.abs(feedX.value) < 150) {
        runOnJS(handleFeed)();
      }
      feedX.value = withSpring(0);
      feedY.value = withSpring(0);
    });

  const washGesture = Gesture.Pan()
    .enabled(vivo && tama.dirtyLevel > 0)
    .onUpdate((e) => {
      washX.value = e.translationX;
      washY.value = e.translationY;

      if (e.absoluteY > 150 && e.absoluteY < 300 && Math.abs(washX.value) < 80) {
        runOnJS(handleGradualWash)();
      }
    })
    .onEnd(() => {
      washX.value = withSpring(0);
      washY.value = withSpring(0);
    });

  const petCarinhoGesture = Gesture.Pan()
    .enabled(vivo && !tama.isSleeping)
    .onUpdate((e) => {
      if (Math.abs(e.velocityX) > 300 || Math.abs(e.velocityY) > 300) {
        runOnJS(handlePlay)();
      }
    });

  const animatedFeedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: feedX.value }, { translateY: feedY.value }],
  }));

  const animatedWashStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: washX.value }, { translateY: washY.value }],
  }));

  useEffect(() => {
      subscribe();

      return () => unsubscribe();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>{tama.name}</Text>
        
        <GestureDetector gesture={petCarinhoGesture}>
          <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
            <Text style={styles.avatarLabel}>{avatarFace}</Text>
          </View>
        </GestureDetector>

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
          
          <GestureDetector gesture={feedGesture}>
            <Animated.View style={[styles.button, !vivo && styles.buttonDisabled, animatedFeedStyle]}>
              <Text style={styles.buttonText}>Alimentar 🍖</Text>
            </Animated.View>
          </GestureDetector>
        
          <View>
            <GestureDetector gesture={Gesture.Tap().enabled(vivo).onEnd(() => runOnJS(handlePlay)())}>
              <View style={[styles.button, !vivo && styles.buttonDisabled]}>
                <Text style={styles.buttonText}>Brincar 👋</Text>
              </View>
            </GestureDetector>
          </View>

          <GestureDetector gesture={washGesture}>
            <Animated.View 
              style={[
                styles.button, 
                (!vivo || tama.dirtyLevel === 0) && styles.buttonDisabled, 
                animatedWashStyle
              ]}
            >
              <Text style={styles.buttonText}>Banho 🧽</Text>
            </Animated.View>
          </GestureDetector>

          <View>
            <GestureDetector gesture={Gesture.Tap().onEnd(() => runOnJS(handleSleepAction)())}>
              <View 
                style={[
                  styles.button,
                  tama.isSleeping ? styles.buttonActive : styles.buttonDefault,
                  !vivo && styles.buttonDisabled
                ]}
              >
                <Text style={styles.buttonText}>
                  {tama.isSleeping ? "Acordar" : "Dormir"}
                </Text>
              </View>
            </GestureDetector>
          </View>

        </View>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f0f0' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 20 },
  avatar: { width: 120, height: 120, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 20, borderWidth: 2, borderColor: '#ddd' },
  avatarLabel: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 10 },
  statusCard: { backgroundColor: '#ffffff', padding: 25, borderRadius: 12, width: '85%', borderWidth: 1, borderColor: '#dddddd' },
  statusText: { fontSize: 16, marginVertical: 4, color: '#333333' },
  buttonContainer: { flexDirection: 'row', marginTop: 30, gap: 8, alignItems: 'center', justifyContent: 'center', width: '95%' },
  button: { backgroundColor: '#2196F3', paddingVertical: 12, paddingHorizontal: 10, borderRadius: 6, justifyContent: 'center', alignItems: 'center' },
  buttonText: { color: '#ffffff', fontWeight: '600', fontSize: 13 },
  buttonDisabled: { backgroundColor: '#cccccc' },
  buttonActive: { backgroundColor: '#FFB300' },
  buttonDefault: { backgroundColor: '#2196F3' }
});
