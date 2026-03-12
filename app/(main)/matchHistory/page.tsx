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

/* Raise Issue inline button for a completed match */
function RaiseIssueBtn({ tournamentId, tournamentName, onRaised }: {
  tournamentId: number;
  tournamentName: string | null;
  onRaised: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function handleSubmit() {
    setError("");
    if (!reason.trim()) { setError("Please describe the issue"); return; }
    setSaving(true);
    try {
      const res = await fetch(`/api/tournaments/${tournamentId}/dispute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: reason.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || `Error (${res.status})`); return; }
      setOpen(false);
      setReason("");
      setDone(true);
      onRaised();
    } catch (e) {
      setError("Network error: " + String(e));
    } finally {
      setSaving(false);
    }
  }

  if (done) {
    return (
      <span className="text-[11px] border border-orange-500/40 bg-orange-500/10 text-orange-300 px-2 py-0.5 rounded-full">
        ⚠ Issue raised
      </span>
    );
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-[11px] border border-red-500/40 bg-red-500/5 hover:bg-red-500/15 text-red-400 px-2 py-0.5 rounded-full transition"
      >
        ⚑ Raise Issue
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4" onClick={() => setOpen(false)}>
          <div className="bg-[#0b0b11] border border-gray-800 rounded-xl p-6 w-full max-w-sm space-y-4" onClick={(e) => e.stopPropagation()}>
            <div>
              <h2 className="text-sm font-semibold text-gray-100">Raise an Issue</h2>
              <p className="text-[11px] text-gray-500 mt-0.5">{tournamentName ?? `Tournament #${tournamentId}`}</p>
            </div>
            <div className="rounded-md border border-red-500/20 bg-red-500/5 px-3 py-2">
              <p className="text-[11px] text-red-400">
                Describe your dispute. An admin will review and respond.
              </p>
            </div>
            <div>
              <label className="text-[11px] text-gray-400 mb-1 block">Reason *</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                placeholder="e.g. The declared winner was not in the game, I have proof…"
                className="w-full bg-[#050509] border border-gray-700 rounded-md px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-red-500 resize-none"
              />
            </div>
            {error && <p className="text-xs text-red-400">{error}</p>}
            <div className="flex gap-3">
              <button
                onClick={() => { setOpen(false); setError(""); setReason(""); }}
                className="flex-1 rounded-md border border-gray-700 text-xs py-2 text-gray-300 hover:bg-[#11111a] transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={saving || !reason.trim()}
                className="flex-1 rounded-md bg-red-600/90 hover:bg-red-500 text-xs py-2 text-white transition disabled:opacity-50"
              >
                {saving ? "Submitting…" : "Submit Issue"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function MatchHistoryPage() {
  const router = useRouter();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const res = await fetch("/api/matches/history");
    if (res.status === 401) { router.push("/login"); return; }
    const data = await res.json();
    setMatches(data.matches ?? []);
    setLoading(false);
  }, [router]);

  useEffect(() => {
    load().catch(console.error);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
                    <div className="flex flex-col items-end gap-1.5">
                      {m.is_winner === true && (
                        <span className="text-[11px] text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded-full">Win 🏆</span>
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
                      {/* Raise Issue — only for completed tournaments */}
                      {m.status === "completed" && m.tournament_id != null && (
                        <RaiseIssueBtn
                          tournamentId={m.tournament_id}
                          tournamentName={m.tournament_name}
                          onRaised={() => void load()}
                        />
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