export const calculateWidthOfWord = (
  word: string,
  fontSize: number,
): number => {
  const shortCharacters = "ilI.,;:!|`'\"";
  const mediumCharacters =
    "abcdefghjkmnopqrstuvwxyzABCDEFGHJKMNOPQRSTUVWXYZ0123456789";
  const wideCharacters = "mwMW@#$%^&*()-+=[]{}<>?/\\~ ";

  let width = 0;

  for (const char of word) {
    if (shortCharacters.includes(char)) {
      width += fontSize * 0.4;
    } else if (mediumCharacters.includes(char)) {
      width += fontSize * 0.6;
    } else if (wideCharacters.includes(char)) {
      width += fontSize * 0.8;
    } else {
      width += fontSize * 0.7; // Default width for unknown characters
    }
  }

  return width;
};
