import { TranslateTextResult } from "@/types/TranslatedText";
import { logEvent } from "./analytics";
import { fetchGoogleTranslate } from "./fetchGoogleTranslate";

export async function translateText(
  text: string,
  sourceLang: string,
  targetLang: string,
): Promise<TranslateTextResult> {
  try {
    const translated = await fetchGoogleTranslate(text, sourceLang, targetLang);
    logEvent("translation_success", {
      source_lang: sourceLang,
      target_lang: targetLang,
    });
    if (translated) return { translatedTexts: translated, status: "success" };
    logEvent("translation_error", {
      error: "Empty translation result",
      source_lang: sourceLang,
      target_lang: targetLang,
    });
    throw new Error("Empty response");
  } catch (error) {
    console.log("[ERROR] Translation failed:", error);
    logEvent("translation_error", {
      error: (error as Error).message,
      source_lang: sourceLang,
      target_lang: targetLang,
    });
    // Fall back to browser Translation API (Chrome 131+)
    const translationApi = (
      window as unknown as {
        translation?: {
          canTranslate: (opts: {
            sourceLanguage: string;
            targetLanguage: string;
          }) => Promise<string>;
          createTranslator: (opts: {
            sourceLanguage: string;
            targetLanguage: string;
          }) => Promise<{ translate: (text: string) => Promise<string> }>;
        };
      }
    ).translation;

    if (!translationApi) return { translatedTexts: text, status: "error" };

    const availability = await translationApi.canTranslate({
      sourceLanguage: sourceLang,
      targetLanguage: targetLang,
    });
    if (availability === "no")
      return { translatedTexts: text, status: "error" };

    const translator = await translationApi.createTranslator({
      sourceLanguage: sourceLang,
      targetLanguage: targetLang,
    });
    const translated = await translator.translate(text);
    return { translatedTexts: translated, status: "success" };
  }
}
