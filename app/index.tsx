import { Stack } from 'expo-router';

import { SafeAreaView } from 'react-native-safe-area-context';

import { Image, ImageBackground, StyleSheet, Text, View } from 'react-native';

import { Accelerometer } from 'expo-sensors';

import { useEffect, useState } from 'react';

import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';

import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { BaseAvatarState, useHomeViewModel } from '../viewmodel/useHomeViewModel';

const BASE_SPRITES: Record<BaseAvatarState, any> = {
  FELIZ: require('../assets/images/biscuit.png'),
  NEUTRO: require('../assets/images/biscuit-serio.png'), 
  MORTO: require('../assets/images/biscuit.png'),      
};

const OVERLAY_SPRITES = {
  DORMINDO: require('../assets/images/sleepy-icon.png'),
  FOME: require('../assets/images/angry-icon.png'),
  CANSADO: require('../assets/images/cansado-icon.png'),
  TRISTE: require('../assets/images/sadTear-icon.png'),
  SUJO: require('../assets/images/sujeira-icon.png'),
};

const SHAKE_THRESHOLD: number = 12.0;

export default function App() {
  const {
    tama,
    vivo,
    avatarBase,
    alertas,
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
      if (e.absoluteY > 150 && e.absoluteY < 350 && Math.abs(washX.value) < 80) {
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
      // Reativado: quando passar o dedo rápido no avatar, aumenta a felicidade
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
      <ImageBackground 
        source={require('../assets/images/house-scenery-Day.jpg')} 
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <SafeAreaView style={styles.container}>
          <Stack.Screen options={{ headerShown: false }} />

          <Text style={styles.title}>{tama.name}</Text>
          
          <GestureDetector gesture={petCarinhoGesture}>
            <View style={styles.avatarContainer}>
              
              <Image 
                source={BASE_SPRITES[avatarBase]} 
                style={styles.avatarImage} 
                resizeMode="contain"
              />

              {alertas.comFome && (
                <Image source={OVERLAY_SPRITES.FOME} style={styles.overlayFome} resizeMode="contain" />
              )}

              {alertas.cansado && (
                <Image source={OVERLAY_SPRITES.CANSADO} style={styles.overlayCansado} resizeMode="contain" />
              )}

              {alertas.triste && (
                <Image source={OVERLAY_SPRITES.TRISTE} style={styles.overlayTriste} resizeMode="contain" />
              )}

              {alertas.sujo && (
                <Image source={OVERLAY_SPRITES.SUJO} style={styles.overlaySujo} resizeMode="contain" />
              )}
              {alertas.dormindo && (
                <Image source={OVERLAY_SPRITES.DORMINDO} style={styles.overlaySujo} resizeMode="contain" />
              )}

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
            {/* Imagem Arrastável: Alimentar */}
            <GestureDetector gesture={feedGesture}>
              <Animated.View style={[styles.imageButtonContainer, !vivo && styles.buttonDisabled, animatedFeedStyle]}>
                <Image 
                  source={require('../assets/images/burger-5.png')} // Troque pelo nome do arquivo do seu item de comida
                  style={styles.actionImage}
                  resizeMode="contain"
                />
              </Animated.View>
            </GestureDetector>

            {/* Imagem Arrastável: Banho */}
            <GestureDetector gesture={washGesture}>
              <Animated.View style={[styles.imageButtonContainer, (!vivo || tama.dirtyLevel === 0) && styles.buttonDisabled, animatedWashStyle]}>
                <Image 
                  source={require('../assets/images/banho-Biscuit.png')} // Troque pelo nome do arquivo do seu item de banho
                  style={styles.actionImage}
                  resizeMode="contain"
                />
              </Animated.View>
            </GestureDetector>

            {/* Botão Dormir / Acordar permanece igual */}
            <View>
              <GestureDetector gesture={Gesture.Tap().onEnd(() => runOnJS(handleSleepAction)())}>
                <View style={[styles.button, tama.isSleeping ? styles.buttonActive : styles.buttonDefault, !vivo && styles.buttonDisabled]}>
                  <Text style={styles.buttonText}>
                    {tama.isSleeping ? "Acordar" : "Dormir"}
                  </Text>
                </View>
              </GestureDetector>
            </View>
          </View>
        </SafeAreaView>
      </ImageBackground>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: 'transparent' 
  },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 20 },
  avatarContainer: { 
    width: 250, 
    height: 250, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 20,
    position: 'relative' 
  },
  avatarImage: {
    width: '100%',
    height: '100%'
  },
  overlayFome: {
    position: 'absolute',
    width: 120,
    bottom:20,
    right:30,       
  },
  overlayCansado: {
    position: 'absolute',
    width: 100,
    bottom:55,
    right:10,          
  },
  overlayTriste: {
    position: 'absolute',
    width: 35,
    height: 35,
    top: 45,            
    left: 10,
  },
  overlaySujo: {
    position: 'absolute',
    width: '100%',      
    height: '100%',     
    left: 0,
  },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 10 },
  statusCard: { 
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    padding: 8, 
    borderRadius: 12, 
    width: '50%', 
    borderWidth: 1, 
    borderColor: '#dddddd' 
  },
  statusText: { fontSize: 16, marginVertical: 2, color: '#333333' },
  buttonContainer: { 
    flexDirection: 'row', 
    marginTop: 30, 
    gap: 20, 
    alignItems: 'center', 
    justifyContent: 'center', 
    width: '95%' 
  },
  imageButtonContainer: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionImage: {
    width: '100%',
    height: '100%',
  },
  button: { backgroundColor: '#2196F3', paddingVertical: 12, paddingHorizontal: 15, borderRadius: 6, justifyContent: 'center', alignItems: 'center' },
  buttonText: { color: '#ffffff', fontWeight: '600', fontSize: 13 },
  buttonDisabled: { opacity: 0.4 }, 
  buttonActive: { backgroundColor: '#FFB300' },
  buttonDefault: { backgroundColor: '#2196F3' }
});
