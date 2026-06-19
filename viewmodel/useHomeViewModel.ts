import { useEffect, useRef, useState } from "react";
import { AppState, AppStateStatus } from "react-native";
import { TICK_MS, Tamagotchi, feed, isAlive, passTime, play, sleep, wakeUp, washGradual } from "../types/tamagotchi";

export function useHomeViewModel() {
  const [tama, setTama] = useState<Tamagotchi>({
    name: "Tamagotchi",
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

  const getAvatarColor = () => {
    if (!vivo) return '#333333';             
    if (tama.isSleeping) return '#9C27B0';    
    if (tama.energy <= 0.5) return '#2196F3';  
    if (tama.happiness <= 0.4) return '#F44336'; 
    if (tama.hunger >= 0.7) return '#FFEB3B';  
    if (tama.dirtyLevel >= 1.0) return '#849483'; 
    return '#4CAF50';                         
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

  return {
    tama,
    vivo,
    avatarColor: getAvatarColor(),
    avatarFace: getAvatarFace(),
    handleFeed,
    handleGradualWash,
    handlePlay,
    handleSleepAction
  };
}
