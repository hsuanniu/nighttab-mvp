"use client";

import { useEffect, useState } from "react";
import { useNightTab } from "@/store/NightTabProvider";
import { makeId } from "@/modules/bills/billFactory";
import { currency, shortDate } from "@/modules/format";
import { createGirlKey } from "@/utils/createGirlKey";
import type { GirlProfile } from "@/types/nighttab";

const TAGS = ["會喝", "會聊天", "氣氛好", "雷", "朋友喜歡"];
type PendingGirlAction = { type: "hide" | "clearFile" | "deleteRecords"; profile: GirlProfile } | null;
type UndoToast = { message: string; restoreKey?: string } | null;

function GirlCard({ profile, onRequestAction }: { profile: GirlProfile; onRequestAction: (action: NonNullable<PendingGirlAction>) => void }) {
  const { saveGirlProfile } = useNightTab();
  const [notes, setNotes] = useState(profile.notes);
  const toggleTag = (tag: string) => {
    const tags = profile.tags.includes(tag) ? profile.tags.filter((item) => item !== tag) : [...profile.tags, tag];
    saveGirlProfile({ ...profile, tags, notes });
  };
  return (
    <article className="card girl-profile">
      <div className="section-head">
        <div><p>{profile.storeName || "未填店名"}</p><h2>{profile.name}</h2></div>
        <strong>{currency(profile.totalAmount)}</strong>
      </div>
      <div className="profile-stats">
        <span>{profile.visitCount} 次</span>
        <span>{profile.totalSessions} 節</span>
        <span>最近 {shortDate(profile.lastSeenDate)}</span>
        {profile.recentParticipantName && <span>最近對應 {profile.recentParticipantName}</span>}
      </div>
      <div className="tag-row">
        {TAGS.map((tag) => <button type="button" className={profile.tags.includes(tag) ? "active" : ""} key={tag} onClick={() => toggleTag(tag)}>{tag}</button>)}
      </div>
      <label>備註<textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="下次提醒" /></label>
      <div className="profile-actions">
        <button type="button" className="soft-button" onClick={() => saveGirlProfile({ ...profile, notes })}>儲存備註</button>
        <button
          type="button"
          className="danger-button"
          onClick={() => onRequestAction({ type: "hide", profile })}
        >
          隱藏
        </button>
        <button
          type="button"
          className="danger-button"
          onClick={() => onRequestAction({ type: "clearFile", profile })}
        >
          清除檔案
        </button>
        <button
          type="button"
          className="danger-button"
          onClick={() => onRequestAction({ type: "deleteRecords", profile })}
        >
          永久刪除紀錄
        </button>
      </div>
    </article>
  );
}

