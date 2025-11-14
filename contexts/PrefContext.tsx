import { usePreferences } from "@/hooks/usePrefContext";
import { Preferences } from "@/types/Preferences";
import { createContext, ReactNode } from "react";

export const PrefContext = createContext<{
  preferences: Preferences;
  setPitch: (n: number) => void;
  setRate: (n: number) => void;
}>({
  preferences: {
    speechPitch: 1.0,
    speechRate: 1.0,
  },
  setPitch: () => null,
  setRate: () => null,
});

export const PrefContextProvider = ({ children }: { children: ReactNode }) => {
  const { preferences, setPitch, setRate } = usePreferences();
  return (
    <PrefContext.Provider
      value={{
        preferences,
        setPitch,
        setRate,
      }}>
      {children}
    </PrefContext.Provider>
  );
};
