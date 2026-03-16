"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from '@/components/ThemeProvider';

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
	status: "upcoming" | "ongoing" | "completed" | "cancelled";
	registered_count: number;
	is_registered: boolean;
	is_creator: boolean;
	has_dispute: boolean;
	room_id: string | null;
	room_password: string | null;
	participants: { user_id: number; username: string }[];
};

const GAME_FILTERS = ["All", "Valorant", "PUBG"] as const;
const GAMES = ["Valorant", "PUBG", "CS2", "Apex Legends", "Free Fire", "Other"];
type GameFilter = (typeof GAME_FILTERS)[number];

function fmt(n: string | number) {
	return `NPR ${Number(n).toLocaleString("en-IN")}`;
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

/* ─── Submit Tournament Modal (for all players) ─────────────────────── */
function SubmitTournamentModal({ onSubmitted, showToast }: {
	onSubmitted: () => void;
	showToast: (msg: string, ok: boolean) => void;
}) {
	const [open, setOpen] = useState(false);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState("");
	const [form, setForm] = useState({
		name: "", game: "Valorant", description: "",
		entry_fee: "", prize_pool: "", max_players: "", start_time: "",
		room_id: "", room_password: "",
	});

	function set(k: string, v: string) { setForm((f) => ({ ...f, [k]: v })); }

	async function handleSubmit() {
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
			showToast("Tournament submitted! Awaiting admin approval.", true);
			onSubmitted();
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
				+ Submit tournament
			</button>

			{open && (
				<div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4 overflow-y-auto">
					<div className="theme-bg-card theme-border rounded-xl p-6 w-full max-w-lg space-y-4 my-8">
						<div>
							<h2 className="text-sm font-semibold theme-text">Submit a tournament</h2>
							<p className="text-[11px] text-yellow-500/80 mt-1">⚠ Tournaments require admin approval before becoming visible to players.</p>
						</div>

						<div className="grid grid-cols-2 gap-3">
							<div className="col-span-2">
								<label className="text-[11px] theme-text-muted mb-1 block">Tournament name *</label>
								<input
									value={form.name}
									onChange={(e) => set("name", e.target.value)}
									placeholder="e.g. Valorant Cup #4"
									className="w-full theme-bg theme-border rounded-md px-3 py-2 text-sm theme-text focus:outline-none focus:border-purple-500"
								/>
							</div>
							<div>
								<label className="text-[11px] theme-text-muted mb-1 block">Game *</label>
								<select
									value={form.game}
									onChange={(e) => set("game", e.target.value)}
									className="w-full theme-bg theme-border rounded-md px-3 py-2 text-sm theme-text focus:outline-none focus:border-purple-500"
								>
									{GAMES.map((g) => <option key={g}>{g}</option>)}
								</select>
							</div>
							<div>
								<label className="text-[11px] theme-text-muted mb-1 block">Max players</label>
								<input
									type="number"
									value={form.max_players}
									onChange={(e) => set("max_players", e.target.value)}
									placeholder="e.g. 32"
									className="w-full theme-bg theme-border rounded-md px-3 py-2 text-sm theme-text focus:outline-none focus:border-purple-500"
								/>
							</div>
							<div>
								<label className="text-[11px] theme-text-muted mb-1 block">Entry fee (NPR)</label>
								<input
									type="number"
									value={form.entry_fee}
									onChange={(e) => set("entry_fee", e.target.value)}
									placeholder="0 = Free"
									className="w-full theme-bg theme-border rounded-md px-3 py-2 text-sm theme-text focus:outline-none focus:border-purple-500"
								/>
							</div>
							<div>
								<label className="text-[11px] theme-text-muted mb-1 block">Prize pool (NPR)</label>
								<input
									type="number"
									value={form.prize_pool}
									onChange={(e) => set("prize_pool", e.target.value)}
									placeholder="e.g. 50000"
									className="w-full theme-bg theme-border rounded-md px-3 py-2 text-sm theme-text focus:outline-none focus:border-purple-500"
								/>
							</div>
							<div className="col-span-2">
								<label className="text-[11px] theme-text-muted mb-1 block">Start time</label>
								<input
									type="datetime-local"
									value={form.start_time}
									onChange={(e) => set("start_time", e.target.value)}
									className="w-full theme-bg theme-border rounded-md px-3 py-2 text-sm theme-text focus:outline-none focus:border-purple-500"
								/>
							</div>
							<div>
								<label className="text-[11px] theme-text-muted mb-1 block">Room ID</label>
								<input
									value={form.room_id}
									onChange={(e) => set("room_id", e.target.value)}
									placeholder="e.g. 123456"
									className="w-full theme-bg theme-border rounded-md px-3 py-2 text-sm theme-text focus:outline-none focus:border-purple-500"
								/>
							</div>
							<div>
								<label className="text-[11px] theme-text-muted mb-1 block">Room Password</label>
								<input
									value={form.room_password}
									onChange={(e) => set("room_password", e.target.value)}
									placeholder="e.g. abc123"
									className="w-full theme-bg theme-border rounded-md px-3 py-2 text-sm theme-text focus:outline-none focus:border-purple-500"
								/>
							</div>
							<div className="col-span-2">
								<label className="text-[11px] theme-text-muted mb-1 block">Description</label>
								<textarea
									value={form.description}
									onChange={(e) => set("description", e.target.value)}
									rows={2}
									placeholder="Optional description…"
									className="w-full theme-bg theme-border rounded-md px-3 py-2 text-sm theme-text focus:outline-none focus:border-purple-500 resize-none"
								/>
							</div>
						</div>

						{error && <p className="text-xs text-red-400">{error}</p>}

						<div className="flex gap-3 pt-1">
							<button
								onClick={() => { setOpen(false); setError(""); }}
								className="flex-1 rounded-md border theme-border text-xs py-2 theme-text hover:bg-opacity-5 transition"
							>
								Cancel
							</button>
							<button
								onClick={handleSubmit}
								disabled={saving}
								className="flex-1 rounded-md bg-purple-600/90 hover:bg-purple-500 text-xs py-2 text-white transition disabled:opacity-50"
							>
								{saving ? "Submitting…" : "Submit for approval"}
							</button>
						</div>
					</div>
				</div>
			)}
		</>
	);
}

/* Start Tournament modal — for the creator to set room details and go live */
function StartTournamentModal({ tournament: t, onStarted, showToast }: {
	tournament: Tournament;
	onStarted: () => void;
	showToast: (msg: string, ok: boolean) => void;
}) {
	const [open, setOpen] = useState(false);
	const [roomId, setRoomId] = useState(t.room_id ?? "");
	const [roomPassword, setRoomPassword] = useState(t.room_password ?? "");
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState("");

	async function handleStart() {
		setError("");
		setSaving(true);
		try {
			const res = await fetch(`/api/tournaments/${t.id}/start`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					room_id: roomId.trim() || null,
					room_password: roomPassword.trim() || null,
				}),
			});
			const data = await res.json();
			if (!res.ok) { setError(data.error || `Error (${res.status})`); return; }
			setOpen(false);
			showToast("Tournament is now LIVE! Room details sent to players.", true);
			onStarted();
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
				className="w-full rounded-md bg-emerald-600/90 hover:bg-emerald-500 text-xs py-2 text-white transition-colors font-medium"
			>
				▶ Start Tournament
			</button>

			{open && (
				<div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4" onClick={() => setOpen(false)}>
					<div className="bg-[#0b0b11] border border-gray-800 rounded-xl p-6 w-full max-w-sm space-y-4" onClick={(e) => e.stopPropagation()}>
						<div>
							<h2 className="text-sm font-semibold text-gray-100">Start Tournament</h2>
							<p className="text-[11px] text-gray-500 mt-0.5">{t.name} · {t.registered_count} players registered</p>
						</div>

						<div className="rounded-md border border-emerald-500/20 bg-emerald-500/5 px-3 py-2">
							<p className="text-[11px] text-emerald-400">
								Once started, the tournament goes <span className="font-semibold">LIVE</span>. Registered players will be able to see the room details.
							</p>
						</div>

						<div className="space-y-3">
							<p className="text-[11px] text-purple-300 font-medium">🔑 Set room details</p>
							<div>
								<label className="text-[10px] text-gray-400 mb-1 block">Room ID</label>
								<input
									value={roomId}
									onChange={(e) => setRoomId(e.target.value)}
									placeholder="e.g. 123456"
									className="w-full bg-[#050509] border border-gray-700 rounded-md px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-purple-500"
								/>
							</div>
							<div>
								<label className="text-[10px] text-gray-400 mb-1 block">Room Password</label>
								<input
									value={roomPassword}
									onChange={(e) => setRoomPassword(e.target.value)}
									placeholder="e.g. abc123"
									className="w-full bg-[#050509] border border-gray-700 rounded-md px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-purple-500"
								/>
							</div>
						</div>

						{error && <p className="text-xs text-red-400">{error}</p>}

						<div className="flex gap-3">
							<button
								onClick={() => { setOpen(false); setError(""); }}
								className="flex-1 rounded-md border border-gray-700 text-xs py-2 text-gray-300 hover:bg-[#11111a] transition"
							>
								Cancel
							</button>
							<button
								onClick={handleStart}
								disabled={saving}
								className="flex-1 rounded-md bg-emerald-600/90 hover:bg-emerald-500 text-xs py-2 text-white transition disabled:opacity-50"
							>
								{saving ? "Starting…" : "▶ Go Live"}
							</button>
						</div>
					</div>
				</div>
			)}
		</>
	);
}

