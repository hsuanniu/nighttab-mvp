"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Bill } from "@/types/nighttab";
import { BillEditor } from "@/components/BillEditor";
import { useNightTab } from "@/store/NightTabProvider";

export function SplitWorkspace({ billId }: { billId: string }) {
  const router = useRouter();
  const { deleteBill, findBill, ready, saveBill } = useNightTab();
  const stored = findBill(billId);
  const [bill, setBill] = useState<Bill | null>(stored ?? null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (stored) setBill(stored);
  }, [stored]);

  if (!ready) return <section className="card"><p className="quiet">讀取帳單中。</p></section>;
  if (!bill) return <section className="card"><h1>找不到帳單</h1><Link href="/history" className="soft-link">回歷史</Link></section>;
  const removeBill = () => {
    if (!window.confirm("確定要刪除這筆歷史紀錄嗎？\n\n此局的參與者、公費、小姐對應、分帳資料與帳單紀錄都會一起刪除，且無法復原。")) return;
    deleteBill(bill.id);
    router.push("/history");
  };

  return (
    <div className="page-stack">
      {saved && <div className="success-note">分帳已儲存到本機。</div>}
      <button type="button" className="danger-button detail-delete" onClick={removeBill}>刪除此局</button>
      <BillEditor
        bill={bill}
        setBill={(next) => {
          setSaved(false);
          setBill(next);
        }}
        saveLabel="儲存分帳"
        showLineCopyAction
        onSave={() => {
          saveBill(bill);
          setSaved(true);
        }}
      />
    </div>
  );
}
