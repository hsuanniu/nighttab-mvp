"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useNightTab } from "@/store/NightTabProvider";
import { currency, shortDate } from "@/modules/format";
import { calculateSplit } from "@/engines/splitEngine";
import type { Bill } from "@/types/nighttab";

export function HistoryView() {
  const { bills, deleteBill, ready } = useNightTab();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const matches = useMemo(() => bills.filter((bill) => {
    const text = `${bill.storeName} ${bill.date}`.toLocaleLowerCase();
    return text.includes(query.trim().toLocaleLowerCase());
  }), [bills, query]);

  return (
    <div className="page-stack">
      {status && <div className="success-note action-note">{status}</div>}
      {selectedBill && (
        <div className="sheet-overlay" role="presentation" onClick={() => setSelectedBill(null)}>
          <section className="confirm-sheet detail-sheet" role="dialog" aria-modal="true" aria-labelledby="history-detail-title" onClick={(event) => event.stopPropagation()}>
            <div className="sheet-handle" />
            <p className="eyebrow">{shortDate(selectedBill.date)}</p>
            <h2 id="history-detail-title">{selectedBill.storeName || "未填店名"}</h2>
            <div className="sheet-summary">
              <span>{selectedBill.participants.length} 人</span>
              <span>{(selectedBill.girlAssignments ?? []).length || selectedBill.girlItems.length} 筆小姐紀錄</span>
              <strong>{currency(calculateSplit(selectedBill).settlementTotal || calculateSplit(selectedBill).itemsTotal)}</strong>
            </div>
            <div className="sheet-detail-list">
              <div>
                <span>參與者</span>
                <p>{selectedBill.participants.map((person) => person.name).filter(Boolean).join("、") || "未填參與者"}</p>
              </div>
              {((selectedBill.girlAssignments ?? []).length > 0 || selectedBill.girlItems.length > 0) && (
                <div>
                  <span>小姐紀錄</span>
                  <p>{(selectedBill.girlAssignments ?? []).map((assignment) => `${assignment.girlName || "未填小姐"} → ${assignment.participantName || "未指定"}`).join("、") || selectedBill.girlItems.map((item) => item.girlName || "未填小姐").join("、")}</p>
                </div>
              )}
            </div>
            <div className="confirm-actions vertical">
              <Link
                href={selectedBill.stage === "open" || selectedBill.stage === "live" ? `/bills/${selectedBill.id}/live` : `/bills/${selectedBill.id}/checkout`}
                className="primary-link"
              >
                打開這局
              </Link>
              <button type="button" className="danger-button" onClick={() => {
                deleteBill(selectedBill.id);
                setStatus("已刪除這筆歷史紀錄。");
                setSelectedBill(null);
              }}>
                刪除此局
              </button>
            </div>
          </section>
        </div>
      )}
      <section className="card">
        <div className="section-head"><div><p className="eyebrow">歷史</p><h1>過去的局</h1></div></div>
        <label className="search-field">搜尋<input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="日期或店名" /></label>
      </section>
      {!ready && <section className="card"><p className="quiet">讀取本機資料中。</p></section>}
      {ready && matches.length === 0 && <section className="card"><p className="quiet">目前沒有符合的帳單。</p></section>}
      {matches.map((bill) => {
        const split = calculateSplit(bill);
        const assignments = bill.girlAssignments ?? [];
        return (
          <article className="card history-row" key={bill.id}>
            <button type="button" className="history-card history-link" onClick={() => setSelectedBill(bill)}>
              <div>
                <p>{shortDate(bill.date)}</p>
                <h2>{bill.storeName || "未填店名"}</h2>
                <span>{bill.participants.length} 人 · {(assignments.length || bill.girlItems.length)} 筆小姐紀錄</span>
              </div>
              <div className="history-money">
                <strong>{currency(split.settlementTotal || split.itemsTotal)}</strong>
                <span>更多</span>
              </div>
            </button>
          </article>
        );
      })}
    </div>
  );
}
