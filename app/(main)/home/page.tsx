"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTheme } from '@/components/ThemeProvider';

type DashData = {
  user: { id: number; name: string; email: string };
  wallet: { balance: string; currency: string };
  matches: {
    id: number;
    status: string;
    started_at: string | null;
    is_winner: boolean | null;
    tournament_name: string | null;
    game: string | null;
  }[];
  upcoming_tournaments: {
    id: number;
    name: string;
    game: string;
    entry_fee: string;
    prize_pool: string;
    start_time: string | null;
    status: string;
  }[];
  stats: {
    tournaments_joined: string;
    matches_won: string;
    matches_played: string;
  };
};

function fmt(n: string | number) {
  return `NPR ${Number(n).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
}

function fmtDate(iso: string | null) {
  if (!iso) return "TBA";
  return new Date(iso).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function HomePage() {
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [data, setData] = useState<DashData | null>(null);
  const [loading, setLoading] = useState(true);
  const [depositOpen, setDepositOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const [depositError, setDepositError] = useState("");
  const [depositing, setDepositing] = useState(false);
  const [joiningId, setJoiningId] = useState<number | null>(null);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  function showToast(msg: string, ok: boolean) {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  }

  async function loadData() {
    const res = await fetch("/api/dashboard");
    if (res.status === 401) {
      router.push("/login");
      return;
    }
    const json = await res.json() as DashData;
    setData(json);
    setLoading(false);
  }

  useEffect(() => {
    void loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleDeposit() {
    setDepositError("");
    const val = Number(depositAmount);
    if (!val || val <= 0) {
      setDepositError("Enter a valid amount");
      return;
    }
    setDepositing(true);
    const res = await fetch("/api/wallet/deposit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: val }),
    });
    const json = await res.json() as { error?: string };
    setDepositing(false);
    if (!res.ok) {
      setDepositError(json.error ?? "Failed");
      return;
    }
    setDepositOpen(false);
    setDepositAmount("");
    showToast("Funds added successfully!", true);
    void loadData();
  }

  async function handleJoin(id: number) {
    setJoiningId(id);
    const res = await fetch("/api/tournaments/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tournament_id: id }),
    });
    const json = await res.json() as { error?: string };
    setJoiningId(null);
    if (!res.ok) {
      showToast(json.error ?? "Failed to join", false);
      return;
    }
    showToast("Joined tournament!", true);
    void loadData();
  }

  if (loading || !data) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'theme-bg' : 'theme-bg'}`}>
        <p className="text-gray-500 text-sm animate-pulse">Loading…</p>
      </div>
    );
  }

  const { user, wallet, matches, upcoming_tournaments, stats } = data;

  return (
    <div className={`min-h-screen theme-bg theme-text`}>
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-2.5 rounded-lg text-sm font-medium shadow-lg ${
            toast.ok ? "bg-emerald-600 text-white" : "bg-red-600 text-white"
          }`}
        >
          {toast.msg}
        </div>
      )}

      {/* Deposit modal */}
      {depositOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-4">
          <div className="theme-bg-card theme-border rounded-xl p-6 w-full max-w-sm space-y-4">
            <h2 className="text-sm font-medium theme-text">Add funds</h2>
            <p className="text-xs theme-text-muted">
              Current balance: <span className="text-emerald-300">{fmt(wallet.balance)}</span>
            </p>
            <input
              type="number"
              placeholder="Amount (NPR)"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              className={`w-full theme-bg theme-border rounded-md px-3 py-2 text-sm theme-text focus:outline-none`}
            />
            {depositError && (
              <p className="text-xs text-red-400">{depositError}</p>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setDepositOpen(false);
                  setDepositAmount("");
                  setDepositError("");
                }}
                className="flex-1 rounded-md border theme-border text-xs py-2 theme-text hover:bg-opacity-5 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDeposit}
                disabled={depositing}
                className="flex-1 rounded-md bg-purple-600/90 hover:bg-purple-500 text-xs py-2 text-white transition disabled:opacity-50"
              >
                {depositing ? "Processing…" : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="px-4 py-8 md:px-8 md:py-10">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Header */}
          <header className="space-y-1">
            <p className="text-xs uppercase tracking-wide text-purple-400">Dashboard</p>
            <h1 className="text-2xl md:text-3xl font-semibold">Welcome back, {user.name.split(" ")[0]}</h1>
            <p className="text-sm theme-text-muted">Here&apos;s a summary of your activity.</p>
          </header>

          {/* Quick actions / cards */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="rounded-lg theme-border theme-bg-card px-4 py-3">
               <p className="text-[11px] theme-text-muted mb-1">Available balance</p>
               <p className="text-sm font-semibold text-emerald-300">{fmt(wallet.balance)}</p>
             </div>
            <div className="rounded-lg theme-border theme-bg-card px-4 py-3">
               <p className="text-[11px] theme-text-muted mb-1">Upcoming tournaments</p>
               <p className="text-sm font-semibold text-purple-300">{upcoming_tournaments.length}</p>
             </div>
            <div className="rounded-lg theme-border theme-bg-card px-4 py-3">
               <p className="text-[11px] theme-text-muted mb-1">Matches played</p>
               <p className="text-sm font-semibold text-amber-300">{stats.matches_played}</p>
             </div>
           </section>

          {/* Stats */}
          <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="rounded-lg theme-border theme-bg-card px-4 py-3">
               <p className="text-[11px] theme-text-muted mb-1">Balance</p>
               <p className="text-sm font-semibold text-emerald-300">{fmt(wallet.balance)}</p>
             </div>
            <div className="rounded-lg theme-border theme-bg-card px-4 py-3">
               <p className="text-[11px] theme-text-muted mb-1">Tournaments joined</p>
               <p className="text-sm font-semibold text-purple-300">{stats.tournaments_joined}</p>
             </div>
            <div className="rounded-lg theme-border theme-bg-card px-4 py-3">
               <p className="text-[11px] theme-text-muted mb-1">Matches won</p>
               <p className="text-sm font-semibold text-amber-300">{stats.matches_won}</p>
             </div>
            <div className="rounded-lg theme-border theme-bg-card px-4 py-3">
               <p className="text-[11px] theme-text-muted mb-1">Matches played</p>
               <p className="text-sm font-semibold theme-text">{stats.matches_played}</p>
             </div>
           </section>

           <div className="grid gap-6 md:grid-cols-2">
             {/* Upcoming tournaments */}
             <section className="space-y-3">
               <div className="flex items-center justify-between">
                 <h2 className="text-sm font-medium text-gray-300">
                   Upcoming tournaments
                 </h2>
                 <Link
                   href="/tournaments"
                   className="text-[11px] text-purple-400 hover:text-purple-300"
                 >
                   Browse all →
                 </Link>
               </div>
              <div className="rounded-lg theme-border theme-bg-card divide-y divide-gray-800 text-xs">
                 {upcoming_tournaments.length === 0 ? (
                   <div className="px-4 py-6 text-center space-y-1">
                    <p className="theme-text-muted">No upcoming tournaments.</p>
                     <Link
                       href="/tournaments"
                       className="text-purple-400 text-[11px] hover:underline inline-block"
                     >
                       Join one →
                     </Link>
                   </div>
                 ) : (
                   upcoming_tournaments.map((t) => (
                     <div
                       key={t.id}
                       className="flex items-center justify-between px-4 py-3 gap-2"
                     >
                       <div className="space-y-0.5 min-w-0">
                        <p className="theme-text truncate">{t.name}</p>
                        <p className="text-[11px] theme-text-muted">{t.game} · {fmtDate(t.start_time)}</p>
                        <p className="text-[11px] text-amber-300">{fmt(t.prize_pool)} prize</p>
                       </div>
                       <button
                         onClick={() => void handleJoin(t.id)}
                         disabled={joiningId === t.id}
                         className="shrink-0 rounded-md border border-purple-500/40 text-purple-300 px-3 py-1.5 text-[11px] hover:bg-purple-500/10 transition disabled:opacity-50"
                       >
                         {joiningId === t.id ? "Joining…" : "Join"}
                       </button>
                     </div>
                   ))
                 )}
               </div>
             </section>

             {/* Recent matches */}
             <section className="space-y-3">
               <div className="flex items-center justify-between">
                 <h2 className="text-sm font-medium text-gray-300">
                   Recent matches
                 </h2>
                 <Link
                   href="/matchHistory"
                   className="text-[11px] text-purple-400 hover:text-purple-300"
                 >
                   View all →
                 </Link>
               </div>
              <div className="rounded-lg theme-border theme-bg-card divide-y divide-gray-800 text-xs">
                 {matches.length === 0 ? (
                   <div className="px-4 py-6 text-center">
                    <p className="theme-text-muted">No matches played yet.</p>
                   </div>
                 ) : (
                   matches.map((m) => (
                     <div
                       key={m.id}
                       className="flex items-center justify-between px-4 py-3 gap-2"
                     >
                       <div className="space-y-0.5 min-w-0">
                        <p className="theme-text truncate">{m.tournament_name ?? "Casual match"}</p>
                        <p className="text-[11px] theme-text-muted">{m.game ?? "—"} · {fmtDate(m.started_at)}</p>
                       </div>
                       {m.is_winner === true && (
                         <span className="shrink-0 text-[11px] text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded-full">
                           Win
                         </span>
                       )}
                       {m.is_winner === false && (
                         <span className="shrink-0 text-[11px] text-red-400 border border-red-500/40 px-2 py-0.5 rounded-full">
                           Loss
                         </span>
                       )}
                       {m.is_winner === null && (
                        <span className="shrink-0 text-[11px] theme-text-muted border theme-border px-2 py-0.5 rounded-full capitalize">{m.status}</span>
                       )}
                     </div>
                   ))
                 )}
               </div>
             </section>
           </div>

           {/* Quick actions */}
          <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button onClick={() => setDepositOpen(true)} className="rounded-lg theme-border theme-bg-card px-4 py-3 text-xs text-left hover:bg-opacity-5 transition-colors">
              <p className="font-medium text-purple-300">Add funds</p>
              <p className="text-[11px] theme-text-muted mt-0.5">→</p>
            </button>
            <Link href="/tournaments" className="rounded-lg theme-border theme-bg-card px-4 py-3 text-xs hover:bg-opacity-5 transition-colors">
              <p className="font-medium text-amber-300">Browse tournaments</p>
              <p className="text-[11px] theme-text-muted mt-0.5">→</p>
            </Link>
            <Link href="/matchHistory" className="rounded-lg theme-border theme-bg-card px-4 py-3 text-xs hover:bg-opacity-5 transition-colors">
              <p className="font-medium text-emerald-300">Match history</p>
              <p className="text-[11px] theme-text-muted mt-0.5">→</p>
            </Link>
            <Link href="/profile" className="rounded-lg theme-border theme-bg-card px-4 py-3 text-xs hover:bg-opacity-5 transition-colors">
              <p className="font-medium theme-text">Profile</p>
              <p className="text-[11px] theme-text-muted mt-0.5">→</p>
            </Link>
          </section>
         </div>
       </main>
     </div>
   );
 }