/* Finish Tournament modal — for the creator to declare a winner and end the tournament */
function FinishTournamentModal({ tournament: t, onFinished, showToast }: {
	tournament: Tournament;
	onFinished: () => void;
	showToast: (msg: string, ok: boolean) => void;
}) {
	const [open, setOpen] = useState(false);
	const [winnerId, setWinnerId] = useState("");
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState("");

	async function handleFinish() {
		setError("");
		if (!winnerId) { setError("Please select a winner"); return; }
		setSaving(true);
		try {
			const res = await fetch(`/api/tournaments/${t.id}/finish`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ winner_user_id: Number(winnerId) }),
			});
			const data = await res.json();
			if (!res.ok) { setError(data.error || `Error (${res.status})`); return; }
			setOpen(false);
			showToast(`Tournament finished! 🏆 NPR ${Number(data.prize_awarded).toLocaleString("en-IN")} awarded.`, true);
			onFinished();
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
				className="w-full rounded-md bg-amber-600/90 hover:bg-amber-500 text-xs py-2 text-white transition-colors font-medium"
			>
				🏁 Finish & Declare Winner
			</button>

			{open && (
				<div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4" onClick={() => setOpen(false)}>
					<div className="bg-[#0b0b11] border border-gray-800 rounded-xl p-6 w-full max-w-sm space-y-4" onClick={(e) => e.stopPropagation()}>
						<div>
							<h2 className="text-sm font-semibold text-gray-100">Finish Tournament</h2>
							<p className="text-[11px] text-gray-500 mt-0.5">{t.name} · {t.registered_count} players registered</p>
						</div>

						<div className="rounded-md border border-amber-500/30 bg-amber-500/5 px-3 py-2">
							<p className="text-[11px] text-amber-400">
								🏆 <span className="font-semibold">NPR {Number(t.prize_pool).toLocaleString("en-IN")}</span> will be awarded to the winner and the tournament will be marked as completed.
							</p>
						</div>

						<div>
							<label className="text-[11px] text-gray-400 mb-1 block">Select winner *</label>
							{t.participants.length === 0 ? (
								<p className="text-xs text-gray-600">No players registered yet.</p>
							) : (
								<select
									value={winnerId}
									onChange={(e) => setWinnerId(e.target.value)}
									className="w-full bg-[#050509] border border-gray-700 rounded-md px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-purple-500"
								>
									<option value="">— Select a player —</option>
									{t.participants.map((p) => (
										<option key={p.user_id} value={p.user_id}>{p.username}</option>
									))}
								</select>
							)}
						</div>

						{error && <p className="text-xs text-red-400">{error}</p>}

						<div className="flex gap-3">
							<button
								onClick={() => { setOpen(false); setError(""); setWinnerId(""); }}
								className="flex-1 rounded-md border border-gray-700 text-xs py-2 text-gray-300 hover:bg-[#11111a] transition"
							>
								Cancel
							</button>
							<button
								onClick={handleFinish}
								disabled={saving || !winnerId}
								className="flex-1 rounded-md bg-amber-600/90 hover:bg-amber-500 text-xs py-2 text-white transition disabled:opacity-50"
							>
								{saving ? "Finishing…" : "Confirm & Finish"}
							</button>
						</div>
					</div>
				</div>
			)}
		</>
	);
}

