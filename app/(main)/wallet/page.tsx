"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

type Transaction = {
  id: number;
  amount: string;
  type: "deposit" | "withdraw" | "entry_fee" | "prize" | "refund" | "adjustment";
  description: string;
  created_at: string;
};

type Wallet = { balance: string; currency: string };
type Stats = { lifetime_winnings: string; total_deposits: string; total_payouts: string };

const FILTERS = ["All", "prize", "deposit", "withdraw", "entry_fee"] as const;
type Filter = (typeof FILTERS)[number];

function fmt(amount: string | number, currency = "NPR") {
  return `${currency} ${Number(amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
}

function relativeDate(iso: string) {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export default function WalletPage() {
  const router = useRouter();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [locked, setLocked] = useState("0");
  const [filter, setFilter] = useState<Filter>("All");
  const [loading, setLoading] = useState(true);

  // Modal state
  const [modal, setModal] = useState<"deposit" | "withdraw" | null>(null);
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const loadWallet = useCallback(async () => {
    const res = await fetch("/api/wallet");
    if (res.status === 401) { router.push("/login"); return; }
    const data = await res.json();
    setWallet(data.wallet);
    setTransactions(data.transactions);
    setStats(data.stats);
    setLocked(data.locked ?? "0");
    setLoading(false);
  }, [router]);

  useEffect(() => {
    loadWallet();
  }, [loadWallet]);

  async function handleSubmit() {
    setError("");
    const val = Number(amount);
    if (!val || val <= 0) { setError("Enter a valid amount"); return; }
    setSubmitting(true);
    const res = await fetch(`/api/wallet/${modal}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: val }),
    });
    const data = await res.json();
    setModal(null);
    setAmount("");
    setSubmitting(false);
    // Reload wallet data
    const walletRes = await fetch("/api/wallet");
    if (walletRes.status === 401) { router.push("/login"); return; }
    const walletData = await walletRes.json();
    setTransactions(walletData.transactions);
    setStats(walletData.stats);
    setLocked(walletData.locked ?? "0");
    await loadWallet();
    void loadWallet();
  }

  const filtered = filter === "All" ? transactions : transactions.filter((t) => t.type === filter);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050509] flex items-center justify-center">
        <p className="text-gray-500 text-sm animate-pulse">Loading wallet…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050509] text-gray-100">
      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-4">
          <div className="bg-[#0b0b11] border border-gray-800 rounded-xl p-6 w-full max-w-sm space-y-4">
            <h2 className="text-sm font-medium text-gray-200 capitalize">{modal} funds</h2>
            <input
              type="number"
              placeholder="Amount (NPR)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-[#050509] border border-gray-700 rounded-md px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-purple-500"
            />
            {error && <p className="text-xs text-red-400">{error}</p>}
            <div className="flex gap-3">
              <button
                onClick={() => { setModal(null); setAmount(""); setError(""); }}
                className="flex-1 rounded-md border border-gray-700 text-xs py-2 text-gray-300 hover:bg-[#11111a] transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 rounded-md bg-purple-600/90 hover:bg-purple-500 text-xs py-2 text-white transition disabled:opacity-50"
              >
                {submitting ? "Processing…" : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="px-4 py-8 md:px-8 md:py-10">
        <div className="max-w-4xl mx-auto space-y-8">
          <header className="space-y-1">
            <p className="text-xs uppercase tracking-wide text-purple-400">Wallet</p>
            <h1 className="text-2xl md:text-3xl font-semibold">Your wallet</h1>
            <p className="text-sm text-gray-400">Track winnings, deposits and withdrawals.</p>
          </header>

          {/* Summary */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="rounded-lg border border-gray-800 bg-[#0b0b11] px-4 py-3">
              <p className="text-[11px] text-gray-400 mb-1">Lifetime winnings</p>
              <p className="text-sm font-semibold text-emerald-300">{fmt(stats?.lifetime_winnings ?? 0)}</p>
            </div>
            <div className="rounded-lg border border-gray-800 bg-[#0b0b11] px-4 py-3">
              <p className="text-[11px] text-gray-400 mb-1">Total deposits</p>
              <p className="text-sm font-semibold text-purple-300">{fmt(stats?.total_deposits ?? 0)}</p>
            </div>
            <div className="rounded-lg border border-gray-800 bg-[#0b0b11] px-4 py-3">
              <p className="text-[11px] text-gray-400 mb-1">Total payouts</p>
              <p className="text-sm font-semibold text-amber-300">{fmt(stats?.total_payouts ?? 0)}</p>
            </div>
          </section>

          {/* Balance */}
          <section className="grid gap-6 md:grid-cols-[1.4fr,1.6fr]">
            <div className="rounded-lg border border-gray-800 bg-[#0b0b11] p-5 space-y-4">
              <div>
                <p className="text-xs text-gray-400 mb-1">Available balance</p>
                <p className="text-3xl font-semibold text-emerald-300">{fmt(wallet?.balance ?? 0)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Locked in tournaments</p>
                <p className="text-sm text-amber-300">{fmt(locked)}</p>
              </div>
              <div className="flex gap-3 pt-1">
                <button
                  onClick={() => setModal("deposit")}
                  className="flex-1 rounded-md bg-purple-600/90 hover:bg-purple-500 text-xs py-2.5 text-white transition-colors"
                >
                  Add funds
                </button>
                <button
                  onClick={() => setModal("withdraw")}
                  className="flex-1 rounded-md border border-gray-700 hover:border-emerald-400/60 hover:bg-[#11111a] text-xs py-2.5 text-gray-100 transition-colors"
                >
                  Withdraw
                </button>
              </div>
            </div>
            <div className="rounded-lg border border-gray-800 bg-[#0b0b11] p-5 space-y-3 text-xs">
              <h2 className="text-sm font-medium text-gray-300 mb-1">Limits & status</h2>
              <p className="text-gray-400">Daily withdrawal limit: <span className="text-gray-200">NPR 100,000</span></p>
              <p className="text-gray-400">KYC status: <span className="text-emerald-300">Verified</span></p>
              <p className="text-gray-500">Manage your payment methods and KYC in settings.</p>
            </div>
          </section>

          {/* Transactions */}
          <section className="space-y-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <h2 className="text-sm font-medium text-gray-300">Recent transactions</h2>
              <div className="flex flex-wrap gap-1 text-[11px]">
                {FILTERS.map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-2 py-1 rounded-full border transition-colors ${
                      filter === f
                        ? "border-purple-500/60 bg-purple-600/20 text-purple-100"
                        : "border-gray-700 text-gray-400 hover:border-purple-500/40"
                    }`}
                  >
                    {f.replace("_", " ")}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-gray-800 bg-[#0b0b11] divide-y divide-gray-800 text-xs">
              {filtered.length === 0 ? (
                <p className="px-4 py-6 text-center text-gray-500">No transactions yet.</p>
              ) : (
                filtered.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between px-4 py-3">
                    <div>
                      <p className="text-gray-200 capitalize">{tx.type.replace("_", " ")}</p>
                      <p className="text-[11px] text-gray-500">{tx.description}</p>
                    </div>
                    <div className="text-right">
                      <p className={tx.type === "deposit" || tx.type === "prize" ? "text-emerald-300" : "text-red-300"}>
                        {tx.type === "deposit" || tx.type === "prize" ? "+" : "-"}{fmt(tx.amount)}
                      </p>
                      <p className="text-[11px] text-gray-500">{relativeDate(tx.created_at)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}