import type { NightTabState } from "@/types/nighttab";
import { createGirlKey } from "@/utils/createGirlKey";

export const NIGHTTAB_STORAGE_KEY = "nighttab.mvp.v1";
export const EMPTY_STATE: NightTabState = { bills: [], girlProfiles: [], hiddenGirlKeys: [] };

export function loadNightTabState(): NightTabState {
  if (typeof window === "undefined") return EMPTY_STATE;
  try {
    const parsed = JSON.parse(window.localStorage.getItem(NIGHTTAB_STORAGE_KEY) ?? "");
    return {
      bills: Array.isArray(parsed?.bills)
        ? parsed.bills.map((bill: Record<string, unknown>) => ({
          ...bill,
          girlItems: Array.isArray(bill.girlItems) ? bill.girlItems : [],
          girlAssignments: Array.isArray(bill.girlAssignments) ? bill.girlAssignments : [],
        }))
        : [],
      girlProfiles: Array.isArray(parsed?.girlProfiles) ? parsed.girlProfiles : [],
      hiddenGirlKeys: Array.isArray(parsed?.hiddenGirlKeys)
        ? parsed.hiddenGirlKeys.map((key: unknown) => String(key)).filter(Boolean)
        : Array.isArray(parsed?.hiddenGirlProfiles)
          ? parsed.hiddenGirlProfiles
            .map((profile: Record<string, unknown>) => createGirlKey(String(profile.girlName ?? ""), String(profile.storeName ?? "")))
            .filter(Boolean)
          : [],
      hiddenGirlProfiles: Array.isArray(parsed?.hiddenGirlProfiles)
        ? parsed.hiddenGirlProfiles
        : [],
    };
  } catch {
    return EMPTY_STATE;
  }
}

export function saveNightTabState(state: NightTabState) {
  if (typeof window === "undefined") return false;
  try {
    window.localStorage.setItem(NIGHTTAB_STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}
