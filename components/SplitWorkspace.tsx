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
  const [showDeleteSheet, setShowDeleteSheet] = useState(false);

  useEffect(() => {
    if (stored) setBill(stored);
  }, [stored]);

  if (!ready) return <section className="card"><p className="quiet">讀取帳單中。</p></section>;
  if (!bill) return <section className="card"><h1>找不到帳單</h1><Link href="/history" className="soft-link">回歷史</Link></section>;
  const removeBill = () => {
    deleteBill(bill.id);
    router.push("/history");
  };

  return (
    <div className="page-stack">
      {showDeleteSheet && (
        <div className="sheet-overlay" role="presentation" onClick={() => setShowDeleteSheet(false)}>
          <section className="confirm-sheet" role="dialog" aria-modal="true" aria-labelledby="delete-split-title" onClick={(event) => event.stopPropagation()}>
            <div className="sheet-handle" />
            <p className="eyebrow">{bill.storeName || "本局"}</p>
            <h2 id="delete-split-title">刪除此局？</h2>
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
      {saved && <div className="success-note">分帳已儲存到本機。</div>}
      <button type="button" className="soft-button ghost-row" onClick={() => setShowDeleteSheet(true)}>更多操作</button>
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
