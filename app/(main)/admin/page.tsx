"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

/* ─── Types ──────────────────────────────────────────────────────────── */
type Participant = {
  user_id: number;
  username: string;
  email: string;
  is_winner: boolean | null;
};

type Tournament = {
  id: number;
  name: string;
  game: string;
  description: string | null;
  entry_fee: string;
  prize_pool: string;
  max_players: number | null;
  start_time: string | null;
  end_time: string | null;
  status: "pending_approval" | "upcoming" | "ongoing" | "completed" | "cancelled";
  registered_count: number;
  participants: Participant[];
  room_id: string | null;
  room_password: string | null;
};

const GAMES = ["Valorant", "PUBG", "CS2", "Apex Legends", "Free Fire", "Other"];

function fmt(n: string | number) {
  return `NPR ${Number(n).toLocaleString("en-IN")}`;
}

function fmtDate(iso: string | null) {
  if (!iso) return "TBA";
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
  });
}

const STATUS_COLORS: Record<string, string> = {
  pending_approval: "text-yellow-300 border-yellow-500/40",
  upcoming: "text-purple-300 border-purple-500/40",
  ongoing: "text-red-300 border-red-500/40",
  completed: "text-emerald-300 border-emerald-500/40",
  cancelled: "text-gray-500 border-gray-700",
};

