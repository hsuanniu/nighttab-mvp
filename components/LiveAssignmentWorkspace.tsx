"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createGirlAssignment, createParticipant } from "@/modules/bills/billFactory";
import { useNightTab } from "@/store/NightTabProvider";
import type { Bill, GirlAssignment, Participant } from "@/types/nighttab";

function assignmentPatch(assignments: GirlAssignment[], id: string, next: Partial<GirlAssignment>) {
  return assignments.map((assignment) => (
    assignment.id === id ? { ...assignment, ...next, updatedAt: new Date().toISOString() } : assignment
  ));
}

export function LiveAssignmentWorkspace({ billId }: { billId: string }) {
  const router = useRouter();
  const { deleteBill, findBill, ready, saveBill } = useNightTab();
  const stored = findBill(billId);
  const [bill, setBill] = useState<Bill | null>(stored ?? null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);
  const [status, setStatus] = useState("");
  const [showDeleteSheet, setShowDeleteSheet] = useState(false);

  useEffect(() => {
    if (stored) setBill(stored);
  }, [stored]);

  if (!ready) return <section className="card"><p className="quiet">讀取本局資料中。</p></section>;
  if (!bill) return <section className="card"><h1>找不到這場局</h1><Link href="/history" className="soft-link">回歷史</Link></section>;

  const commit = (next: Bill, message = "現場紀錄已保存。") => {
    setBill(next);
    saveBill(next);
    setSaved(true);
    setStatus(message);
  };
  const addAssignment = (participant: Participant) => {
    console.log("Add girl assignment clicked");
    const girlName = drafts[participant.id]?.trim();
    if (!girlName) return;
    commit({
      ...bill,
      stage: "live",
      girlAssignments: [...(bill.girlAssignments ?? []), createGirlAssignment({
        girlName,
        participant,
        storeName: bill.storeName,
        date: bill.date,
      })],
    }, `已新增小姐 ${girlName}。`);
    setDrafts({ ...drafts, [participant.id]: "" });
  };
  const addLateParticipant = () => {
    console.log("Add late participant clicked");
    const name = `老闆 ${bill.participants.length + 1}`;
    commit({
      ...bill,
      participants: [...bill.participants, createParticipant(name)],
    }, `已新增參與者 ${name}。`);
  };
  const removeBill = () => {
    deleteBill(bill.id);
    router.push("/history");
  };

  return (
    <div className="page-stack">
      {showDeleteSheet && (
        <div className="sheet-overlay" role="presentation" onClick={() => setShowDeleteSheet(false)}>
          <section className="confirm-sheet" role="dialog" aria-modal="true" aria-labelledby="delete-live-title" onClick={(event) => event.stopPropagation()}>
            <div className="sheet-handle" />
            <p className="eyebrow">{bill.storeName || "本局"}</p>
            <h2 id="delete-live-title">刪除此局？</h2>
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
      <section className="hero live-hero">
        <p className="eyebrow">現場記錄</p>
        <h1>{bill.storeName || "本局"} 誰坐誰</h1>
        <p className="quiet">{bill.date} · 金額和節數結帳再補。</p>
      </section>
      {saved && <div className="success-note action-note">{status || "現場紀錄已保存。"}</div>}
      <section className="card">
        <div className="section-head">
          <div><p className="eyebrow">參與者</p><h2>點卡片就記小姐</h2></div>
          <button type="button" className="soft-button" onClick={addLateParticipant}>後來加入</button>
        </div>
        <div className="live-grid">
          {bill.participants.map((participant) => {
            const assignments = (bill.girlAssignments ?? []).filter((assignment) => assignment.participantId === participant.id);
            return (
              <article className="live-person" key={participant.id}>
                <input
                  aria-label={`${participant.name || "未命名"}名稱`}
                  value={participant.name}
                  onChange={(event) => commit({
                    ...bill,
                    participants: bill.participants.map((item) => item.id === participant.id ? { ...item, name: event.target.value } : item),
                    girlAssignments: (bill.girlAssignments ?? []).map((assignment) => assignment.participantId === participant.id
                      ? { ...assignment, participantName: event.target.value, updatedAt: new Date().toISOString() }
                      : assignment),
                  })}
                />
                <div className="assignment-chips">
                  {assignments.length === 0 && <span>還沒記小姐</span>}
                  {assignments.map((assignment) => (
                    <label className="assignment-row" key={assignment.id}>
                      <input value={assignment.girlName} onChange={(event) => commit({ ...bill, girlAssignments: assignmentPatch(bill.girlAssignments ?? [], assignment.id, { girlName: event.target.value }) })} />
                      <button type="button" className="icon-button" aria-label="刪除小姐紀錄" onClick={() => commit({ ...bill, girlAssignments: (bill.girlAssignments ?? []).filter((item) => item.id !== assignment.id) }, `已刪除小姐 ${assignment.girlName || "未命名"}。`)}>×</button>
                    </label>
                  ))}
                </div>
                <div className="live-add">
                  <input aria-label={`${participant.name || "未命名"}新增小姐`} value={drafts[participant.id] ?? ""} onChange={(event) => setDrafts({ ...drafts, [participant.id]: event.target.value })} placeholder="小姐名字" />
                  <button type="button" className="primary-link" onClick={() => addAssignment(participant)}>+ 新增小姐</button>
                </div>
              </article>
            );
          })}
        </div>
      </section>
      <button type="button" className="soft-button ghost-row" onClick={() => setShowDeleteSheet(true)}>更多操作</button>
      <Link className="primary-link checkout-link" href={`/bills/${bill.id}/checkout`} onClick={() => console.log("Checkout link clicked")}>結帳補金額</Link>
    </div>
  );
}
