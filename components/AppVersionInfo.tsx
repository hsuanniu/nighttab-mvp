import { appInfo } from "@/lib/appInfo";

export function AppVersionInfo() {
  return (
    <p className="app-version">
      NightTab {appInfo.version} · 最後更新 {appInfo.lastUpdated}
    </p>
  );
}
