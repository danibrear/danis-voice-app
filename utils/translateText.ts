import { onTranslateTask } from "expo-translate-text";

export async function translateText(
  text: string,
  sourceLang: string,
  targetLang: string,
): Promise<string> {
  const result = await onTranslateTask({
    input: text,
    sourceLangCode: sourceLang,
    targetLangCode: targetLang,
  });
  if (
    Array.isArray(result.translatedTexts) &&
    result.translatedTexts.length > 0
  ) {
    return result.translatedTexts[0] as string;
  }
  return result.translatedTexts as string;
}
