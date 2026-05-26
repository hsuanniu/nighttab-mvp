export function normalizeGirlName(girlName?: string) {
  return (girlName || "未填妹名").trim() || "未填妹名";
}

export function normalizeGirlStoreName(storeName?: string) {
  return (storeName || "未填店名").trim() || "未填店名";
}

export function createGirlKey(girlName?: string, storeName?: string) {
  const normalizedGirl = normalizeGirlName(girlName);
  const normalizedStore = normalizeGirlStoreName(storeName);
  return `${normalizedStore}::${normalizedGirl}`;
}
