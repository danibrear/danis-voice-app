export async function translateText(
  text: string,
  sourceLang: string,
  targetLang: string,
): Promise<string> {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${encodeURIComponent(sourceLang)}&tl=${encodeURIComponent(targetLang)}&dt=t&q=${encodeURIComponent(text)}`;
  const response = await fetch(url);
  const data = await response.json();
  // Response: [[["translated", "original", ...], ...], ...]
  const translated = (data[0] as [string, ...unknown[]][])
    ?.map((chunk) => chunk[0])
    .join("");
  return translated ?? text;
}
