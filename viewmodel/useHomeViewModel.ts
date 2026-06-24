import { useEffect, useRef, useState } from "react";
import { AppState, AppStateStatus } from "react-native";
import { TICK_MS, Tamagotchi, feed, isAlive, passTime, play, sleep, wakeUp, washGradual } from "../types/tamagotchi";

export type BaseAvatarState = "FELIZ" | "NEUTRO" | "MORTO";

export function useHomeViewModel() {
  const [tama, setTama] = useState<Tamagotchi>({
    name: "Biscuit",
    energy: 1.0,
    happiness: 1.0,
    hunger: 1.0,
    isSleeping: false,
    dirtyLevel: 1.0,
  });

  const appState = useRef(AppState.currentState);
  const lastTickTime = useRef(Date.now());
  const lastPlayTime = useRef(0);
  const lastWashTime = useRef(0);

  const vivo = isAlive(tama);

  const handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
      const now = Date.now();
      const elapsedMs = now - lastTickTime.current;
      const ticksToApply = Math.floor(elapsedMs / TICK_MS);

      if (ticksToApply > 0) {
        setTama(previous => passTime(previous, ticksToApply));
      }
      lastTickTime.current = now;
    }
    appState.current = nextAppState;
  };

  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    const interval = setInterval(() => {
      if (appState.current === 'active' && isAlive(tama)) {
        setTama(previous => passTime(previous, 1));
        lastTickTime.current = Date.now();
      }
    }, TICK_MS);

    return () => {
      subscription.remove();
      clearInterval(interval);
    };
  }, [tama]);

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
