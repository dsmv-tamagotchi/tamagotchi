import { Stack } from 'expo-router';
import { Image, ImageBackground, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BaseAvatarState, useHomeViewModel } from '../viewmodel/useHomeViewModel';


//cenário Dinâmico

const BACKGROUNDS = {
  HOUSE: {
    DAY: require('../assets/images/house-scenery-Day.jpg'),
    NIGHT: require('../assets/images/house-scenery-Night.jpg'),
  },

  JAPAN: {
    DAY: require('../assets/images/japan-Scenery-DAY.jpg'),
    NIGHT: require('../assets/images/japan-Scenery-NIGHT.jpg'),
  },

  IF: {
    DAY: require('../assets/images/IF-scenery-DAY.png'),
    NIGHT: require('../assets/images/IF-scenery-NIGHT.png'),
  },
};

//Isso aqui é pra testar, basta trocar o final
const currentBackground = BACKGROUNDS.HOUSE;
//pode se tornar um BACKGROUNDS[selectedScenario];

//ajeitando o background do IF
const isIFBackground = currentBackground === BACKGROUNDS.IF;

const SLEEP_BUTTON_ICONS = {
  DORMIR: require('../assets/images/luzApagada-Icon.png'),
  ACORDAR: require('../assets/images/luzAcesa-Icon.png'),
};




interface ProgressBarProps {
  emoji: string;
  value: number; 
  color: string;
}

function ProgressBar({ emoji, value, color }: ProgressBarProps) {
  const percentage = Math.min(Math.max(value * 100, 0), 100);

  return (
    <View style={styles.barContainer}>
      <Text style={styles.barEmoji}>{emoji}</Text>
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: `${percentage}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

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

  const feedX = useSharedValue(0);
  const feedY = useSharedValue(0);
  const washX = useSharedValue(0);
  const washY = useSharedValue(0);

  const feedGesture = Gesture.Pan()
    .enabled(vivo && tama.hunger > 0)
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
    .enabled(vivo && tama.dirtyLevel > 0) // Bloqueia o arrastar se estiver morto ou limpo
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

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ImageBackground 
         source={
    tama.isSleeping
      ? currentBackground.NIGHT
      : currentBackground.DAY
  }
    style={styles.backgroundImage}
  imageStyle={
    isIFBackground
      ? styles.ifBackgroundImage
      : undefined
  }
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


              {alertas.comFome && <Image source={OVERLAY_SPRITES.FOME} style={styles.overlayFome} resizeMode="contain" />}
              {alertas.cansado && <Image source={OVERLAY_SPRITES.CANSADO} style={styles.overlayCansado} resizeMode="contain" />}
              {alertas.triste && <Image source={OVERLAY_SPRITES.TRISTE} style={styles.overlayTriste} resizeMode="contain" />}
              {alertas.sujo && <Image source={OVERLAY_SPRITES.SUJO} style={styles.overlaySujo} resizeMode="contain" />}
              {alertas.dormindo && <Image source={OVERLAY_SPRITES.DORMINDO} style={styles.overlayDormir} resizeMode="contain" />}
            </View>
          </GestureDetector>

          {vivo ? (
            <View style={styles.statusCard}>
              <ProgressBar emoji="💤" value={tama.energy} color="#6ba6ff" />  
              <ProgressBar emoji="❤️" value={tama.happiness} color="#ff6e5e" /> 
              <ProgressBar emoji="🍕" value={tama.hunger} color="#ffd447" /> 
              <ProgressBar emoji="💩" value={tama.dirtyLevel} color="#be7d3b" />
            </View>
          ) : (
            <View style={styles.deadCard}>
              <Text style={styles.deadText}>💀 Oh não! {tama.name} faleceu...</Text>
            </View>
          )}

          <View style={styles.buttonContainer}>
            <GestureDetector gesture={feedGesture}>
              <Animated.View 
                style={[
                  styles.imageButtonContainer, 
                  (!vivo || tama.hunger <= 0) && styles.buttonDisabled,
                  animatedFeedStyle
                ]}
              >
                <Image source={require('../assets/images/coxinha.png')} style={styles.actionImage} resizeMode="contain" />
              </Animated.View>
            </GestureDetector>

            <GestureDetector gesture={washGesture}>
              <Animated.View style={[styles.imageButtonContainer, (!vivo || tama.dirtyLevel === 0) && styles.buttonDisabled, animatedWashStyle]}>
                <Image source={require('../assets/images/banho-Biscuit.png')} style={styles.actionImage} resizeMode="contain" />
              </Animated.View>
            </GestureDetector>

            <View>
            <GestureDetector
  gesture={Gesture.Tap()
    .enabled(vivo)
    .onEnd(() => runOnJS(handleSleepAction)())
  }
>
  <View
    style={[
      styles.imageButtonContainer,
      !vivo && styles.buttonDisabled
    ]}
  >
    <Image
      source={
        tama.isSleeping
          ? SLEEP_BUTTON_ICONS.ACORDAR
          : SLEEP_BUTTON_ICONS.DORMIR
      }
      style={styles.actionImage}
      resizeMode="contain"
    />
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
  backgroundImage: { flex: 1, width: '100%', height: '100%' },
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'transparent' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 20 },
  avatarContainer: { width: 250, height: 250, justifyContent: 'center', alignItems: 'center', marginBottom: 20, position: 'relative' },
  avatarImage: { width: '100%', height: '100%' },
  overlayFome: { position: 'absolute', width: 120, bottom: 20, right: 30 },
  overlayCansado: { position: 'absolute', width: '100%', transform: [{ translateY: 2 }] },
  overlayTriste: { position: 'absolute', width: 60, transform: [{ translateX: -38 }, { translateY: -5 }] },
  overlaySujo: { position: 'absolute', width: '100%', height: '100%', left: 0 },
  overlayDormir: { position: 'absolute', width: 100, bottom: 35, right: 20 },
  statusCard: { 
    borderRadius: 16, 
    width: '70%',
    gap: 5
  },
  deadCard: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
    width: '70%',
    alignItems: 'center',
  },
  deadText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonContainer: { flexDirection: 'row', marginTop: 30, gap: 20, alignItems: 'center', justifyContent: 'center', width: '95%' },
  imageButtonContainer: { width: 60, height: 60, justifyContent: 'center', alignItems: 'center' },
  actionImage: { width: '100%', height: '100%' },
  button: { paddingVertical: 12, paddingHorizontal: 15, borderRadius: 6, justifyContent: 'center', alignItems: 'center' },
  buttonText: { color: '#ffffff', fontWeight: '600', fontSize: 13 },
  buttonDisabled: { opacity: 0.4 }, 
  buttonActive: { backgroundColor: '#F1C40F' }, 
  buttonDefault: { backgroundColor: '#3498DB' }, 
  barContainer: { 
    flexDirection: 'row', 
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#ecececbd',
    borderRadius: 10,
    paddingHorizontal: 5,
  },
  barEmoji: { 
    fontSize: 18,
    width: 24, 
    textAlign: 'center'
  },
  barTrack: { 
    flex: 1, 
    height: 10, 
    backgroundColor: '#ffffff', 
    borderRadius: 7, 
    overflow: 'hidden' 
  },
  barFill: { height: '100%', borderRadius: 7 },

  ifBackgroundImage: {
      width: '120%',
  },

});
