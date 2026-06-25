import { Accelerometer } from 'expo-sensors';
import { useEffect, useRef, useState } from "react";
import { AppState, AppStateStatus } from "react-native";
import { getTamagotchiByName, saveTamagotchiState } from '../services/storage';
import { TICK_MS, Tamagotchi, feed, isAlive, passTime, play, sleep, wakeUp, washGradual } from "../types/tamagotchi";

export type BaseAvatarState = "FELIZ" | "NEUTRO" | "MORTO";

const SHAKE_THRESHOLD: number = 12.0;

export function useHomeViewModel(petName: string) {
  const [tama, setTama] = useState<Tamagotchi>({
    name: petName,
    energy: 1.0,
    happiness: 1.0,
    hunger: 0.0,
    isSleeping: false,
    dirtyLevel: 0.0,
  });

  // Correção do Bug --> flag para saber se o pet terminou de carregar do Storage
  const isLoaded = useRef(false);

  // Carregar do banco assim que a tela abrir ou o petName mudar
  useEffect(() => {
    isLoaded.current = false; // Bloqueia o salvamento provisoriamente
    
    const loadPet = async () => {
      const savedPet = await getTamagotchiByName(petName);
      if (savedPet) {
        setTama(savedPet);
      } else {
        // Se for um pet totalmente novo, reseta pro estado inicial com o nome correto
        setTama({
          name: petName,
          energy: 1.0,
          happiness: 1.0,
          hunger: 0.0,
          isSleeping: false,
          dirtyLevel: 0.0,
        });
      }
      // Garante um pequeno delay para o React processar o estado antes de liberar o salvamento
      setTimeout(() => {
        isLoaded.current = true;
      }, 50);
    };
    
    loadPet();
  }, [petName]);

  // Salvar automaticamente no Storage sempre que o estado do 'tama' mudar
  useEffect(() => {
    // Correção do Bug: Só salva se o pet na memória corresponder ao pet carregado do banco
    if (isLoaded.current && tama.name === petName) {
      saveTamagotchiState(tama);
    }
  }, [tama, petName]);

  const appState = useRef(AppState.currentState);
  const lastTickTime = useRef(Date.now());
  const lastPlayTime = useRef(0);
  const lastWashTime = useRef(0);

  const vivo = isAlive(tama);

  const [accelerometerData, setAccelerometerData] = useState({ x: 0, y: 0, z: 0 });
  const [accelerometerSubscription, setAccelerometerSubscription] = useState<any>(null);

  const subscribeToAccelerometerEvents = () => {
    Accelerometer.setUpdateInterval(100);
    let lastX = 0, lastY = 0, lastZ = 0;

    setAccelerometerSubscription(Accelerometer.addListener((data) => {
      const { x, y, z } = data;
      setAccelerometerData({ x, y, z });

      const dx = Math.abs(x - lastX);
      const dy = Math.abs(y - lastY);
      const dz = Math.abs(z - lastZ);

      if (dx + dy + dz > SHAKE_THRESHOLD) {
        handlePlay();
      }
      lastX = x; lastY = y; lastZ = z;
    }));
  };

  const unsubscribeFromAccelerometerEvents = () => {
    accelerometerSubscription && accelerometerSubscription.remove();
    setAccelerometerSubscription(null);
  };

  const handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
      const now = Date.now();
      const elapsedMs = now - lastTickTime.current;
      const ticksToApply = Math.floor(elapsedMs / TICK_MS);

      if (ticksToApply > 0 && isLoaded.current) {
        setTama(previous => passTime(previous, ticksToApply));
      }
      lastTickTime.current = now;
    }
    appState.current = nextAppState;
  };

  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    const interval = setInterval(() => {
      if (appState.current === 'active' && vivo && isLoaded.current) {
        setTama(previous => passTime(previous, 1));
        lastTickTime.current = Date.now();
      }
    }, TICK_MS);

    return () => {
      subscription.remove();
      clearInterval(interval);
    };
  }, [vivo]);

  const handleFeed = () => setTama(previous => feed(previous));

  const handleGradualWash = () => {
    const agora = Date.now();
    if (agora - lastWashTime.current > 150) {
      setTama(previous => washGradual(previous));
      lastWashTime.current = agora;
    }
  };

  const handlePlay = () => {
    const agora = Date.now();
    if (agora - lastPlayTime.current > 500) {
      setTama(previous => play(previous));
      lastPlayTime.current = agora;
    }
  };

  const handleSleepAction = () => {
    if (!tama.isSleeping) {
      setTama(sleep(tama));
    } else {
      setTama(wakeUp(tama, Date.now()));
    }
  };

  const getBaseAvatar = (): BaseAvatarState => {
    if (!vivo) return "MORTO";
    if (tama.isSleeping) return "NEUTRO";

    if (tama.energy <= 0.5 || tama.happiness <= 0.4 || tama.hunger >= 0.7 || tama.dirtyLevel >= 0.7) {
      return "NEUTRO";
    }
    return "FELIZ";
  };

  useEffect(() => {
    subscribeToAccelerometerEvents();
    return () => unsubscribeFromAccelerometerEvents();
  }, []);

  return {
    tama,
    vivo,
    avatarBase: getBaseAvatar(),
    alertas: {
      comFome: vivo && !tama.isSleeping && tama.hunger >= 0.7,
      cansado: vivo && !tama.isSleeping && tama.energy <= 0.5,
      triste: vivo && !tama.isSleeping && tama.happiness <= 0.4,
      sujo: vivo && !tama.isSleeping && tama.dirtyLevel >= 0.7,
      dormindo: tama.isSleeping,
    },
    handleFeed,
    handleGradualWash,
    handlePlay,
    handleSleepAction
  };
}
