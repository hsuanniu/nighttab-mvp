"use client";

import { useMemo, useState } from "react";
import type { Bill, GirlAssignment, GirlItem, Participant, SharedItem } from "@/types/nighttab";
import { calculateSplit, money, signedMoney } from "@/engines/splitEngine";
import {
  createGirlItem,
  createParticipant,
  createSharedItem,
  GIRL_ITEM_TYPES,
  SHARED_ITEM_NAMES,
  SHARED_ITEM_SHORTCUTS,
} from "@/modules/bills/billFactory";
import { createLineSplitText } from "@/modules/bills/lineShareText";
import { currency } from "@/modules/format";
import { useNightTab } from "@/store/NightTabProvider";

type BillEditorProps = {
  bill: Bill;
  setBill: (bill: Bill) => void;
  onSave: () => void;
  saveLabel?: string;
  showLineCopyAction?: boolean;
};

function positiveNumberValue(value: string) {
  return money(value);
}

function signedNumberValue(value: string) {
  return signedMoney(value);
}

export function BillEditor({
  bill,
  setBill,
  onSave,
  saveLabel = "儲存帳單",
  showLineCopyAction = false,
}: BillEditorProps) {
  const { commonParticipantNames, storageError } = useNightTab();
  const [copyStatus, setCopyStatus] = useState("");
  const [girlDraft, setGirlDraft] = useState<GirlItem>(() => createGirlItem(bill.storeName));
  const split = useMemo(() => calculateSplit(bill), [bill]);
  const totalDiff = split.itemsTotal - split.settlementTotal;
  const patch = (next: Partial<Bill>) => setBill({ ...bill, ...next });
  const updateParticipant = (id: string, next: Partial<Participant>) => {
    patch({
      participants: bill.participants.map((item) => (item.id === id ? { ...item, ...next } : item)),
      girlAssignments: (bill.girlAssignments ?? []).map((assignment) => (
        assignment.participantId === id && next.name !== undefined
          ? { ...assignment, participantName: next.name, updatedAt: new Date().toISOString() }
          : assignment
      )),
    });
  };
  const updateShared = (id: string, next: Partial<SharedItem>) => {
    patch({ sharedItems: bill.sharedItems.map((item) => (item.id === id ? { ...item, ...next } : item)) });
  };
  const updateGirl = (id: string, next: Partial<GirlItem>) => {
    patch({ girlItems: bill.girlItems.map((item) => (item.id === id ? { ...item, ...next } : item)) });
  };
  const updateAssignment = (id: string, next: Partial<GirlAssignment>) => {
    patch({
      girlAssignments: (bill.girlAssignments ?? []).map((assignment) => (
        assignment.id === id ? { ...assignment, ...next, updatedAt: new Date().toISOString() } : assignment
      )),
    });
  };
  const billParticipantNames = bill.participants.map((participant) => participant.name.trim()).filter(Boolean);
  const participantShortcuts = commonParticipantNames.filter((name) => !billParticipantNames.includes(name));
  const canAddGirlDraft = Boolean(girlDraft.girlName.trim() || girlDraft.amount);
  const assignmentMode = (bill.girlAssignments?.length ?? 0) > 0 || Boolean(bill.stage);

  const addParticipant = (name = `老闆 ${bill.participants.length + 1}`) => {
    if (billParticipantNames.includes(name.trim())) return;
    patch({ participants: [...bill.participants, createParticipant(name)] });
  };

  const addGirlDraft = () => {
    if (!canAddGirlDraft) return;
    patch({
      girlItems: [
        ...bill.girlItems,
        { ...girlDraft, girlName: girlDraft.girlName.trim(), storeName: bill.storeName },
      ],
    });
    setGirlDraft({
      ...createGirlItem(bill.storeName),
      type: girlDraft.type,
      assignedToParticipantId: girlDraft.assignedToParticipantId,
    });
  };

  const copyLineResult = async () => {
    try {
      await navigator.clipboard.writeText(createLineSplitText(bill));
      setCopyStatus("已複製，可直接貼到 LINE。");
    } catch {
      setCopyStatus("無法複製，請允許瀏覽器使用剪貼簿後再試。");
    }
  };

  return (
    <div className="editor-stack">
      <section className="card receipt-card">
        <div className="section-head">
          <div>
            <p className="eyebrow">帳單</p>
            <h2>輸入帳單資料</h2>
          </div>
        </div>
        <div className="field-grid">
          <label>店名<input value={bill.storeName} onChange={(event) => patch({ storeName: event.target.value })} placeholder="店名" /></label>
          <label>日期<input type="date" value={bill.date} onChange={(event) => patch({ date: event.target.value })} /></label>
          <label>現金價<input inputMode="numeric" value={bill.cashPrice || ""} onChange={(event) => patch({ cashPrice: positiveNumberValue(event.target.value) })} /></label>
          <label>刷卡價<input inputMode="numeric" value={bill.cardPrice || ""} onChange={(event) => patch({ cardPrice: positiveNumberValue(event.target.value) })} /></label>
          <label>帳單總額<input inputMode="numeric" value={bill.totalAmount || ""} onChange={(event) => patch({ totalAmount: positiveNumberValue(event.target.value) })} /></label>
          <label>分帳採用金額<input inputMode="numeric" value={bill.settlementAmount || ""} onChange={(event) => patch({ settlementAmount: positiveNumberValue(event.target.value) })} /></label>
        </div>
        <div className="segmented" role="group" aria-label="分帳採用金額類型">
          {(["cash", "card", "custom"] as const).map((mode) => (
            <button type="button" key={mode} className={bill.paymentMode === mode ? "active" : ""} onClick={() => patch({ paymentMode: mode })}>
              {mode === "cash" ? "現金" : mode === "card" ? "刷卡" : "自訂"}
            </button>
          ))}
        </div>
      </section>

      <section className="card">
        <div className="section-head">
          <div><p className="eyebrow">人</p><h2>參與者</h2></div>
          <button type="button" className="soft-button" onClick={() => addParticipant()}>新增</button>
        </div>
        {participantShortcuts.length > 0 && (
          <details className="inline-disclosure">
            <summary>常用參與者</summary>
            <div className="shortcut-row" aria-label="常用參與者">
              {participantShortcuts.map((name) => (
                <button type="button" key={name} onClick={() => addParticipant(name)}>+ {name}</button>
              ))}
            </div>
          </details>
        )}
        <div className="row-list">
          {bill.participants.map((participant) => (
            <div className="person-row" key={participant.id}>
              <input aria-label="參與者名稱" value={participant.name} onChange={(event) => updateParticipant(participant.id, { name: event.target.value })} />
              <label className="paid-toggle"><input type="checkbox" checked={participant.paid} onChange={(event) => updateParticipant(participant.id, { paid: event.target.checked })} />已付</label>
              {bill.participants.length > 1 && <button type="button" className="icon-button" aria-label="刪除參與者" onClick={() => patch({ participants: bill.participants.filter((item) => item.id !== participant.id) })}>×</button>}
            </div>
          ))}
        </div>
      </section>

      <section className="card">
        <div className="section-head">
          <div><p className="eyebrow">公費</p><h2>共同消費</h2></div>
          <button type="button" className="soft-button" onClick={() => patch({ sharedItems: [...bill.sharedItems, createSharedItem("其他")] })}>新增</button>
        </div>
        <details className="inline-disclosure">
          <summary>快捷項目</summary>
          <div className="shortcut-row" aria-label="公費快捷項目">
            {SHARED_ITEM_SHORTCUTS.map((name) => (
              <button type="button" key={name} onClick={() => patch({ sharedItems: [...bill.sharedItems, createSharedItem(name)] })}>+ {name}</button>
            ))}
          </div>
        </details>
        <div className="row-list">
          {bill.sharedItems.map((item) => (
            <div className="money-row" key={item.id}>
              <select aria-label="公費項目" value={item.name} onChange={(event) => updateShared(item.id, { name: event.target.value })}>
                {SHARED_ITEM_NAMES.map((name) => <option key={name}>{name}</option>)}
              </select>
              <input
                aria-label="公費金額"
                inputMode="decimal"
                value={item.amount || ""}
                onChange={(event) => updateShared(item.id, { amount: signedNumberValue(event.target.value) })}
                placeholder={item.name === "招待扣除" ? "可輸入負數" : "金額"}
              />
              <button type="button" className="icon-button" aria-label="刪除公費" onClick={() => patch({ sharedItems: bill.sharedItems.filter((entry) => entry.id !== item.id) })}>×</button>
            </div>
          ))}
        </div>
      </section>

      <section className="card">
        <div className="section-head">
          <div><p className="eyebrow">個人費</p><h2>{assignmentMode ? "現場小姐補金額" : "妹子項目"}</h2></div>
          {!assignmentMode && <button type="button" className="soft-button" disabled={!canAddGirlDraft} onClick={addGirlDraft}>加入下一筆</button>}
        </div>
        {assignmentMode ? (
          <>
            {(bill.girlAssignments ?? []).length === 0 && <p className="quiet">現場還沒有小姐紀錄，先回現場記誰坐誰，再回來補金額。</p>}
            <div className="girl-item-list">
              {(bill.girlAssignments ?? []).map((assignment) => (
                <article className="girl-item" key={assignment.id}>
                  <div className="field-grid compact">
                    <label>妹名<input value={assignment.girlName} onChange={(event) => updateAssignment(assignment.id, { girlName: event.target.value })} /></label>
                    <label>節數<input inputMode="numeric" value={assignment.sessions ?? ""} onChange={(event) => updateAssignment(assignment.id, { sessions: event.target.value ? positiveNumberValue(event.target.value) : null })} /></label>
                    <label>金額<input inputMode="numeric" value={assignment.amount ?? ""} onChange={(event) => updateAssignment(assignment.id, { amount: event.target.value ? positiveNumberValue(event.target.value) : null })} /></label>
                    <label>負擔人
                      <select
                        value={assignment.participantId}
                        onChange={(event) => {
                          const participant = bill.participants.find((person) => person.id === event.target.value);
                          updateAssignment(assignment.id, {
                            participantId: event.target.value,
                            participantName: participant?.name ?? "",
                          });
                        }}
                      >
                        <option value="">尚未指定</option>
                        {bill.participants.map((person) => <option value={person.id} key={person.id}>{person.name || "未命名"}</option>)}
                      </select>
                    </label>
                    <label className="full">備註<input value={assignment.notes} onChange={(event) => updateAssignment(assignment.id, { notes: event.target.value })} placeholder="可留空" /></label>
                  </div>
                  <button type="button" className="text-danger" onClick={() => patch({ girlAssignments: (bill.girlAssignments ?? []).filter((entry) => entry.id !== assignment.id) })}>刪除紀錄</button>
                </article>
              ))}
            </div>
          </>
        ) : (
          <>
            <article className="girl-item girl-draft">
              <div className="field-grid compact girl-fields">
                <label>妹名<input value={girlDraft.girlName} onChange={(event) => setGirlDraft({ ...girlDraft, girlName: event.target.value })} placeholder="名字" /></label>
                <label>節數<input inputMode="numeric" value={girlDraft.sessions || ""} onChange={(event) => setGirlDraft({ ...girlDraft, sessions: positiveNumberValue(event.target.value) })} /></label>
                <label>金額<input inputMode="numeric" value={girlDraft.amount || ""} onChange={(event) => setGirlDraft({ ...girlDraft, amount: positiveNumberValue(event.target.value) })} /></label>
                <label>負擔人
                  <select value={girlDraft.assignedToParticipantId} onChange={(event) => setGirlDraft({ ...girlDraft, assignedToParticipantId: event.target.value })}>
                    <option value="">尚未指定</option>
                    {bill.participants.map((person) => <option value={person.id} key={person.id}>{person.name || "未命名"}</option>)}
                  </select>
                </label>
                <label className="full">備註<input value={girlDraft.notes} onChange={(event) => setGirlDraft({ ...girlDraft, notes: event.target.value })} placeholder="可留空" /></label>
                <label className="full">類型<select value={girlDraft.type} onChange={(event) => setGirlDraft({ ...girlDraft, type: event.target.value })}>{GIRL_ITEM_TYPES.map((type) => <option key={type}>{type}</option>)}</select></label>
              </div>
              <button type="button" className="soft-button grow-button" disabled={!canAddGirlDraft} onClick={addGirlDraft}>加入並繼續輸入</button>
            </article>
            {bill.girlItems.length === 0 && <p className="quiet">還沒有妹子項目，有點檯或節數費再加。</p>}
            <div className="girl-item-list">
              {bill.girlItems.map((item) => (
                <article className="girl-item" key={item.id}>
                  <div className="field-grid compact">
                    <label>妹名<input value={item.girlName} onChange={(event) => updateGirl(item.id, { girlName: event.target.value })} placeholder="名字" /></label>
                    <label>節數<input inputMode="numeric" value={item.sessions || ""} onChange={(event) => updateGirl(item.id, { sessions: positiveNumberValue(event.target.value) })} /></label>
                    <label>金額<input inputMode="numeric" value={item.amount || ""} onChange={(event) => updateGirl(item.id, { amount: positiveNumberValue(event.target.value) })} /></label>
                    <label className="full">負擔人
                      <select value={item.assignedToParticipantId} onChange={(event) => updateGirl(item.id, { assignedToParticipantId: event.target.value })}>
                        <option value="">尚未指定</option>
                        {bill.participants.map((person) => <option value={person.id} key={person.id}>{person.name || "未命名"}</option>)}
                      </select>
                    </label>
                    <label className="full">備註<input value={item.notes} onChange={(event) => updateGirl(item.id, { notes: event.target.value })} placeholder="可留空" /></label>
                    <label className="full">類型<select value={item.type} onChange={(event) => updateGirl(item.id, { type: event.target.value })}>{GIRL_ITEM_TYPES.map((type) => <option key={type}>{type}</option>)}</select></label>
                  </div>
                  <button type="button" className="text-danger" onClick={() => patch({ girlItems: bill.girlItems.filter((entry) => entry.id !== item.id) })}>刪除項目</button>
                </article>
              ))}
            </div>
          </>
        )}
      </section>

      <section className="card split-card">
        <div className="section-head"><div><p className="eyebrow">分帳</p><h2>每人應付</h2></div><strong>{currency(split.itemsTotal)}</strong></div>
        <details className="inline-disclosure split-detail">
          <summary>費用拆解</summary>
          <div className="split-stats">
            <span>桌面費用 {currency(split.sharedTotal)}</span>
            <span>每人桌面費 {currency(split.sharedPerPerson)}</span>
            <span>個人費 {currency(split.personalItemsTotal)}</span>
          </div>
        </details>
        {split.settlementTotal > 0 && totalDiff < 0 && <p className="warning">總金額少 {currency(Math.abs(totalDiff))}，請確認是否還有項目未補。</p>}
        {split.settlementTotal > 0 && totalDiff > 0 && <p className="warning">總金額多 {currency(totalDiff)}，請確認是否還有項目未補。</p>}
        {split.unassignedGirlItems.length > 0 && <p className="warning">有 {split.unassignedGirlItems.length} 筆妹子項目尚未指定負擔人。</p>}
        <div className="split-rows">
          {split.rows.map((row) => (
            <article key={row.participant.id}>
              <strong>{row.participant.name || "未命名"}</strong>
              <span>桌面費 {currency(row.sharedAmount)} + 個人 {currency(row.personalAmount)}</span>
              <b>{currency(row.finalAmount)}</b>
            </article>
          ))}
        </div>
        {showLineCopyAction && <button type="button" className="soft-button line-copy" onClick={() => void copyLineResult()}>複製 LINE 分帳結果</button>}
        {copyStatus && <p className={copyStatus.startsWith("已複製") ? "success-note action-note" : "warning"}>{copyStatus}</p>}
      </section>

      <section className="card">
        <label>備註<textarea value={bill.notes} onChange={(event) => patch({ notes: event.target.value })} placeholder="特殊分法、誰先代墊、店內備註" /></label>
      </section>
      {storageError && <div className="warning">{storageError}</div>}
      <button type="button" className="save-bar" onClick={onSave}>{saveLabel}</button>
    </div>
  );
}
