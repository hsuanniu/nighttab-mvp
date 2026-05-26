"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Bill } from "@/types/nighttab";
import { BillEditor } from "@/components/BillEditor";
import { useNightTab } from "@/store/NightTabProvider";

export function CheckoutWorkspace({ billId }: { billId: string }) {
  const router = useRouter();
  const { deleteBill, findBill, ready, saveBill } = useNightTab();
  const stored = findBill(billId);
  const [bill, setBill] = useState<Bill | null>(stored ?? null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (stored) setBill(stored);
  }, [stored]);

  if (!ready) return <section className="card"><p className="quiet">讀取本局資料中。</p></section>;
  if (!bill) return <section className="card"><h1>找不到這場局</h1><Link href="/history" className="soft-link">回歷史</Link></section>;
  const removeBill = () => {
    if (!window.confirm("確定要刪除這筆歷史紀錄嗎？\n\n此局的參與者、公費、小姐對應、分帳資料與帳單紀錄都會一起刪除，且無法復原。")) return;
    deleteBill(bill.id);
    router.push("/history");
  };

  return (
    <div className="page-stack">
      <section className="card checkout-head">
        <div className="section-head">
          <div><p className="eyebrow">結帳</p><h1>補金額後分帳</h1></div>
          <Link href={`/bills/${bill.id}/live`} className="soft-link">回現場</Link>
        </div>
        <p className="quiet">現場已記的小姐會保留對應老闆，只補節數和金額即可。</p>
        <button type="button" className="danger-button detail-delete" onClick={removeBill}>刪除此局</button>
      </section>
      {saved && <div className="success-note">結帳與分帳已儲存。</div>}
      <BillEditor
        bill={bill}
        setBill={(next) => {
          setSaved(false);
          setBill(next);
        }}
        saveLabel="儲存結帳"
        showLineCopyAction
        onSave={() => {
          saveBill({ ...bill, stage: "settled" });
          setSaved(true);
        }}
      />
    </div>
  );
}
