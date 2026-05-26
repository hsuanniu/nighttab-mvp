import type { Bill, GirlAssignment, GirlItem, Participant, SharedItem } from "@/types/nighttab";

export const SHARED_ITEM_NAMES = [
  "包廂費",
  "人頭費",
  "小費",
  "小菜",
  "酒水",
  "幹部費",
  "招待扣除",
  "其他",
  "其他共同消費",
];
export const SHARED_ITEM_SHORTCUTS = ["包廂費", "人頭費", "小費", "小菜", "酒水", "招待扣除", "其他"];
export const GIRL_ITEM_TYPES = ["妹子坐檯費", "點檯費", "節數費", "指定消費"];

export function makeId(prefix: string) {
  return `${prefix}-${globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`}`;
}

export function localDate() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const date = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${date}`;
}

export function createParticipant(name = ""): Participant {
  return { id: makeId("person"), name, paid: false, notes: "" };
}

export function createSharedItem(name = "酒水", amount = 0): SharedItem {
  return { id: makeId("shared"), name, amount };
}

export function createGirlItem(storeName = ""): GirlItem {
  return {
    id: makeId("girl-item"),
    girlName: "",
    storeName,
    type: GIRL_ITEM_TYPES[0],
    sessions: 1,
    amount: 0,
    assignedToParticipantId: "",
    notes: "",
  };
}

export function createGirlAssignment({
  girlName,
  participant,
  storeName,
  date,
}: {
  girlName: string;
  participant: Participant;
  storeName: string;
  date: string;
}): GirlAssignment {
  const now = new Date().toISOString();
  return {
    id: makeId("assignment"),
    girlName: girlName.trim(),
    participantId: participant.id,
    participantName: participant.name.trim(),
    storeName,
    date,
    notes: "",
    sessions: null,
    amount: null,
    createdAt: now,
    updatedAt: now,
  };
}

export function createBill(): Bill {
  const now = new Date().toISOString();
  return {
    id: makeId("bill"),
    stage: "open",
    storeName: "",
    date: localDate(),
    receiptImageDataUrl: "",
    receiptImageName: "",
    cashPrice: 0,
    cardPrice: 0,
    totalAmount: 0,
    settlementAmount: 0,
    paymentMode: "cash",
    participants: [createParticipant("老闆 1")],
    sharedItems: [createSharedItem("包廂費"), createSharedItem("酒水")],
    girlItems: [],
    girlAssignments: [],
    notes: "",
    createdAt: now,
    updatedAt: now,
  };
}

export function adoptedAmount(bill: Bill) {
  if (bill.paymentMode === "card") return bill.cardPrice || bill.settlementAmount || bill.totalAmount;
  if (bill.paymentMode === "custom") return bill.settlementAmount || bill.totalAmount;
  return bill.cashPrice || bill.settlementAmount || bill.totalAmount;
}
