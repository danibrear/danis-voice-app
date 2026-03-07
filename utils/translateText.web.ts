export async function translateText(
  text: string,
  sourceLang: string,
  targetLang: string,
): Promise<string> {
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${encodeURIComponent(sourceLang)}&tl=${encodeURIComponent(targetLang)}&dt=t&q=${encodeURIComponent(text)}`;
    const response = await fetch(url);
    const data = await response.json();
    // Response: [[["translated", "original", ...], ...], ...]
    const translated = (data[0] as [string, ...unknown[]][])
      ?.map((chunk) => chunk[0])
      .join("");
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
