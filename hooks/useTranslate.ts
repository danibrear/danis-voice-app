import { translateText } from "@/utils/translateText";
import { useCallback, useEffect, useState } from "react";

type Params = {
  input: string;
  isTranslating: boolean;
  sourceLang: string;
  targetLang: string;
};

export function useTranslate({ input, isTranslating, sourceLang, targetLang }: Params) {
  const [translatedMessage, setTranslatedMessage] = useState<string | null>(null);
  const [isTranslationLoading, setIsTranslationLoading] = useState(false);

  const doTranslate = useCallback(
    async (text: string) => {
      try {
        const result = await translateText(text, sourceLang, targetLang);
        setTranslatedMessage(result);
      } catch (error) {
        console.error(error);
      } finally {
        setIsTranslationLoading(false);
      }
    },
    [sourceLang, targetLang],
  );

  useEffect(() => {
    if (!isTranslating || input.trim().length === 0) {
      setTranslatedMessage(null);
      setIsTranslationLoading(false);
      return;
    }
    setIsTranslationLoading(true);
    const timeout = setTimeout(() => {
      doTranslate(input.trim());
    }, 500);
    return () => clearTimeout(timeout);
  }, [input, isTranslating, doTranslate]);

  return { translatedMessage, isTranslationLoading };
}
