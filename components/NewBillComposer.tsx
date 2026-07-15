"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createBill, createParticipant } from "@/modules/bills/billFactory";
import { useNightTab } from "@/store/NightTabProvider";
import type { Bill, Participant } from "@/types/nighttab";

function updateParticipant(bill: Bill, id: string, next: Partial<Participant>) {
  return {
    ...bill,
    participants: bill.participants.map((participant) => (
      participant.id === id ? { ...participant, ...next } : participant
    )),
  };
}

export function NewBillComposer() {
  const router = useRouter();
  const { commonParticipantNames, saveBill } = useNightTab();
  const [bill, setBill] = useState(createBill);
  const [status, setStatus] = useState("");
  const [showStartSheet, setShowStartSheet] = useState(false);
  const [startingDestination, setStartingDestination] = useState<"live" | "checkout" | null>(null);
  const participantNames = bill.participants.map((participant) => participant.name.trim()).filter(Boolean);
  const shortcuts = commonParticipantNames.filter((name) => !participantNames.includes(name));
  const addParticipant = (name = `老闆 ${bill.participants.length + 1}`) => {
    if (participantNames.includes(name.trim())) return;
    setBill({ ...bill, participants: [...bill.participants, createParticipant(name)] });
    setStatus(`已新增參與者 ${name}。`);
  };
  const start = (destination: "live" | "checkout") => {
    console.log(destination === "live" ? "Start record clicked" : "Checkout directly clicked");
    if (startingDestination) return;
    setStartingDestination(destination);
    try {
      const next = { ...bill, stage: destination };
      saveBill(next);
      setShowStartSheet(false);
      router.push(`/bills/${bill.id}/${destination}`);
    } finally {
      setStartingDestination(null);
    }
  };

  return (
    <div className="page-stack">
      {status && <div className="success-note action-note">{status}</div>}
      {showStartSheet && (
        <div className="sheet-overlay" role="presentation" onClick={() => setShowStartSheet(false)}>
          <section className="confirm-sheet" role="dialog" aria-modal="true" aria-labelledby="start-sheet-title" onClick={(event) => event.stopPropagation()}>
            <div className="sheet-handle" />
            <p className="eyebrow">{bill.storeName || "新的一局"}</p>
            <h2 id="start-sheet-title">選擇接下來怎麼記</h2>
            <div className="sheet-detail-list">
              <div>
                <span>建議</span>
                <p>現場先記誰坐誰，結帳時再補節數與金額。</p>
              </div>
            </div>
            <div className="confirm-actions vertical">
              <button
                type="button"
                className="primary-link"
                disabled={startingDestination !== null}
                aria-busy={startingDestination === "live"}
                onClick={() => start("live")}
              >
                {startingDestination === "live" ? "前往現場記錄..." : "開始現場記錄"}
              </button>
              <button
                type="button"
                className="soft-button"
                disabled={startingDestination !== null}
                aria-busy={startingDestination === "checkout"}
                onClick={() => start("checkout")}
              >
                {startingDestination === "checkout" ? "前往結帳..." : "直接進結帳"}
              </button>
            </div>
          </section>
        </div>
      )}
      <section className="hero session-hero">
        <p className="eyebrow">開局</p>
        <h1>先把這局建起來。</h1>
        <p className="hero-subtitle">店名、人數、備註先放好，現場就不會亂。</p>
      </section>
      <section className="card">
        <div className="section-head">
          <div><p className="eyebrow">本局</p><h2>基本資料</h2></div>
          <Link href="/" className="soft-link">返回</Link>
        </div>
        <div className="field-grid">
          <label>店名<input value={bill.storeName} onChange={(event) => setBill({ ...bill, storeName: event.target.value })} placeholder="店名" /></label>
          <label>日期<input type="date" value={bill.date} onChange={(event) => setBill({ ...bill, date: event.target.value })} /></label>
          <label className="full">備註<textarea value={bill.notes} onChange={(event) => setBill({ ...bill, notes: event.target.value })} placeholder="現場備註，可稍後再補" /></label>
        </div>
      </section>
      <section className="card">
        <div className="section-head">
          <div><p className="eyebrow">人</p><h2>參與者</h2></div>
          <button type="button" className="soft-button" onClick={() => addParticipant()}>新增</button>
        </div>
        {shortcuts.length > 0 && (
          <details className="inline-disclosure">
            <summary>常用參與者</summary>
            <div className="shortcut-row" aria-label="常用參與者">
              {shortcuts.map((name) => <button type="button" key={name} onClick={() => addParticipant(name)}>+ {name}</button>)}
            </div>
          </details>
        )}
        <div className="row-list">
          {bill.participants.map((participant) => (
            <div className="person-row" key={participant.id}>
              <input aria-label="參與者名稱" value={participant.name} onChange={(event) => setBill(updateParticipant(bill, participant.id, { name: event.target.value }))} />
              <label className="paid-toggle"><input type="checkbox" checked={participant.paid} onChange={(event) => setBill(updateParticipant(bill, participant.id, { paid: event.target.checked }))} />已付</label>
              {bill.participants.length > 1 && <button type="button" className="icon-button" aria-label="刪除參與者" onClick={() => {
                setBill({ ...bill, participants: bill.participants.filter((item) => item.id !== participant.id) });
                setStatus(`已刪除參與者 ${participant.name || "未命名"}。`);
              }}>×</button>}
            </div>
          ))}
        </div>
      </section>
      <button
        type="button"
        className="primary-link live-action sticky-action"
        onClick={() => {
          console.log("Open start sheet clicked");
          setShowStartSheet(true);
        }}
      >
        開始
      </button>
    </div>
  );
}
