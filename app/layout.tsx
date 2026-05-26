import type { Metadata } from "next";
import "@/app/globals.css";
import { AppShell } from "@/components/AppShell";
import { NightTabProvider } from "@/store/NightTabProvider";

export const metadata: Metadata = {
  title: "夜帳 NightTab",
  description: "手動建立帳單、快速分帳與妹名記錄。",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-Hant">
      <body>
        <NightTabProvider>
          <AppShell>{children}</AppShell>
        </NightTabProvider>
      </body>
    </html>
  );
}
