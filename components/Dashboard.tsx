"use client";

import Link from "next/link";
import { useNightTab } from "@/store/NightTabProvider";
import { currency, shortDate } from "@/modules/format";

function topLabel(values: string[]) {
  const counts = new Map<string, number>();
  values.filter(Boolean).forEach((value) => counts.set(value, (counts.get(value) ?? 0) + 1));
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "尚未累積";
}

function billDestination(id: string, stage?: string) {
  return stage === "open" || stage === "live" ? `/bills/${id}/live` : `/bills/${id}/checkout`;
}

function stageLabel(stage?: string) {
  if (stage === "open" || stage === "live") return "現場中";
  if (stage === "checkout") return "待結帳";
  return "已分帳";
}

export function Dashboard() {
  const { bills, girlProfiles, ready } = useNightTab();
  const monthPrefix = new Date().toISOString().slice(0, 7);
  const thisMonth = bills.filter((bill) => bill.date.startsWith(monthPrefix));
  const monthSpend = thisMonth.reduce((sum, bill) => sum + (bill.settlementAmount || bill.totalAmount || bill.cashPrice), 0);
  const recent = bills.slice(0, 3);

  return (
    <div className="page-stack">
      <section className="hero">
        <p className="eyebrow">夜帳 NightTab</p>
        <h1>先開局</h1>
        <p className="hero-subtitle">乾淨分帳 不傷感情</p>
        <Link href="/bills/new" className="primary-link large">新增 / 開局</Link>
      </section>
      <section className="stat-grid">
        <article className="card stat"><span>本月總消費</span><strong>{currency(monthSpend)}</strong></article>
        <article className="card stat"><span>常去店家</span><strong>{topLabel(bills.map((bill) => bill.storeName))}</strong></article>
        <article className="card stat"><span>常見妹名</span><strong>{girlProfiles[0]?.name ?? "尚未記錄"}</strong></article>
      </section>
      <section className="card">
        <div className="section-head">
          <div><p className="eyebrow">最近</p><h2>最近幾場局</h2></div>
          <Link href="/history" className="soft-link">看全部</Link>
        </div>
        {!ready && <p className="quiet">載入本機資料中。</p>}
        {ready && recent.length === 0 && <p className="quiet">先新增第一張帳單，歷史與妹名會自動整理。</p>}
        <div className="bill-list">
          {recent.map((bill) => (
            <Link className="bill-item" href={billDestination(bill.id, bill.stage)} key={bill.id}>
              <div><strong>{bill.storeName || "未填店名"}</strong><span>{shortDate(bill.date)} · {bill.participants.length} 人 · {stageLabel(bill.stage)}</span></div>
              <b>{currency(bill.settlementAmount || bill.totalAmount || bill.cashPrice)}</b>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
