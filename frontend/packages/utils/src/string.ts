export const toTitleCase = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.substr(1).toLowerCase();
};
