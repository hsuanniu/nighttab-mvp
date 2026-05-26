"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Bill, GirlProfile, NightTabState } from "@/types/nighttab";
import { buildGirlProfiles } from "@/engines/girlProfileEngine";
import { EMPTY_STATE, loadNightTabState, saveNightTabState } from "@/services/nighttabStorage";
import { createGirlKey } from "@/utils/createGirlKey";

type NightTabContextValue = {
  ready: boolean;
  bills: Bill[];
  girlProfiles: GirlProfile[];
  hiddenGirlKeys: string[];
  commonParticipantNames: string[];
  storageError: string;
  saveBill: (bill: Bill) => void;
  deleteBill: (id: string) => void;
  saveGirlProfile: (profile: GirlProfile) => void;
  addGirlProfile: (profile: GirlProfile) => void;
  deleteGirlProfileFile: (profile: Pick<GirlProfile, "name" | "storeName">) => void;
  deleteGirlRecords: (profile: Pick<GirlProfile, "name" | "storeName">) => void;
  hideGirlProfile: (profile: Pick<GirlProfile, "name" | "storeName">) => void;
  restoreGirlProfile: (key: string) => void;
  findBill: (id: string) => Bill | undefined;
};

const NightTabContext = createContext<NightTabContextValue | null>(null);

export function NightTabProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<NightTabState>(EMPTY_STATE);
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState("");

  useEffect(() => {
    setState(loadNightTabState());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    setStorageError(saveNightTabState(state) ? "" : "本機儲存空間不足，請先刪除不需要的歷史紀錄後再儲存。");
  }, [ready, state]);

  const value = useMemo<NightTabContextValue>(() => {
    const aggregatedProfiles = buildGirlProfiles(state.bills, state.girlProfiles, state.hiddenGirlKeys);
    const participantCounts = new Map<string, number>();
    state.bills.forEach((bill) => {
      bill.participants.forEach((participant) => {
        const name = participant.name.trim();
        if (!name) return;
        participantCounts.set(name, (participantCounts.get(name) ?? 0) + 1);
      });
    });
    const commonParticipantNames = [...participantCounts.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "zh-Hant"))
      .map(([name]) => name)
      .slice(0, 10);
    return {
      ready,
      bills: [...state.bills].sort((a, b) => b.date.localeCompare(a.date)),
      girlProfiles: aggregatedProfiles,
      hiddenGirlKeys: state.hiddenGirlKeys,
      commonParticipantNames,
      storageError,
      saveBill: (bill) => setState((current) => {
        const updatedBill = { ...bill, updatedAt: new Date().toISOString() };
        const exists = current.bills.some((item) => item.id === bill.id);
        return {
          ...current,
          bills: exists
            ? current.bills.map((item) => (item.id === bill.id ? updatedBill : item))
            : [updatedBill, ...current.bills],
        };
      }),
      deleteBill: (id) => setState((current) => ({
        ...current,
        bills: current.bills.filter((bill) => bill.id !== id),
      })),
      saveGirlProfile: (profile) => setState((current) => {
        const exists = current.girlProfiles.some((item) => item.id === profile.id);
        return {
          ...current,
          girlProfiles: exists
            ? current.girlProfiles.map((item) => (item.id === profile.id ? profile : item))
            : [...current.girlProfiles, profile],
        };
      }),
      addGirlProfile: (profile) => setState((current) => ({
        ...current,
        girlProfiles: [...current.girlProfiles, profile],
      })),
      deleteGirlProfileFile: (profile) => setState((current) => ({
        ...current,
        girlProfiles: current.girlProfiles.filter((item) => !(
          createGirlKey(item.name, item.storeName) === createGirlKey(profile.name, profile.storeName)
        )),
      })),
      deleteGirlRecords: (profile) => setState((current) => {
        const key = createGirlKey(profile.name, profile.storeName);
        return {
          ...current,
          bills: current.bills.map((bill) => ({
            ...bill,
            girlAssignments: (bill.girlAssignments ?? []).filter((assignment) => (
              createGirlKey(assignment.girlName, assignment.storeName || bill.storeName) !== key
            )),
            girlItems: (bill.girlItems ?? []).filter((item) => (
              createGirlKey(item.girlName, item.storeName || bill.storeName) !== key
            )),
            updatedAt: new Date().toISOString(),
          })),
          girlProfiles: current.girlProfiles.filter((item) => createGirlKey(item.name, item.storeName) !== key),
          hiddenGirlKeys: current.hiddenGirlKeys.filter((item) => item !== key),
        };
      }),
      hideGirlProfile: (profile) => setState((current) => {
        const key = createGirlKey(profile.name, profile.storeName);
        if (current.hiddenGirlKeys.includes(key)) return current;
        return {
          ...current,
          hiddenGirlKeys: [...current.hiddenGirlKeys, key],
        };
      }),
      restoreGirlProfile: (key) => setState((current) => ({
        ...current,
        hiddenGirlKeys: current.hiddenGirlKeys.filter((item) => item !== key),
      })),
      findBill: (id) => state.bills.find((bill) => bill.id === id),
    };
  }, [ready, state, storageError]);

  return <NightTabContext.Provider value={value}>{children}</NightTabContext.Provider>;
}

export function useNightTab() {
  const value = useContext(NightTabContext);
  if (!value) throw new Error("useNightTab must be used inside NightTabProvider");
  return value;
}
