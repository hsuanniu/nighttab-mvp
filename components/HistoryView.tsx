"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useNightTab } from "@/store/NightTabProvider";
import { currency, shortDate } from "@/modules/format";
import { calculateSplit } from "@/engines/splitEngine";

export function HistoryView() {
  const { bills, deleteBill, ready } = useNightTab();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const matches = useMemo(() => bills.filter((bill) => {
    const text = `${bill.storeName} ${bill.date}`.toLocaleLowerCase();
    return text.includes(query.trim().toLocaleLowerCase());
  }), [bills, query]);

  return (
    <div className="page-stack">
      {status && <div className="success-note action-note">{status}</div>}
      <section className="card">
        <div className="section-head"><div><p className="eyebrow">歷史</p><h1>過去所有局</h1></div></div>
        <label>搜尋日期或店名<input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="2026-05 或 店名" /></label>
      </section>
      {!ready && <section className="card"><p className="quiet">讀取本機資料中。</p></section>}
      {ready && matches.length === 0 && <section className="card"><p className="quiet">目前沒有符合的帳單。</p></section>}
      {matches.map((bill) => {
        const split = calculateSplit(bill);
        const assignments = bill.girlAssignments ?? [];
        const destination = bill.stage === "open" || bill.stage === "live"
          ? `/bills/${bill.id}/live`
          : `/bills/${bill.id}/checkout`;
        const assignmentText = assignments
          .map((assignment) => `${assignment.girlName || "未填小姐"} → ${assignment.participantName || "未指定"}`)
          .join("、");
        return (
          <article className="card history-row" key={bill.id}>
            <Link href={destination} className="history-card history-link">
              <div>
                <p>{shortDate(bill.date)}</p>
                <h2>{bill.storeName || "未填店名"}</h2>
                <span>{bill.participants.map((person) => person.name).filter(Boolean).join("、") || "未填參與者"}</span>
                {assignmentText && <span className="history-assignments">{assignmentText}</span>}
              </div>
              <div className="history-money">
                <strong>{currency(split.settlementTotal || split.itemsTotal)}</strong>
                <span>{assignments.length || bill.girlItems.length} 筆小姐紀錄</span>
              </div>
            </Link>
            <button
              type="button"
              className="danger-button history-delete"
              onClick={() => {
                if (!window.confirm("確定要刪除這筆歷史紀錄嗎？\n\n此局的參與者、公費、小姐對應、分帳資料與帳單紀錄都會一起刪除，且無法復原。")) return;
                deleteBill(bill.id);
                setStatus("已刪除這筆歷史紀錄。");
              }}
            >
              刪除
            </button>
          </article>
        );
      })}
    </div>
  );
}
