import type { Bill, GirlAssignment, GirlItem, Participant } from "@/types/nighttab";
import { adoptedAmount } from "@/modules/bills/billFactory";

export type ParticipantSplit = {
  participant: Participant;
  sharedAmount: number;
  personalAmount: number;
  finalAmount: number;
};

export function money(value: unknown) {
  const amount = Number(value);
  return Number.isFinite(amount) ? Math.max(0, amount) : 0;
}

export function signedMoney(value: unknown) {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : 0;
}

type PersonalCharge = Pick<GirlItem, "amount" | "assignedToParticipantId" | "girlName"> & {
  sourceId: string;
};

function assignmentCharge(assignment: GirlAssignment): PersonalCharge {
  return {
    sourceId: assignment.id,
    girlName: assignment.girlName,
    amount: money(assignment.amount),
    assignedToParticipantId: assignment.participantId,
  };
}

export function personalChargesForBill(bill: Bill) {
  const assignments = bill.girlAssignments ?? [];
  if (assignments.length > 0 || bill.stage) {
    return assignments.map(assignmentCharge).filter((charge) => charge.amount > 0);
  }
  return (bill.girlItems ?? []).map((item) => ({
    sourceId: item.id,
    girlName: item.girlName,
    amount: money(item.amount),
    assignedToParticipantId: item.assignedToParticipantId,
  })).filter((charge) => charge.amount > 0);
}

export function calculateSplit(bill: Bill) {
  const sharedTotal = bill.sharedItems.reduce((sum, item) => sum + signedMoney(item.amount), 0);
  const personalCharges = personalChargesForBill(bill);
  const personalItemsTotal = personalCharges.reduce((sum, item) => sum + money(item.amount), 0);
  const participantCount = bill.participants.length;
  const sharedPerPerson = participantCount ? sharedTotal / participantCount : 0;
  const rows: ParticipantSplit[] = bill.participants.map((participant) => {
    const personalAmount = personalCharges
      .filter((item) => item.assignedToParticipantId === participant.id)
      .reduce((sum, item) => sum + money(item.amount), 0);
    return {
      participant,
      sharedAmount: sharedPerPerson,
      personalAmount,
      finalAmount: sharedPerPerson + personalAmount,
    };
  });
  const itemsTotal = sharedTotal + personalItemsTotal;
  const settlementTotal = money(adoptedAmount(bill));

  return {
    sharedTotal,
    sharedPerPerson,
    personalItemsTotal,
    itemsTotal,
    settlementTotal,
    unassignedGirlItems: personalCharges.filter((item) => !item.assignedToParticipantId),
    difference: settlementTotal - itemsTotal,
    rows,
  };
}
