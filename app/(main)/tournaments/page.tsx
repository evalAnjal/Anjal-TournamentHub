"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

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
};

const GAME_FILTERS = ["All", "Valorant", "PUBG"] as const;
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

function TournamentCard({
	tournament: t,
	joining,
	onJoin,
}: {
	tournament: Tournament;
	joining: boolean;
	onJoin: () => void;
}) {
	return (
		<article className="rounded-lg border border-gray-800 bg-[#0b0b11] p-4 space-y-3 text-xs">
			<div className="flex items-center justify-between">
				<div>
					<p className="text-gray-200 text-sm">{t.name}</p>
					<p className="text-[11px] text-gray-500">{t.game}</p>
				</div>
				<span className="text-[11px] text-gray-500">
					{t.registered_count}
					{t.max_players ? ` / ${t.max_players}` : ""} players
				</span>
			</div>
			{t.description && (
				<p className="text-gray-500 text-[11px]">{t.description}</p>
			)}
			<p className="text-gray-400">
				<span className="text-amber-300">{fmt(t.prize_pool)}</span> prize
				{" · "}entry{" "}
				{Number(t.entry_fee) === 0 ? "Free" : fmt(t.entry_fee)}
			</p>
			{t.is_registered ? (
				<div className="w-full rounded-md border border-emerald-500/40 text-emerald-400 text-xs py-2 text-center">
					Registered ✓
				</div>
			) : (
				<button
					onClick={onJoin}
					disabled={joining}
					className="w-full rounded-md bg-purple-600/90 hover:bg-purple-500 text-xs py-2 text-white transition-colors disabled:opacity-50"
				>
					{joining ? "Joining…" : "Join now"}
				</button>
			)}
		</article>
	);
}

export default function TournamentsPage() {
	const router = useRouter();
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
			<div className="min-h-screen bg-[#050509] flex items-center justify-center">
				<p className="text-gray-500 text-sm animate-pulse">
					Loading tournaments…
				</p>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-[#050509] text-gray-100">
			{toast && (
				<div
					className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg text-sm font-medium shadow-lg ${
						toast.ok ? "bg-emerald-600 text-white" : "bg-red-600 text-white"
					}`}
				>
					{toast.msg}
				</div>
			)}

			<main className="px-4 py-8 md:px-8 md:py-10">
				<div className="max-w-5xl mx-auto space-y-8">
					{/* Hero */}
					<header className="space-y-2">
						<p className="text-xs uppercase tracking-wide text-purple-400">
							Tournaments
						</p>
						<h1 className="text-2xl md:text-3xl font-semibold">
							Browse tournaments
						</h1>
						<p className="text-sm text-gray-400">
							Join live events or register for upcoming tournaments.
						</p>
					</header>

					{/* Filters */}
					<section
						className="flex flex-wrap items-center justify-between gap-3"
						aria-label="Filters"
					>
						<div className="flex flex-wrap gap-2">
							{GAME_FILTERS.map((g) => (
								<button
									key={g}
									onClick={() => setGameFilter(g)}
									className={`px-3 py-1.5 rounded-full border text-[11px] transition-colors ${
										gameFilter === g
											? "border-purple-500/60 bg-purple-600/20 text-purple-200"
											: "border-gray-700 text-gray-300 hover:border-purple-500/60 hover:bg-[#11111a]"
									}`}
								>
									{g}
								</button>
							))}
						</div>
						<span className="text-[11px] text-gray-500">
							{filtered.length} tournament
							{filtered.length !== 1 ? "s" : ""}
						</span>
					</section>

					{/* Live tournaments */}
					<section
						className="space-y-3"
						aria-label="Live tournaments"
					>
						<div className="flex items-center gap-2 text-sm">
							<h2 className="font-medium text-gray-300">Live now</h2>
							<span className="inline-flex items-center rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-medium text-red-400 border border-red-500/30">
								<span className="h-1.5 w-1.5 rounded-full bg-red-400 mr-1 animate-pulse" />
								LIVE
							</span>
						</div>
						{live.length === 0 ? (
							<p className="text-xs text-gray-500 rounded-lg border border-gray-800 bg-[#0b0b11] px-4 py-4">
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
									/>
								))}
							</div>
						)}
					</section>

					{/* Upcoming tournaments */}
					<section
						className="space-y-3"
						aria-label="Upcoming tournaments"
					>
						<h2 className="text-sm font-medium text-gray-300">Upcoming</h2>
						{upcoming.length === 0 ? (
							<p className="text-xs text-gray-500 rounded-lg border border-gray-800 bg-[#0b0b11] px-4 py-4">
								No upcoming tournaments.
							</p>
						) : (
							<div className="rounded-lg border border-gray-800 bg-[#0b0b11] divide-y divide-gray-800 text-xs">
								{upcoming.map((t) => (
									<article
										key={t.id}
										className="flex items-center justify-between px-4 py-3 gap-4"
									>
										<div className="space-y-0.5">
											<p className="text-gray-200 text-sm">{t.name}</p>
											<p className="text-[11px] text-gray-500">
												{t.game} · starts{" "}
												{fmtDate(t.start_time)}
											</p>
											<p className="text-[11px] text-amber-300">
												{fmt(t.prize_pool)} prize · entry{" "}
												{Number(t.entry_fee) === 0
													? "Free"
													: fmt(t.entry_fee)}
											</p>
											<p className="text-[11px] text-gray-500">
												{t.registered_count}
												{t.max_players ? ` / ${t.max_players}` : ""}{" "}
												registered
											</p>
										</div>
										{t.is_registered ? (
											<span className="text-[11px] text-emerald-400 border border-emerald-500/40 px-3 py-1.5 rounded-md whitespace-nowrap">
												Registered ✓
											</span>
										) : (
											<button
												onClick={() => handleJoin(t.id)}
												disabled={joining === t.id}
												className="rounded-md bg-purple-600/90 hover:bg-purple-500 px-3 py-1.5 text-[11px] text-white transition-colors whitespace-nowrap disabled:opacity-50"
											>
												{joining === t.id ? "Joining…" : "Join"}
											</button>
										)}
									</article>
								))}
							</div>
						)}
					</section>

					{/* Past tournaments */}
					{past.length > 0 && (
						<section className="space-y-3">
							<h2 className="text-sm font-medium text-gray-300">Past</h2>
							<div className="rounded-lg border border-gray-800 bg-[#0b0b11] divide-y divide-gray-800 text-xs">
								{past.map((t) => (
									<article
										key={t.id}
										className="flex items-center justify-between px-4 py-3 gap-4"
									>
										<div className="space-y-0.5">
											<p className="text-gray-400">{t.name}</p>
											<p className="text-[11px] text-gray-600">
												{t.game} · ended{" "}
												{fmtDate(t.end_time)}
											</p>
											<p className="text-[11px] text-amber-300/60">
												{fmt(t.prize_pool)} prize pool
											</p>
										</div>
										<span
											className={`text-[11px] px-2 py-0.5 rounded-full border ${
												t.status === "completed"
													? "border-gray-700 text-gray-500"
													: "border-red-900/50 text-red-500/70"
											}`}
										>
											{t.status}
										</span>
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