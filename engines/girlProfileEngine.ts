import type { Bill, GirlProfile } from "@/types/nighttab";
import { makeId } from "@/modules/bills/billFactory";
import { createGirlKey, normalizeGirlName, normalizeGirlStoreName } from "@/utils/createGirlKey";

export function buildGirlProfiles(bills: Bill[], savedProfiles: GirlProfile[], hiddenGirlKeys: string[] = []) {
  const hiddenKeys = new Set(hiddenGirlKeys);
  const savedByKey = new Map(savedProfiles.map((profile) => [createGirlKey(profile.name, profile.storeName), profile]));
  const aggregate = new Map<string, GirlProfile>();
  console.log("hidden keys", hiddenGirlKeys);

  bills.forEach((bill) => {
    const billGirls = new Set<string>();
    const assignments = bill.girlAssignments ?? [];
    const billGirlsSource = assignments.length > 0 || bill.stage
      ? assignments.map((assignment) => ({
        girlName: assignment.girlName,
        storeName: assignment.storeName,
        sessions: assignment.sessions,
        amount: assignment.amount,
        participantName: assignment.participantName,
      }))
      : (bill.girlItems ?? []).map((item) => ({
        girlName: item.girlName,
        storeName: item.storeName,
        sessions: item.sessions,
        amount: item.amount,
        participantName: bill.participants.find((participant) => participant.id === item.assignedToParticipantId)?.name ?? "",
      }));
    billGirlsSource.forEach((item) => {
      const name = normalizeGirlName(item.girlName);
      if (!name || name === "未填妹名") return;
      const storeName = normalizeGirlStoreName(item.storeName || bill.storeName);
      const key = createGirlKey(name, storeName);
      console.log("profile key", key);
      const saved = savedByKey.get(key);
      const current = aggregate.get(key) ?? {
        id: saved?.id ?? makeId("girl-profile"),
        name,
        storeName,
        tags: saved?.tags ?? [],
        notes: saved?.notes ?? "",
        visitCount: 0,
        totalSessions: 0,
        totalAmount: 0,
        lastSeenDate: bill.date,
        recentParticipantName: "",
        participantNames: [],
      };
      current.totalSessions += Number(item.sessions) || 0;
      current.totalAmount += Number(item.amount) || 0;
      const participantName = item.participantName.trim();
      if (participantName && !current.participantNames?.includes(participantName)) {
        current.participantNames = [...(current.participantNames ?? []), participantName];
      }
      current.lastSeenDate = current.lastSeenDate > bill.date ? current.lastSeenDate : bill.date;
      if (participantName && current.lastSeenDate === bill.date) current.recentParticipantName = participantName;
      if (!billGirls.has(key)) {
        current.visitCount += 1;
        billGirls.add(key);
      }
      aggregate.set(key, current);
    });
  });

  savedProfiles.forEach((profile) => {
    const key = createGirlKey(profile.name, profile.storeName);
    console.log("profile key", key);
    if (!aggregate.has(key)) aggregate.set(key, profile);
  });

  const profiles = [...aggregate.values()];
  const filteredProfiles = profiles.filter((profile) => {
    const key = createGirlKey(profile.name, profile.storeName);
    console.log("profile key", key);
    console.log("hidden keys", hiddenGirlKeys);
    return !hiddenKeys.has(key);
  });

  return filteredProfiles
    .sort((a, b) => b.lastSeenDate.localeCompare(a.lastSeenDate));
}
