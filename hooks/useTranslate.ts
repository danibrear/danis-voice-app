import { logEvent } from "@/utils/analytics";
import { translateText } from "@/utils/translateText";
import { useCallback, useEffect, useState } from "react";

type Params = {
  input: string;
  isTranslating: boolean;
  sourceLang: string;
  targetLang: string;
};

export function useTranslate({
  input,
  isTranslating,
  sourceLang,
  targetLang,
}: Params) {
  const [translatedMessage, setTranslatedMessage] = useState<string | null>(
    null,
  );
  const [isTranslationLoading, setIsTranslationLoading] = useState(false);
  const [translationError, setTranslationError] = useState<string | null>(null);

  const doTranslate = useCallback(
    async (text: string) => {
      try {
        const result = await translateText(text, sourceLang, targetLang);
        if (result.status === "error") {
          console.error("Translation error:", result.error);
          setTranslatedMessage(null);
          const errorMsg = result.error || "Unknown translation error";
          setTranslationError(errorMsg);
          logEvent("translation_error", {
            error: errorMsg,
            source_lang: sourceLang,
            target_lang: targetLang,
          });
          return;
        }
        if (!result.translatedTexts || result.translatedTexts.length === 0) {
          setTranslatedMessage(null);
          const errorMsg = "No translation available";
          setTranslationError(errorMsg);
          logEvent("translation_error", {
            error: errorMsg,
            source_lang: sourceLang,
            target_lang: targetLang,
          });
          return;
        }
        let translated: string;
        if (Array.isArray(result.translatedTexts)) {
          translated = result.translatedTexts[0];
        } else {
          translated = result.translatedTexts;
        }
        logEvent("translation_success", {
          source_lang: sourceLang,
          target_lang: targetLang,
        });
        setTranslatedMessage(translated);
      } catch (error) {
        console.log("[ERROR] error translating: ", error);
        const errorMsg = (error as Error).message;
        setTranslationError(errorMsg);
        logEvent("translation_error", {
          error: errorMsg,
          source_lang: sourceLang,
          target_lang: targetLang,
        });
      } finally {
        setIsTranslationLoading(false);
      }
    },
    [sourceLang, targetLang],
  );

  useEffect(() => {
    if (!isTranslating || input.trim().length === 0) {
      setTranslatedMessage(null);
      setTranslationError(null);
      setIsTranslationLoading(false);
      return;
    }
    setIsTranslationLoading(true);
    const timeout = setTimeout(() => {
      doTranslate(input.trim());
    }, 500);
    return () => clearTimeout(timeout);
  }, [input, isTranslating, doTranslate]);

  return { translatedMessage, isTranslationLoading, translationError };
}
