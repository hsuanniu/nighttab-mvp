export type PaymentMode = "cash" | "card" | "custom";
export type BillStage = "open" | "live" | "checkout" | "settled";

export type Participant = {
  id: string;
  name: string;
  paid: boolean;
  notes: string;
};

export type SharedItem = {
  id: string;
  name: string;
  amount: number;
};

export type GirlItem = {
  id: string;
  girlName: string;
  storeName: string;
  type: string;
  sessions: number;
  amount: number;
  assignedToParticipantId: string;
  notes: string;
};

export type GirlAssignment = {
  id: string;
  girlName: string;
  participantId: string;
  participantName: string;
  storeName: string;
  date: string;
  notes: string;
  sessions: number | null;
  amount: number | null;
  createdAt: string;
  updatedAt: string;
};

export type Bill = {
  id: string;
  stage?: BillStage;
  storeName: string;
  date: string;
  receiptImageDataUrl?: string;
  receiptImageName?: string;
  cashPrice: number;
  cardPrice: number;
  totalAmount: number;
  settlementAmount: number;
  paymentMode: PaymentMode;
  participants: Participant[];
  sharedItems: SharedItem[];
  girlItems: GirlItem[];
  girlAssignments: GirlAssignment[];
  notes: string;
  createdAt: string;
  updatedAt: string;
};

export type GirlProfile = {
  id: string;
  name: string;
  storeName: string;
  tags: string[];
  notes: string;
  visitCount: number;
  totalSessions: number;
  totalAmount: number;
  lastSeenDate: string;
  recentParticipantName?: string;
  participantNames?: string[];
};

export type HiddenGirlProfile = {
  girlName: string;
  storeName: string;
  hiddenAt: string;
};

export type NightTabState = {
  bills: Bill[];
  girlProfiles: GirlProfile[];
  hiddenGirlKeys: string[];
  hiddenGirlProfiles?: HiddenGirlProfile[];
};
