import { PrefContext } from "@/contexts/PrefContext";
import { Preferences } from "@/types/Preferences";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useContext, useEffect, useState } from "react";

const KEY = "PREFERENCES";

export const usePrefContext = () => {
  const context = useContext(PrefContext);
  return context;
};

export const usePreferences = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [preferences, setPreferences] = useState<Preferences>({
    speechPitch: 1.0,
    speechRate: 1.0,
  });

  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        setIsLoading(true);
        const prefs = await AsyncStorage.getItem(KEY);
        if (prefs) {
          const prefsObj = JSON.parse(prefs);
          setPreferences(prefsObj);
        }
      } catch (error) {
        console.error("Failed to load recent words:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPreferences();
  }, []);

  const setPitch = async (newPitch: number) => {
    const newPrefs = {
      ...preferences,
      speechPitch: Math.min(Math.max(0.1, newPitch), 2.0),
    };
    setPreferences(newPrefs);
    await AsyncStorage.setItem(KEY, JSON.stringify(newPrefs));
  };
  const setRate = async (newRate: number) => {
    const newPrefs = {
      ...preferences,
      speechRate: Math.min(Math.max(0.1, newRate), 2.0),
    };
    setPreferences(newPrefs);
    await AsyncStorage.setItem(KEY, JSON.stringify(newPrefs));
  };

  return {
    preferences,
    setRate,
    setPitch,
    isLoading,
  };
};
