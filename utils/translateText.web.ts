import { fetchGoogleTranslate } from "./fetchGoogleTranslate";

export async function translateText(
  text: string,
  sourceLang: string,
  targetLang: string,
): Promise<string> {
  try {
    const translated = await fetchGoogleTranslate(text, sourceLang, targetLang);
    if (translated) return translated;
    throw new Error("Empty response");
  } catch {
    // Fall back to browser Translation API (Chrome 131+)
    const translationApi = (window as unknown as { translation?: {
      canTranslate: (opts: { sourceLanguage: string; targetLanguage: string }) => Promise<string>;
      createTranslator: (opts: { sourceLanguage: string; targetLanguage: string }) => Promise<{ translate: (text: string) => Promise<string> }>;
    } }).translation;

    if (!translationApi) return text;

    const availability = await translationApi.canTranslate({ sourceLanguage: sourceLang, targetLanguage: targetLang });
    if (availability === "no") return text;

    const translator = await translationApi.createTranslator({ sourceLanguage: sourceLang, targetLanguage: targetLang });
    return await translator.translate(text);
  }
}