/* ─── Create Tournament Form ─────────────────────────────────────────── */
function CreateForm({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "", game: "Valorant", description: "",
    entry_fee: "", prize_pool: "", max_players: "", start_time: "",
    room_id: "", room_password: "",
  });

  function set(k: string, v: string) { setForm((f) => ({ ...f, [k]: v })); }

  async function handleCreate() {
    setError("");
    if (!form.name.trim()) { setError("Tournament name is required"); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/tournaments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          entry_fee: Number(form.entry_fee) || 0,
          prize_pool: Number(form.prize_pool) || 0,
          max_players: Number(form.max_players) || null,
          start_time: form.start_time || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || `Server error (${res.status})`); return; }
      setOpen(false);
      setForm({ name: "", game: "Valorant", description: "", entry_fee: "", prize_pool: "", max_players: "", start_time: "", room_id: "", room_password: "" });
      onCreated();
    } catch (e) {
      setError("Network error: " + String(e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-md bg-purple-600/90 hover:bg-purple-500 px-4 py-2 text-sm text-white transition-colors"
      >
        + New tournament
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4 overflow-y-auto">
          <div className="bg-[#0b0b11] border border-gray-800 rounded-xl p-6 w-full max-w-lg space-y-4 my-8">
            <h2 className="text-sm font-semibold text-gray-100">Create tournament</h2>

            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="text-[11px] text-gray-400 mb-1 block">Tournament name *</label>
                <input
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder="e.g. Valorant Cup #4"
                  className="w-full bg-[#050509] border border-gray-700 rounded-md px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-gray-400 mb-1 block">Game *</label>
                <select
                  value={form.game}
                  onChange={(e) => set("game", e.target.value)}
                  className="w-full bg-[#050509] border border-gray-700 rounded-md px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-purple-500"
                >
                  {GAMES.map((g) => <option key={g}>{g}</option>)}
                </select>
              </div>

              <div>
                <label className="text-[11px] text-gray-400 mb-1 block">Max players</label>
                <input
                  type="number"
                  value={form.max_players}
                  onChange={(e) => set("max_players", e.target.value)}
                  placeholder="e.g. 32"
                  className="w-full bg-[#050509] border border-gray-700 rounded-md px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-gray-400 mb-1 block">Entry fee (NPR)</label>
                <input
                  type="number"
                  value={form.entry_fee}
                  onChange={(e) => set("entry_fee", e.target.value)}
                  placeholder="0 = Free"
                  className="w-full bg-[#050509] border border-gray-700 rounded-md px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-gray-400 mb-1 block">Prize pool (NPR)</label>
                <input
                  type="number"
                  value={form.prize_pool}
                  onChange={(e) => set("prize_pool", e.target.value)}
                  placeholder="e.g. 50000"
                  className="w-full bg-[#050509] border border-gray-700 rounded-md px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="col-span-2">
                <label className="text-[11px] text-gray-400 mb-1 block">Start time</label>
                <input
                  type="datetime-local"
                  value={form.start_time}
                  onChange={(e) => set("start_time", e.target.value)}
                  className="w-full bg-[#050509] border border-gray-700 rounded-md px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-gray-400 mb-1 block">Room ID</label>
                <input
                  value={form.room_id}
                  onChange={(e) => set("room_id", e.target.value)}
                  placeholder="e.g. 123456"
                  className="w-full bg-[#050509] border border-gray-700 rounded-md px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-gray-400 mb-1 block">Room Password</label>
                <input
                  value={form.room_password}
                  onChange={(e) => set("room_password", e.target.value)}
                  placeholder="e.g. abc123"
                  className="w-full bg-[#050509] border border-gray-700 rounded-md px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="col-span-2">
                <label className="text-[11px] text-gray-400 mb-1 block">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                  rows={2}
                  placeholder="Optional description…"
                  className="w-full bg-[#050509] border border-gray-700 rounded-md px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-purple-500 resize-none"
                />
              </div>
            </div>

            {error && <p className="text-xs text-red-400">{error}</p>}
            <p className="text-[11px] text-yellow-500/80">⚠ Tournaments require admin approval before becoming visible to players.</p>

            <div className="flex gap-3 pt-1">
              <button
                onClick={() => { setOpen(false); setError(""); }}
                className="flex-1 rounded-md border border-gray-700 text-xs py-2 text-gray-300 hover:bg-[#11111a] transition"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={saving}
                className="flex-1 rounded-md bg-purple-600/90 hover:bg-purple-500 text-xs py-2 text-white transition disabled:opacity-50"
              >
                {saving ? "Creating…" : "Create tournament"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ─── Tournament Card ────────────────────────────────────────────────── */
function TournamentCard({ t, onRefresh, showToast }: {
  t: Tournament;
  onRefresh: () => void;
  showToast: (msg: string, ok: boolean) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [actioning, setActioning] = useState(false);
  const [winnerUserId, setWinnerUserId] = useState("");
  const [roomId, setRoomId] = useState(t.room_id ?? "");
  const [roomPassword, setRoomPassword] = useState(t.room_password ?? "");

  async function updateStatus(action: "approve" | "start" | "end" | "cancel") {
    setActioning(true);
    const body: Record<string, unknown> = { action };
    if (action === "approve" || action === "start") {
      if (roomId.trim()) body.room_id = roomId.trim();
      if (roomPassword.trim()) body.room_password = roomPassword.trim();
    }
    const res = await fetch(`/api/admin/tournaments/${t.id}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    setActioning(false);
    if (!res.ok) { showToast(data.error || "Failed", false); return; }
    showToast(`Tournament marked as ${data.status}`, true);
    onRefresh();
  }

  async function declareWinner() {
    const uid = Number(winnerUserId);
    if (!uid) { showToast("Select a winner first", false); return; }
    setActioning(true);
    const res = await fetch(`/api/admin/tournaments/${t.id}/winner`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ winner_user_id: uid }),
    });
    const data = await res.json();
    setActioning(false);
    if (!res.ok) { showToast(data.error || "Failed", false); return; }
    showToast(`Winner declared! ${fmt(data.prize_awarded)} awarded.`, true);
    setWinnerUserId("");
    onRefresh();
  }

  return (
    <article className="rounded-lg border border-gray-800 bg-[#0b0b11] overflow-hidden">
      {/* Header row */}
      <div className="flex items-center justify-between px-4 py-3 gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-gray-100 truncate">{t.name}</p>
            <span className={`text-[10px] border px-2 py-0.5 rounded-full whitespace-nowrap ${STATUS_COLORS[t.status]}`}>
              {t.status}
            </span>
          </div>
          <p className="text-[11px] text-gray-500 mt-0.5">
            {t.game} · {t.registered_count}{t.max_players ? `/${t.max_players}` : ""} players · {fmt(t.prize_pool)} prize · entry {Number(t.entry_fee) === 0 ? "Free" : fmt(t.entry_fee)}
          </p>
          <p className="text-[11px] text-gray-600">Starts {fmtDate(t.start_time)}</p>
        </div>
        <button
          onClick={() => setExpanded((v) => !v)}
          className="text-[11px] border border-gray-700 px-3 py-1.5 rounded-md text-gray-400 hover:text-gray-200 hover:border-gray-600 transition whitespace-nowrap"
        >
          {expanded ? "Collapse ↑" : "Manage ↓"}
        </button>
      </div>

      {expanded && (
        <div className="border-t border-gray-800 px-4 py-4 space-y-4">
          {/* Status actions */}
          <div className="space-y-3">
            <p className="text-[11px] text-gray-400 uppercase tracking-wide">Tournament controls</p>

            {/* Room details — shown when approving or starting */}
            {(t.status === "pending_approval" || t.status === "upcoming") && (
              <div className="rounded-md border border-gray-700 bg-[#050509] px-3 py-3 space-y-2">
                <p className="text-[11px] text-purple-300 font-medium">🔑 Set room details (given to registered players)</p>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-gray-500 mb-1 block">Room ID</label>
                    <input
                      value={roomId}
                      onChange={(e) => setRoomId(e.target.value)}
                      placeholder="e.g. 123456"
                      className="w-full bg-[#0b0b11] border border-gray-700 rounded px-2 py-1.5 text-xs text-gray-100 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500 mb-1 block">Room Password</label>
                    <input
                      value={roomPassword}
                      onChange={(e) => setRoomPassword(e.target.value)}
                      placeholder="e.g. abc123"
                      className="w-full bg-[#0b0b11] border border-gray-700 rounded px-2 py-1.5 text-xs text-gray-100 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Current room details — shown when already set */}
            {(t.status === "ongoing" || t.status === "upcoming") && (t.room_id || t.room_password) && (
              <div className="rounded-md border border-yellow-500/30 bg-yellow-500/5 px-3 py-2 space-y-1">
                <p className="text-[11px] text-yellow-400 font-medium">Current room details (visible to registered players)</p>
                {t.room_id && <p className="text-xs text-gray-200">Room ID: <span className="font-mono text-yellow-300">{t.room_id}</span></p>}
                {t.room_password && <p className="text-xs text-gray-200">Password: <span className="font-mono text-yellow-300">{t.room_password}</span></p>}
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {t.status === "pending_approval" && (
                <button
                  onClick={() => updateStatus("approve")}
                  disabled={actioning}
                  className="rounded-md bg-yellow-500/90 hover:bg-yellow-400 px-3 py-1.5 text-xs text-black font-semibold transition disabled:opacity-50"
                >
                  ✓ Approve tournament
                </button>
              )}
              {t.status === "upcoming" && (
                <button
                  onClick={() => updateStatus("start")}
                  disabled={actioning}
                  className="rounded-md bg-emerald-600/80 hover:bg-emerald-600 px-3 py-1.5 text-xs text-white transition disabled:opacity-50"
                >
                  ▶ Start tournament
                </button>
              )}
              {t.status === "ongoing" && (
                <button
                  onClick={() => updateStatus("end")}
                  disabled={actioning}
                  className="rounded-md bg-amber-600/80 hover:bg-amber-600 px-3 py-1.5 text-xs text-white transition disabled:opacity-50"
                >
                  ■ End tournament
                </button>
              )}
              {(t.status === "pending_approval" || t.status === "upcoming" || t.status === "ongoing") && (
                <button
                  onClick={() => updateStatus("cancel")}
                  disabled={actioning}
                  className="rounded-md border border-red-500/50 text-red-400 hover:bg-red-500/10 px-3 py-1.5 text-xs transition disabled:opacity-50"
                >
                  ✕ Cancel
                </button>
              )}
            </div>
          </div>

          {/* Participants */}
          <div className="space-y-2">
            <p className="text-[11px] text-gray-400 uppercase tracking-wide">
              Registered players ({t.participants.length})
            </p>
            {t.participants.length === 0 ? (
              <p className="text-xs text-gray-600">No players registered yet.</p>
            ) : (
              <div className="rounded-md border border-gray-800 divide-y divide-gray-800">
                {t.participants.map((p) => (
                  <div key={p.user_id} className="flex items-center justify-between px-3 py-2 text-xs">
                    <div>
                      <p className="text-gray-200">{p.username}</p>
                      <p className="text-[11px] text-gray-500">{p.email} · ID #{p.user_id}</p>
                    </div>
                    {p.is_winner === true && (
                      <span className="text-emerald-400 text-[11px] border border-emerald-500/40 px-2 py-0.5 rounded-full">🏆 Winner</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Declare winner */}
          {(t.status === "ongoing" || t.status === "completed") && t.participants.length > 0 && (
            <div className="space-y-2">
              <p className="text-[11px] text-gray-400 uppercase tracking-wide">Declare winner</p>
              <div className="flex gap-2">
                <select
                  value={winnerUserId}
                  onChange={(e) => setWinnerUserId(e.target.value)}
                  className="flex-1 bg-[#050509] border border-gray-700 rounded-md px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-purple-500"
                >
                  <option value="">— Select winner —</option>
                  {t.participants.map((p) => (
                    <option key={p.user_id} value={p.user_id}>
                      {p.username} (#{p.user_id})
                    </option>
                  ))}
                </select>
                <button
                  onClick={declareWinner}
                  disabled={actioning || !winnerUserId}
                  className="rounded-md bg-amber-500/90 hover:bg-amber-500 px-4 py-2 text-xs text-white transition disabled:opacity-50 whitespace-nowrap"
                >
                  {actioning ? "Saving…" : `🏆 Award ${fmt(t.prize_pool)}`}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </article>
  );
}

/* ─── Admin Page ─────────────────────────────────────────────────────── */
export default function AdminPage() {
  const router = useRouter();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const load = useCallback(async () => {
    setServerError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/tournaments");
      if (res.status === 401 || res.status === 403) {
        setAccessDenied(true);
        setLoading(false);
        return;
      }
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setServerError(body.detail || body.error || `Server error (${res.status})`);
        setLoading(false);
        return;
      }
      const data = await res.json();
      setTournaments(data.tournaments ?? []);
    } catch (e) {
      setServerError(String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  function showToast(msg: string, ok: boolean) {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  }

  const filtered = tournaments
    .filter((t) => statusFilter === "all" || t.status === statusFilter)
    .filter((t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.game.toLowerCase().includes(search.toLowerCase())
    );

  const counts = {
    all: tournaments.length,
    pending_approval: tournaments.filter((t) => t.status === "pending_approval").length,
    upcoming: tournaments.filter((t) => t.status === "upcoming").length,
    ongoing: tournaments.filter((t) => t.status === "ongoing").length,
    completed: tournaments.filter((t) => t.status === "completed").length,
    cancelled: tournaments.filter((t) => t.status === "cancelled").length,
  };

  if (accessDenied) {
    return (
      <div className="min-h-screen bg-[#050509] flex flex-col items-center justify-center gap-4">
        <p className="text-red-400 text-sm font-medium">⛔ Access denied — admin only.</p>
        <p className="text-gray-500 text-xs">Your account does not have admin privileges.</p>
        <button
          onClick={() => router.push("/home")}
          className="mt-2 rounded-md border border-gray-700 px-4 py-2 text-xs text-gray-300 hover:bg-[#11111a] transition"
        >
          ← Go home
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050509] flex items-center justify-center">
        <p className="text-gray-500 text-sm animate-pulse">Loading admin panel…</p>
      </div>
    );
  }

  if (serverError) {
    return (
      <div className="min-h-screen bg-[#050509] flex flex-col items-center justify-center gap-4 px-6">
        <p className="text-red-400 text-sm font-medium">⚠ Failed to load admin panel.</p>
        <p className="text-gray-500 text-xs text-center max-w-md font-mono bg-[#0b0b11] border border-gray-800 rounded-md px-4 py-3">
          {serverError}
        </p>
        <button
          onClick={() => void load()}
          className="mt-2 rounded-md bg-purple-600/90 hover:bg-purple-500 px-4 py-2 text-xs text-white transition"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050509] text-gray-100">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg text-sm font-medium shadow-lg max-w-xs ${toast.ok ? "bg-emerald-600 text-white" : "bg-red-600 text-white"}`}>
          {toast.msg}
        </div>
      )}

      <main className="px-4 py-8 md:px-8 md:py-10">
        <div className="max-w-5xl mx-auto space-y-6">

          {/* Header */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="text-xs uppercase tracking-wide text-purple-400">Admin</p>
              <h1 className="text-2xl font-semibold">Tournament manager</h1>
              <p className="text-sm text-gray-400 mt-0.5">Approve, manage tournaments and declare winners.</p>
            </div>
            <CreateForm onCreated={() => { void load(); showToast("Tournament submitted for approval!", true); }} />
          </div>

          {/* Summary stats */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
            {(["all", "pending_approval", "upcoming", "ongoing", "completed", "cancelled"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`rounded-lg border px-3 py-2 text-xs text-left transition-colors ${
                  statusFilter === s
                    ? "border-purple-500/60 bg-purple-600/20 text-purple-200"
                    : "border-gray-800 bg-[#0b0b11] text-gray-400 hover:border-gray-700"
                }`}
              >
                <p className="text-[11px] text-gray-500 capitalize">{s === "pending_approval" ? "Pending" : s}</p>
                <p className="text-lg font-semibold text-gray-100">{counts[s]}</p>
              </button>
            ))}
          </div>

          {/* Search */}
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or game…"
            className="w-full bg-[#0b0b11] border border-gray-800 rounded-md px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-purple-500"
          />

          {/* Tournament list */}
          <div className="space-y-3">
            {filtered.length === 0 ? (
              <div className="rounded-lg border border-gray-800 bg-[#0b0b11] px-4 py-10 text-center">
                <p className="text-gray-500 text-sm">No tournaments found.</p>
              </div>
            ) : (
              filtered.map((t) => (
                <TournamentCard
                  key={t.id}
                  t={t}
                  onRefresh={() => void load()}
                  showToast={showToast}
                />
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
