import { calculateSplit } from "@/engines/splitEngine";
import { currency } from "@/modules/format";
import type { Bill } from "@/types/nighttab";

export function createLineSplitText(bill: Bill) {
  const split = calculateSplit(bill);
  const total = split.settlementTotal || split.itemsTotal;
  const participantLines = split.rows.map((row) => (
    `- ${row.participant.name || "未命名"}：${currency(row.finalAmount)}`
  ));

  return [
    "夜帳 NightTab 分帳",
    `${bill.storeName || "未填店名"}｜${bill.date}`,
    `總金額：${currency(total)}`,
    `桌面費用總額：${currency(split.sharedTotal)}`,
    `參與人數：${bill.participants.length}`,
    `每人桌面費：${currency(split.sharedPerPerson)}`,
    "",
    "每人應付：",
    ...participantLines,
  ].join("\n");
}
