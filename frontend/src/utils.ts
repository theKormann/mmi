// frontend/src/utils.ts
export const toKebabCase = (str: string) => {
  if (!str) return "";
  return str.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
};
