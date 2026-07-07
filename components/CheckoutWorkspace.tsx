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
  const [showDeleteSheet, setShowDeleteSheet] = useState(false);

  useEffect(() => {
    if (stored) setBill(stored);
  }, [stored]);

  if (!ready) return <section className="card"><p className="quiet">讀取本局資料中。</p></section>;
  if (!bill) return <section className="card"><h1>找不到這場局</h1><Link href="/history" className="soft-link">回歷史</Link></section>;
  const removeBill = () => {
    deleteBill(bill.id);
    router.push("/history");
  };

  return (
    <div className="page-stack">
      {showDeleteSheet && (
        <div className="sheet-overlay" role="presentation" onClick={() => setShowDeleteSheet(false)}>
          <section className="confirm-sheet" role="dialog" aria-modal="true" aria-labelledby="delete-checkout-title" onClick={(event) => event.stopPropagation()}>
            <div className="sheet-handle" />
            <p className="eyebrow">{bill.storeName || "本局"}</p>
            <h2 id="delete-checkout-title">刪除此局？</h2>
            <div className="sheet-detail-list">
              <div><p>參與者、公費、小姐對應、分帳資料與帳單紀錄都會一起刪除，且無法復原。</p></div>
            </div>
            <div className="confirm-actions">
              <button type="button" className="soft-button" onClick={() => setShowDeleteSheet(false)}>取消</button>
              <button type="button" className="danger-button" onClick={removeBill}>刪除</button>
            </div>
          </section>
        </div>
      )}
      <section className="card checkout-head">
        <div className="section-head">
          <div><p className="eyebrow">結帳</p><h1>補金額後分帳</h1></div>
          <Link href={`/bills/${bill.id}/live`} className="soft-link">回現場</Link>
        </div>
        <p className="quiet">現場已記的小姐會保留對應老闆，只補節數和金額即可。</p>
        <button type="button" className="soft-button ghost-row" onClick={() => setShowDeleteSheet(true)}>更多操作</button>
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
