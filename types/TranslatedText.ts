export type TranslateTextResult = {
  translatedTexts: string[] | string;
  status: "success" | "error";
  error?: string;
};
