"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import './matchhistory.css'

type Match = {
  id: number;
  status: string;
  started_at: string | null;
  finished_at: string | null;
  score: number | null;
  is_winner: boolean | null;
  tournament_id: number | null;
  tournament_name: string | null;
  game: string | null;
  prize_pool: string | null;
};

function fmtDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function MatchHistoryPage() {
  const router = useRouter();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const res = await fetch("/api/matches/history");
      if (res.status === 401) { router.push("/login"); return; }
      const data = await res.json();
      setMatches(data.matches ?? []);
      setLoading(false);
    };
    
    void load();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050509] flex items-center justify-center">
        <p className="text-gray-500 text-sm animate-pulse">Loading match history…</p>
      </div>
    );
  }

  const wins = matches.filter((m) => m.is_winner).length;
  const losses = matches.filter((m) => m.is_winner === false).length;

  return (
    <div className="min-h-screen bg-[#050509] text-gray-100">
      <main className="px-4 py-8 md:px-8 md:py-10">
        <div className="max-w-4xl mx-auto space-y-8">

          <header className="space-y-1">
            <p className="text-xs uppercase tracking-wide text-purple-400">History</p>
            <h1 className="text-2xl md:text-3xl font-semibold">Match history</h1>
            <p className="text-sm text-gray-400">Your last 30 matches across all tournaments.</p>
          </header>

          {/* Stats row */}
          <section className="grid grid-cols-3 gap-3">
            <div className="rounded-lg border border-gray-800 bg-[#0b0b11] px-4 py-3 text-center">
              <p className="text-[11px] text-gray-400 mb-1">Played</p>
              <p className="text-xl font-semibold text-gray-100">{matches.length}</p>
            </div>
            <div className="rounded-lg border border-gray-800 bg-[#0b0b11] px-4 py-3 text-center">
              <p className="text-[11px] text-gray-400 mb-1">Wins</p>
              <p className="text-xl font-semibold text-emerald-300">{wins}</p>
            </div>
            <div className="rounded-lg border border-gray-800 bg-[#0b0b11] px-4 py-3 text-center">
              <p className="text-[11px] text-gray-400 mb-1">Losses</p>
              <p className="text-xl font-semibold text-red-400">{losses}</p>
            </div>
          </section>

          {/* Match list */}
          <section className="space-y-3">
            <h2 className="text-sm font-medium text-gray-300">Recent matches</h2>
            {matches.length === 0 ? (
              <div className="rounded-lg border border-gray-800 bg-[#0b0b11] px-4 py-10 text-center">
                <p className="text-sm text-gray-500">No matches played yet.</p>
                <p className="text-xs text-gray-600 mt-1">Join a tournament to get started.</p>
              </div>
            ) : (
              <div className="rounded-lg border border-gray-800 bg-[#0b0b11] divide-y divide-gray-800 text-xs">
                {matches.map((m) => (
                  <div key={m.id} className="flex items-center justify-between px-4 py-3 gap-4">
                    <div className="space-y-0.5">
                      <p className="text-gray-200">{m.tournament_name ?? "Casual match"}</p>
                      <p className="text-[11px] text-gray-500">
                        {m.game ?? "—"} · {fmtDate(m.started_at)}
                      </p>
                      {m.score != null && (
                        <p className="text-[11px] text-gray-400">Score: {m.score}</p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {m.is_winner === true && (
                        <span className="text-[11px] text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded-full">Win</span>
                      )}
                      {m.is_winner === false && (
                        <span className="text-[11px] text-red-400 border border-red-500/40 px-2 py-0.5 rounded-full">Loss</span>
                      )}
                      {m.is_winner === null && (
                        <span className="text-[11px] text-gray-500 border border-gray-700 px-2 py-0.5 rounded-full capitalize">{m.status}</span>
                      )}
                      {m.prize_pool && Number(m.prize_pool) > 0 && (
                        <span className="text-[11px] text-amber-300">NPR {Number(m.prize_pool).toLocaleString("en-IN")}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}