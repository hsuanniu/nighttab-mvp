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
  const activeBill = bills.find((bill) => bill.stage === "open" || bill.stage === "live" || bill.stage === "checkout");

  return (
    <div className="page-stack">
      <section className="hero">
        <p className="eyebrow">開局</p>
        <h1>今晚這局</h1>
        <p className="hero-subtitle">先記人和小姐，結帳時再一次算清楚。</p>
        <Link href="/bills/new" className="primary-link large">開新局</Link>
      </section>
      {activeBill && (
        <Link href={billDestination(activeBill.id, activeBill.stage)} className="continue-card">
          <span>繼續上一局</span>
          <strong>{activeBill.storeName || "未填店名"}</strong>
          <em>{stageLabel(activeBill.stage)} · {shortDate(activeBill.date)}</em>
        </Link>
      )}
      <section className="stat-strip" aria-label="本月摘要">
        <article><span>本月</span><strong>{currency(monthSpend)}</strong></article>
        <article><span>常去</span><strong>{topLabel(bills.map((bill) => bill.storeName))}</strong></article>
        <article><span>常見</span><strong>{girlProfiles[0]?.name ?? "尚未記錄"}</strong></article>
      </section>
      <section className="card">
        <div className="section-head">
          <div><p className="eyebrow">最近</p><h2>最近幾局</h2></div>
          <Link href="/history" className="soft-link">看全部</Link>
        </div>
        {!ready && <p className="quiet">載入本機資料中。</p>}
        {ready && recent.length === 0 && <p className="quiet">先新增第一張帳單，歷史與妹名會自動整理。</p>}
        <div className="bill-list">
          {recent.map((bill) => (
            <Link className="bill-item" href={billDestination(bill.id, bill.stage)} key={bill.id}>
              <div><strong>{bill.storeName || "未填店名"}</strong><span>{stageLabel(bill.stage)} · {bill.participants.length} 人</span></div>
              <b>{currency(bill.settlementAmount || bill.totalAmount || bill.cashPrice)}</b>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
