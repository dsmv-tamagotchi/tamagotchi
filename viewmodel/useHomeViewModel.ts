import { useState, useEffect } from "react";
import { Tamagotchi, feed, play, sleep, wakeUp, isAlive } from "../types/tamagotchi";
import { NotificationService } from "../services/notifications";

const WARNING_THRESHOLD = 0.4; 

export function useHomeViewModel() {
  const [pet, setPet] = useState<Tamagotchi>({
    energy: 1.0,
    hunger: 0.5,
    happiness: 0.5,
    isSleeping: false,
    name: "Tama",
    sleepStartedAt: undefined,
  });

  const [warningsSent, setWarningsSent] = useState({
    energy: false,
    hunger: false,
    happiness: false,
    death: false,
  });

  useEffect(() => {
    NotificationService.requestPermissions();
  }, []);

  useEffect(() => {
    if (!isAlive(pet)) {
      if (!warningsSent.death) {
        NotificationService.sendLocalNotification("Oh não!", `${pet.name} morreu.`);
        setWarningsSent(prev => ({ ...prev, death: true }));
      }
      return;
    }

    const updatedWarnings = { ...warningsSent };
    let didChange = false;

    if (pet.energy <= WARNING_THRESHOLD && !warningsSent.energy) {
      NotificationService.sendLocalNotification("Sono!", `${pet.name} está ficando exausto!`);
      updatedWarnings.energy = true;
      didChange = true;
    } else if (pet.energy > WARNING_THRESHOLD && warningsSent.energy) {
      updatedWarnings.energy = false; 
      didChange = true;
    }

    if (pet.happiness <= WARNING_THRESHOLD && !warningsSent.happiness) {
      NotificationService.sendLocalNotification("Tédio!", `${pet.name} está muito triste. Brinque com ele!`);
      updatedWarnings.happiness = true;
      didChange = true;
    } else if (pet.happiness > WARNING_THRESHOLD && warningsSent.happiness) {
      updatedWarnings.happiness = false;
      didChange = true;
    }

    const hungerDangerThreshold = 1 - WARNING_THRESHOLD;
    if (pet.hunger >= hungerDangerThreshold && !warningsSent.hunger) {
      NotificationService.sendLocalNotification("Fome!", `${pet.name} está morrendo de fome!`);
      updatedWarnings.hunger = true;
      didChange = true;
    } else if (pet.hunger < hungerDangerThreshold && warningsSent.hunger) {
      updatedWarnings.hunger = false;
      didChange = true;
    }

    if (didChange) {
      setWarningsSent(updatedWarnings);
    }
  }, [pet, warningsSent]);

  const handleFeed = () => setPet(prev => feed(prev));
  const handlePlay = () => setPet(prev => play(prev));
  const handleSleep = () => setPet(prev => sleep(prev));
  const handleWakeUp = () => setPet(prev => wakeUp(prev, new Date()));

  return {
    pet,
    isPetAlive: isAlive(pet),
    handleFeed,
    handlePlay,
    handleSleep,
    handleWakeUp,
  };
}
