export const trimDescription = (text: string, wordLimit: number = 20): string => {
    const words = text.split(" ");
    return words.length > wordLimit
      ? words.slice(0, wordLimit).join(" ") + "..."
      : text;
  };