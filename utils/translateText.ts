import { onTranslateTask } from "expo-translate-text";
import { fetchGoogleTranslate } from "./fetchGoogleTranslate";
import { logEvent } from "./analytics";
import { TranslateTextResult } from "@/types/TranslatedText";

export async function translateText(
  text: string,
  sourceLang: string,
  targetLang: string,
): Promise<TranslateTextResult> {
  try {
    const result = await onTranslateTask({
      input: text,
      sourceLangCode: sourceLang,
      targetLangCode: targetLang,
    });
    let translated: string;
    if (
      Array.isArray(result.translatedTexts) &&
      result.translatedTexts.length > 0
    ) {
      translated = result.translatedTexts[0] as string;
    } else {
      translated = result.translatedTexts as string;
    }
    logEvent("translation_success", {
      source_lang: sourceLang,
      target_lang: targetLang,
    });
    return {
      translatedTexts: translated,
      status: "success",
    };
  } catch (deviceError) {
    console.log(
      "[WARN] On-device translation failed, falling back to Google Translate:",
      deviceError,
    );
    logEvent("on_device_translation_failed", {
      error: (deviceError as Error).message,
      source_lang: sourceLang,
      target_lang: targetLang,
    });
    try {
      const translated = await fetchGoogleTranslate(
        text,
        sourceLang,
        targetLang,
      );
      if (translated) {
        logEvent("google_translate_fallback_success", {
          source_lang: sourceLang,
          target_lang: targetLang,
        });
        return { translatedTexts: translated, status: "success" };
      }
    } catch (fallbackError) {
      console.log(
        "[ERROR] Google Translate fallback also failed:",
        fallbackError,
      );
      logEvent("google_translate_fallback_failed", {
        error: (fallbackError as Error).message,
        source_lang: sourceLang,
        target_lang: targetLang,
      });
    }
    return {
      translatedTexts: text,
      status: "error",
      error: (deviceError as Error).message,
    };
  }
}
