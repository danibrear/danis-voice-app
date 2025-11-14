import { useEffect, useState } from "react";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { StoredText } from "@/types/StoredText";

const KEY = "recentTexts";

export const useRecentWords = () => {
  const [recentTexts, setRecentTexts] = useState<StoredText[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const reload = async () => {
    try {
      setIsLoading(true);
      const storedWords = await AsyncStorage.getItem(KEY);
      if (storedWords) {
        setRecentTexts(JSON.parse(storedWords));
      }
    } catch (error) {
      console.error("Failed to load recent words:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchRecentWords = async () => {
      try {
        setIsLoading(true);
        const storedWords = await AsyncStorage.getItem(KEY);
        if (storedWords) {
          setRecentTexts(JSON.parse(storedWords));
        }
      } catch (error) {
        console.error("Failed to load recent words:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecentWords();
  }, []);

  const addRecentText = async (text: string) => {
    try {
      const updatedTexts = [
        {
          id: Date.now().toString(),
          text,
          starred: false,
        },
        ...recentTexts.filter((t) => t.text !== text),
      ];
      setRecentTexts(updatedTexts);
      await AsyncStorage.setItem(KEY, JSON.stringify(updatedTexts));
    } catch (error) {
      console.error("Failed to save recent word:", error);
    }
  };

  const starText = async (textId: string) => {
    const updatedTexts = recentTexts.map((t) => {
      if (t.id === textId) {
        return {
          ...t,
          starred: true,
        };
      }
      return t;
    });
    setRecentTexts(updatedTexts);
    await AsyncStorage.setItem(KEY, JSON.stringify(updatedTexts));
  };
  const unstarText = async (textId: string) => {
    const updatedTexts = recentTexts.map((t) => {
      if (t.id === textId) {
        return {
          ...t,
          starred: false,
        };
      }
      return t;
    });
    setRecentTexts(updatedTexts);

    await AsyncStorage.setItem(KEY, JSON.stringify(updatedTexts));
  };

  const removeText = async (textId: string) => {
    const updatedTexts = recentTexts.filter((t) => t.id !== textId);
    setRecentTexts(updatedTexts);
    await AsyncStorage.setItem(KEY, JSON.stringify(updatedTexts));
  };

  return {
    recentTexts,
    reload,
    isLoading,
    addRecentText,
    starText,
    unstarText,
    removeText,
  };
};
