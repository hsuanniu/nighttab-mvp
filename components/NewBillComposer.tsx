"use client";

import { useState } from "react";
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
  const participantNames = bill.participants.map((participant) => participant.name.trim()).filter(Boolean);
  const shortcuts = commonParticipantNames.filter((name) => !participantNames.includes(name));
  const addParticipant = (name = `老闆 ${bill.participants.length + 1}`) => {
    if (participantNames.includes(name.trim())) return;
    setBill({ ...bill, participants: [...bill.participants, createParticipant(name)] });
    setStatus(`已新增參與者 ${name}。`);
  };
  const start = (destination: "live" | "checkout") => {
    const next = { ...bill, stage: destination };
    saveBill(next);
    router.push(`/bills/${bill.id}/${destination}`);
  };

  return (
    <div className="page-stack">
      {status && <div className="success-note action-note">{status}</div>}
      <section className="hero session-hero">
        <p className="eyebrow">開局</p>
        <h1>先記人數</h1>
        <p className="hero-subtitle">晚點再補金額</p>
      </section>
      <section className="card">
        <div className="section-head"><div><p className="eyebrow">本局</p><h2>基本資料</h2></div></div>
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
          <div className="shortcut-row" aria-label="常用參與者">
            {shortcuts.map((name) => <button type="button" key={name} onClick={() => addParticipant(name)}>+ {name}</button>)}
          </div>
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
      <div className="session-actions">
        <button type="button" className="primary-link live-action" onClick={() => start("live")}>開始現場記錄</button>
        <button type="button" className="soft-button" onClick={() => start("checkout")}>直接進結帳</button>
      </div>
    </div>
  );
}