export function GirlDirectory() {
  const {
    girlProfiles,
    hiddenGirlKeys,
    addGirlProfile,
    deleteGirlProfileFile,
    deleteGirlRecords,
    hideGirlProfile,
    restoreGirlProfile,
  } = useNightTab();
  const [name, setName] = useState("");
  const [storeName, setStoreName] = useState("");
  const [showHidden, setShowHidden] = useState(false);
  const [status, setStatus] = useState("");
  const [undoToast, setUndoToast] = useState<UndoToast>(null);
  const [pendingAction, setPendingAction] = useState<PendingGirlAction>(null);
  useEffect(() => {
    if (!undoToast) return;
    const timer = window.setTimeout(() => setUndoToast(null), 5000);
    return () => window.clearTimeout(timer);
  }, [undoToast]);
  const addManual = () => {
    if (!name.trim()) return;
    addGirlProfile({
      id: makeId("girl-profile"),
      name: name.trim(),
      storeName: storeName.trim(),
      tags: [],
      notes: "",
      visitCount: 0,
      totalSessions: 0,
      totalAmount: 0,
      lastSeenDate: "",
      recentParticipantName: "",
      participantNames: [],
    });
    setName("");
    setStoreName("");
    setStatus("已新增妹名資料。");
  };
  const confirmPendingAction = () => {
    if (!pendingAction) return;
    if (pendingAction.type === "hide") {
      const key = createGirlKey(pendingAction.profile.name, pendingAction.profile.storeName);
      hideGirlProfile(pendingAction.profile);
      setStatus("");
      setUndoToast({ message: `已隱藏 ${pendingAction.profile.name}`, restoreKey: key });
    } else if (pendingAction.type === "clearFile") {
      deleteGirlProfileFile(pendingAction.profile);
      setStatus(`已清除 ${pendingAction.profile.name} 的妹名檔案。`);
    } else {
      deleteGirlRecords(pendingAction.profile);
      setStatus(`已永久刪除 ${pendingAction.profile.name} 的小姐紀錄。`);
    }
    setPendingAction(null);
  };
  const pendingTitle = pendingAction?.type === "hide"
    ? "確定隱藏這位小姐？"
    : pendingAction?.type === "clearFile"
      ? "清除妹名檔案"
      : "永久刪除小姐紀錄";
  const pendingItems = pendingAction?.type === "hide"
    ? ["隱藏後不會出現在妹名記錄", "歷史帳單與分帳紀錄仍會保留", "未來若有新紀錄，仍可再次出現"]
    : pendingAction?.type === "clearFile"
      ? ["手動備註、標籤與手動建立資料會移除", "歷史帳單與分帳紀錄會保留", "若歷史仍有這位小姐，她會重新以空白檔案出現"]
      : ["同店同名的現場對應與歷史小姐項目會移除", "相關金額會移除，分帳結果可能改變", "這個操作無法復原"];

  return (
    <div className="page-stack">
      {status && <div className="success-note action-note">{status}</div>}
      {pendingAction && (
        <div className="sheet-overlay" role="presentation" onClick={() => setPendingAction(null)}>
          <section className="confirm-sheet" role="dialog" aria-modal="true" aria-labelledby="girl-confirm-title" onClick={(event) => event.stopPropagation()}>
            <div className="sheet-handle" />
            <p className="eyebrow">{pendingAction.profile.storeName || "未填店名"}</p>
            <h2 id="girl-confirm-title">{pendingTitle}</h2>
            <strong>{pendingAction.profile.name}</strong>
            <ul>
              {pendingItems.map((item) => <li key={item}>{item}</li>)}
            </ul>
            <div className="confirm-actions">
              <button type="button" className="soft-button" onClick={() => setPendingAction(null)}>取消</button>
              <button type="button" className="danger-button" onClick={confirmPendingAction}>
                確認{pendingAction.type === "hide" ? "隱藏" : pendingAction.type === "clearFile" ? "清除" : "永久刪除"}
              </button>
            </div>
          </section>
        </div>
      )}
      {undoToast && (
        <div className="undo-toast" role="status">
          <span>{undoToast.message}</span>
          {undoToast.restoreKey && (
            <button type="button" onClick={() => {
              restoreGirlProfile(undoToast.restoreKey ?? "");
              setUndoToast(null);
              setStatus("已復原隱藏。");
            }}>復原</button>
          )}
        </div>
      )}
      <section className="card">
        <div className="section-head">
          <div><p className="eyebrow">妹名</p><h1>出現過的名字</h1></div>
          <button type="button" className="soft-button" onClick={() => setShowHidden((current) => !current)}>
            {showHidden ? "關閉管理" : "管理已隱藏"}
          </button>
        </div>
        <div className="field-grid manual-add">
          <label>手動新增名字<input value={name} onChange={(event) => setName(event.target.value)} /></label>
          <label>店名<input value={storeName} onChange={(event) => setStoreName(event.target.value)} /></label>
        </div>
        <button type="button" className="soft-button" onClick={addManual}>新增</button>
      </section>
      {showHidden && (
        <section className="card">
          <div className="section-head"><div><p className="eyebrow">已隱藏</p><h2>恢復顯示</h2></div></div>
          {hiddenGirlKeys.length === 0 && <p className="quiet">目前沒有已隱藏的妹名。</p>}
          <div className="hidden-girl-list">
            {hiddenGirlKeys.map((key) => {
              const [storeName, girlName] = key.split("::");
              return (
              <article className="hidden-girl-row" key={key}>
                <div>
                  <strong>{girlName || "未填妹名"}</strong>
                  <span>{storeName || "未填店名"}</span>
                </div>
                <button type="button" className="soft-button" onClick={() => {
                  restoreGirlProfile(key);
                  setStatus(`已恢復 ${girlName || "這筆妹名"}。`);
                }}>恢復顯示</button>
              </article>
            );
            })}
          </div>
        </section>
      )}
      {girlProfiles.length === 0 && <section className="card"><p className="quiet">帳單出現妹名後，這裡會自動整理節數和金額。</p></section>}
      {girlProfiles.map((profile) => <GirlCard profile={profile} key={profile.id} onRequestAction={setPendingAction} />)}
    </div>
  );
}
