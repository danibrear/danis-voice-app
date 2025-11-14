import { useRecentWords } from "@/hooks/useRecentWords";
import { StoredText } from "@/types/StoredText";
import { createContext, ReactNode } from "react";

type StoredTextContextType = {
  recentTexts: StoredText[];
  isLoading: boolean;
  addRecentText: (text: string) => void;
  starText: (id: string) => void;
  unstarText: (id: string) => void;
  removeText: (id: string) => void;
  reload: () => void;
};

export const StoredTextContext = createContext<StoredTextContextType>({
  recentTexts: [] as StoredText[],
  isLoading: false,
  addRecentText: (t: string) => null,
  starText: (id: string) => null,
  unstarText: (id: string) => null,
  removeText: (id: string) => null,
  reload: () => null,
});

export const StoredTextProvider = ({ children }: { children: ReactNode }) => {
  const {
    recentTexts,
    addRecentText,
    isLoading,
    starText,
    unstarText,
    removeText,
    reload,
  } = useRecentWords();

  return (
    <StoredTextContext.Provider
      value={{
        recentTexts,
        isLoading,
        addRecentText,
        starText,
        unstarText,
        removeText,
        reload,
      }}>
      {children}
    </StoredTextContext.Provider>
  );
};