/* Raise Issue modal — for registered players / creator on a completed tournament */
function RaiseIssueModal({ tournament: t, onRaised, showToast }: {
	tournament: Tournament;
	onRaised: () => void;
	showToast: (msg: string, ok: boolean) => void;
}) {
	const [open, setOpen] = useState(false);
	const [reason, setReason] = useState("");
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState("");

	async function handleSubmit() {
		setError("");
		if (!reason.trim()) { setError("Please describe the issue"); return; }
		setSaving(true);
		try {
			const res = await fetch(`/api/tournaments/${t.id}/dispute`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ reason: reason.trim() }),
			});
			const data = await res.json();
			if (!res.ok) { setError(data.error || `Error (${res.status})`); return; }
			setOpen(false);
			setReason("");
			showToast("Issue raised. An admin will review it shortly.", true);
			onRaised();
		} catch (e) {
			setError("Network error: " + String(e));
		} finally {
			setSaving(false);
		}
	}

	if (t.has_dispute) {
		return (
			<span className="text-[11px] border border-orange-500/40 bg-orange-500/10 text-orange-300 px-3 py-1.5 rounded-md whitespace-nowrap">
				⚠ Issue raised
			</span>
		);
	}

	return (
		<>
			<button
				onClick={() => setOpen(true)}
				className="text-[11px] border border-red-500/40 bg-red-500/5 hover:bg-red-500/15 text-red-400 px-3 py-1.5 rounded-md whitespace-nowrap transition"
			>
				⚑ Raise Issue
			</button>

			{open && (
				<div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4" onClick={() => setOpen(false)}>
					<div className="bg-[#0b0b11] border border-gray-800 rounded-xl p-6 w-full max-w-sm space-y-4" onClick={(e) => e.stopPropagation()}>
						<div>
							<h2 className="text-sm font-semibold text-gray-100">Raise an Issue</h2>
							<p className="text-[11px] text-gray-500 mt-0.5">{t.name} · {t.game}</p>
						</div>

						<div className="rounded-md border border-red-500/20 bg-red-500/5 px-3 py-2">
							<p className="text-[11px] text-red-400">
								Describe your conflict or dispute. An admin will review and respond.
							</p>
						</div>

						<div>
							<label className="text-[11px] text-gray-400 mb-1 block">Reason *</label>
							<textarea
								value={reason}
								onChange={(e) => setReason(e.target.value)}
								rows={3}
								placeholder="e.g. The declared winner was not in the game, I have screenshots…"
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

/* Small "View Details" button used in the row-style upcoming list */
function UpcomingRoomButton({ tournament: t }: { tournament: Tournament }) {	const [show, setShow] = useState(false);
	return (
		<>
			<button
				onClick={() => setShow(true)}
				className="text-[11px] border border-yellow-500/50 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-300 px-3 py-1.5 rounded-md whitespace-nowrap transition"
			>
				🔑 Room Details
			</button>
			{show && (
				<div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4" onClick={() => setShow(false)}>
					<div className="bg-[#0b0b11] border border-gray-800 rounded-xl p-6 w-full max-w-sm space-y-4" onClick={(e) => e.stopPropagation()}>
						<div>
							<h2 className="text-sm font-semibold text-gray-100">{t.name}</h2>
							<p className="text-[11px] text-gray-500 mt-0.5">{t.game} · {t.status}</p>
						</div>
						<div className="rounded-md border border-yellow-500/30 bg-yellow-500/5 px-4 py-3 space-y-3">
							<p className="text-[11px] text-yellow-400 font-semibold uppercase tracking-wide">🔑 Room Details</p>
							{t.room_id && (
								<div className="space-y-1">
									<p className="text-[11px] text-gray-400">Room ID</p>
									<p className="font-mono text-lg text-yellow-300 tracking-widest">{t.room_id}</p>
								</div>
							)}
							{t.room_password && (
								<div className="space-y-1">
									<p className="text-[11px] text-gray-400">Password</p>
									<p className="font-mono text-lg text-yellow-300 tracking-widest">{t.room_password}</p>
								</div>
							)}
						</div>
						<p className="text-[11px] text-gray-600">Only visible to registered players. Do not share.</p>
						<button onClick={() => setShow(false)} className="w-full rounded-md border border-gray-700 text-xs py-2 text-gray-300 hover:bg-[#11111a] transition">Close</button>
					</div>
				</div>
			)}
		</>
	);
}

function TournamentCard({
	tournament: t,
	joining,
	onJoin,
	onFinished,
	showToast,
}: {
	tournament: Tournament;
	joining: boolean;
	onJoin: () => void;
	onFinished: () => void;
	showToast: (msg: string, ok: boolean) => void;
}) {
	const [showDetails, setShowDetails] = useState(false);
	const hasRoom = (t.status === "upcoming" || t.status === "ongoing") && (t.room_id || t.room_password);
	const canRaiseIssue = t.status === "completed" && (t.is_registered || t.is_creator);

	return (
		<article className="rounded-lg theme-border theme-bg-card p-4 space-y-3 text-xs">
			<div className="flex items-center justify-between">
				<div>
					<p className="theme-text text-sm">{t.name}</p>
					<p className="text-[11px] theme-text-muted">{t.game}</p>
				</div>
				<span className="text-[11px] theme-text-muted">
					{t.registered_count}
					{t.max_players ? ` / ${t.max_players}` : ""} players
				</span>
			</div>
			{t.description && (
				<p className="theme-text-muted text-[11px]">{t.description}</p>
			)}
			<p className="theme-text-muted">
				<span className="text-amber-300">{fmt(t.prize_pool)}</span> prize
				{" · "}entry {Number(t.entry_fee) === 0 ? "Free" : fmt(t.entry_fee)}
			</p>

			{/* Creator controls — only for upcoming/ongoing */}
			{t.is_creator && (t.status === "upcoming" || t.status === "ongoing") && (
				<div className="pt-1 border-t theme-border space-y-2">
					<p className="text-[11px] text-purple-400">You created this tournament</p>

					{/* Current room details (if already set) */}
					{hasRoom && (
						<div className="rounded-md border border-yellow-500/30 bg-yellow-500/5 px-3 py-2 space-y-1">
							<p className="text-[11px] text-yellow-400 font-medium">Current room details</p>
							{t.room_id && <p className="text-xs theme-text">ID: <span className="font-mono text-yellow-300">{t.room_id}</span></p>}
							{t.room_password && <p className="text-xs theme-text">Password: <span className="font-mono text-yellow-300">{t.room_password}</span></p>}
						</div>
					)}

					{t.status === "upcoming" && (
						<StartTournamentModal tournament={t} onStarted={onFinished} showToast={showToast} />
					)}
					{t.status === "ongoing" && (
						<FinishTournamentModal tournament={t} onFinished={onFinished} showToast={showToast} />
					)}
				</div>
			)}

			{/* Completed — show result badge + raise issue */}
			{t.status === "completed" && canRaiseIssue && (
				<div className="pt-1 border-t theme-border flex items-center justify-between gap-2 flex-wrap">
					<span className="text-[11px] theme-text-muted border theme-border px-2 py-0.5 rounded-full">
						completed
					</span>
					<RaiseIssueModal tournament={t} onRaised={onFinished} showToast={showToast} />
				</div>
			)}

			{/* Non-creator registered player view */}
			{t.is_registered && !t.is_creator && t.status !== "completed" ? (
				<div className="space-y-2">
					<div className="w-full rounded-md border border-emerald-500/40 text-emerald-400 text-xs py-2 text-center">
						Registered ✓
					</div>
					{hasRoom && (
						<button
							onClick={() => setShowDetails(true)}
							className="w-full rounded-md border border-yellow-500/50 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-300 text-xs py-2 transition-colors font-medium"
						>
							🔑 View Room Details
						</button>
						)}
					{!hasRoom && (t.status === "upcoming" || t.status === "ongoing") && (
						<p className="text-center text-[11px] theme-text-muted">Room details not set yet — check back soon.</p>
						)}
				</div>
			) : !t.is_creator && t.status !== "completed" ? (
				<button
					onClick={onJoin}
					disabled={joining}
					className="w-full rounded-md bg-purple-600/90 hover:bg-purple-500 text-xs py-2 text-white transition-colors disabled:opacity-50"
				>
					{joining ? "Joining…" : "Join now"}
				</button>
			) : null}

			{/* Room Details Modal */}
			{showDetails && (
				<div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4" onClick={() => setShowDetails(false)}>
					<div className="theme-bg-card theme-border rounded-xl p-6 w-full max-w-sm space-y-4" onClick={(e) => e.stopPropagation()}>
						<div>
							<h2 className="text-sm font-semibold theme-text">{t.name}</h2>
							<p className="text-[11px] theme-text-muted mt-0.5">{t.game} · {t.status}</p>
						</div>
						<div className="rounded-md border border-yellow-500/30 bg-yellow-500/5 px-4 py-3 space-y-3">
							<p className="text-[11px] text-yellow-400 font-semibold uppercase tracking-wide">🔑 Room Details</p>
							{t.room_id ? (
								<div className="space-y-1">
									<p className="text-[11px] theme-text-muted">Room ID</p>
									<p className="font-mono text-lg text-yellow-300 tracking-widest">{t.room_id}</p>
								</div>
							) : null}
							{t.room_password ? (
								<div className="space-y-1">
									<p className="text-[11px] theme-text-muted">Password</p>
									<p className="font-mono text-lg text-yellow-300 tracking-widest">{t.room_password}</p>
								</div>
							) : null}
						</div>
						<p className="text-[11px] theme-text-muted">These details are only visible to registered players. Do not share them.</p>
						<button
							onClick={() => setShowDetails(false)}
							className="w-full rounded-md border theme-border text-xs py-2 theme-text hover:bg-opacity-5 transition"
						>
							Close
						</button>
					</div>
				</div>
			)}
		</article>
	);
}

export default function TournamentsPage() {
	const router = useRouter();
	const { theme } = useTheme();
	const isDark = theme === 'dark';
	const [tournaments, setTournaments] = useState<Tournament[]>([]);
	const [loading, setLoading] = useState(true);
	const [gameFilter, setGameFilter] = useState<GameFilter>("All");
	const [joining, setJoining] = useState<number | null>(null);
	const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

	useEffect(() => {
		async function loadTournaments() {
			const res = await fetch("/api/tournaments");
			if (res.status === 401) {
				router.push("/login");
				return;
			}
			const data = await res.json();
			setTournaments(data.tournaments ?? []);
			setLoading(false);
		}
		
		void loadTournaments();
	}, [router]);

	async function load() {
		const res = await fetch("/api/tournaments");
		if (res.status === 401) {
			router.push("/login");
			return;
		}
		const data = await res.json();
		setTournaments(data.tournaments ?? []);
		setLoading(false);
	}

	function showToast(msg: string, ok: boolean) {
		setToast({ msg, ok });
		setTimeout(() => setToast(null), 3000);
	}

	async function handleJoin(id: number) {
		setJoining(id);
		const res = await fetch("/api/tournaments/join", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ tournament_id: id }),
		});
		const data = await res.json();
		setJoining(null);
		if (!res.ok) {
			showToast(data.error || "Failed to join", false);
			return;
		}
		showToast("Successfully joined!", true);
		void load();
	}

	const filtered =
		gameFilter === "All"
			? tournaments
			: tournaments.filter((t) => t.game === gameFilter);
	const live = filtered.filter((t) => t.status === "ongoing");
	const upcoming = filtered.filter((t) => t.status === "upcoming");
	const past = filtered.filter(
		(t) => t.status === "completed" || t.status === "cancelled"
	);

	if (loading) {
		return (
			<div className="min-h-screen theme-bg flex items-center justify-center">
				<p className="theme-text-muted text-sm animate-pulse">
					Loading tournaments…
				</p>
			</div>
		);
	}

	return (
		<div className="min-h-screen theme-bg theme-text">
			{/* Toast */}
			{toast && (
				<div className={`fixed top-4 right-4 z-50 px-4 py-2.5 rounded-lg text-sm font-medium shadow-lg ${
					toast.ok ? "bg-emerald-600 text-white" : "bg-red-600 text-white"
				}`}>{toast.msg}</div>
			)}

			<main className="px-4 py-8 md:px-8 md:py-10">
				<div className="max-w-6xl mx-auto space-y-8">
					<section>
						<div className="flex items-center justify-between mb-3">
							<h2 className="text-sm font-medium theme-text">Tournaments</h2>
							<div className="flex items-center gap-2">
								<SubmitTournamentModal onSubmitted={load} showToast={showToast} />
							</div>
						</div>

						{/* Filters */}
						<div className="rounded-lg theme-border theme-bg-card p-3 flex gap-2 items-center">
							<p className="text-sm theme-text-muted">Filter</p>
							<select
								value={gameFilter}
								onChange={(e) => setGameFilter(e.target.value as GameFilter)}
								className="theme-bg theme-border rounded px-2 py-1 text-sm theme-text"
							>
								{GAME_FILTERS.map((g) => <option key={g}>{g}</option>)}
							</select>
						</div>
					</section>

					{/* Live tournaments */}
					<section
						className="space-y-3"
						aria-label="Live tournaments"
					>
						<div className="flex items-center gap-2 text-sm">
							<h2 className="font-medium theme-text">Live now</h2>
							<span className="inline-flex items-center rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-medium text-red-400 border border-red-500/30">
								<span className="h-1.5 w-1.5 rounded-full bg-red-400 mr-1 animate-pulse" />
								LIVE
							</span>
						</div>
						{live.length === 0 ? (
							<p className="text-xs theme-text-muted rounded-lg theme-border theme-bg-card px-4 py-4">
								No live tournaments right now.
							</p>
						) : (
							<div className="grid md:grid-cols-2 gap-4">
								{live.map((t) => (
									<TournamentCard
										key={t.id}
										tournament={t}
										joining={joining === t.id}
										onJoin={() => handleJoin(t.id)}
										onFinished={() => void load()}
										showToast={showToast}
									/>
								))}
							</div>
						)}
					</section>

					{/* Upcoming tournaments */}
					<section
						className="space-y-3 "
						aria-label="Upcoming tournaments"
					>
						<h2 className="text-sm font-medium theme-text">Upcoming</h2>
						{upcoming.length === 0 ? (
							<p className="text-xs theme-text-muted rounded-lg theme-border theme-bg-card px-4 py-4">
								No upcoming tournaments.
							</p>
						) : (
							<div className="rounded-lg theme-border theme-bg-card divide-y divide-gray-800 text-xs">
								{upcoming.map((t) => (
									<article key={t.id} className="flex items-start justify-between px-4 py-3 gap-4">
										<div className="space-y-0.5">
											<p className="theme-text text-sm">{t.name}</p>
											<p className="text-[11px] theme-text-muted">{t.game} · starts {fmtDate(t.start_time)}</p>
											<p className="text-[11px] text-amber-300">{fmt(t.prize_pool)} prize · entry {Number(t.entry_fee) === 0 ? "Free" : fmt(t.entry_fee)}</p>
											<p className="text-[11px] theme-text-muted">{t.registered_count}{t.max_players ? ` / ${t.max_players}` : ""} registered</p>
										</div>
										<div className="flex flex-col gap-1.5 items-end shrink-0">
											{t.is_creator ? (
												<>
													<span className="text-[11px] text-purple-400 border border-purple-500/40 px-3 py-1.5 rounded-md whitespace-nowrap">Your tournament</span>
													<StartTournamentModal tournament={t} onStarted={() => void load()} showToast={showToast} />
												</>
											) : t.is_registered ? (
												<>
													<span className="text-[11px] text-emerald-400 border border-emerald-500/40 px-3 py-1.5 rounded-md whitespace-nowrap">Registered ✓</span>
													{(t.room_id || t.room_password) && <UpcomingRoomButton tournament={t} />}
												</>
											) : (
												<button
													onClick={() => handleJoin(t.id)}
													disabled={joining === t.id}
													className="rounded-md bg-purple-600/90 hover:bg-purple-500 px-3 py-1.5 text-[11px] text-white transition-colors whitespace-nowrap disabled:opacity-50"
												>
													{joining === t.id ? "Joining…" : "Join"}
												</button>
											)}
										</div>
									</article>
								))}
							</div>
						)}
					</section>

					{/* Past tournaments */}
					{past.length > 0 && (
						<section className="space-y-3">
							<h2 className="text-sm font-medium theme-text">Past</h2>
							<div className="rounded-lg theme-border theme-bg-card divide-y divide-gray-800 text-xs">
								{past.map((t) => (
									<article
										key={t.id}
										className="flex items-center justify-between px-4 py-3 gap-4"
										>
										<div className="space-y-0.5">
											<p className="theme-text-muted">{t.name}</p>
											<p className="text-[11px] theme-text-muted">
												{t.game} · ended {fmtDate(t.end_time)}
											</p>
											<p className="text-[11px] text-amber-300/60">
												{fmt(t.prize_pool)} prize pool
											</p>
										</div>
										<div className="flex flex-col items-end gap-1.5">
											<span
												className={`text-[11px] px-2 py-0.5 rounded-full border ${
													t.status === "completed"
														? "border-gray-700 text-gray-500"
														: "border-red-900/50 text-red-500/70"
												}`}
											>
												{t.status}
											</span>
											{t.status === "completed" && (t.is_registered || t.is_creator) && (
												<RaiseIssueModal
													tournament={t}
													onRaised={() => void load()}
													showToast={showToast}
												/>
											)}
										</div>
									</article>
								))}
							</div>
						</section>
					)}
					</div>
				</main>
			</div>
		);
}