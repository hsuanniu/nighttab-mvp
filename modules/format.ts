export function currency(value: number) {
  return new Intl.NumberFormat("zh-TW", {
    style: "currency",
    currency: "TWD",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

export function shortDate(value: string) {
  return value ? value.replaceAll("-", "/") : "-";
}
