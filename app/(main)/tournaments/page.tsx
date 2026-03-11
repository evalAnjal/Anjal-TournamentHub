import { getUserFromCookies } from "@/lib/auth";
import { redirect } from "next/navigation";

const LIVE_TOURNAMENTS = [
	{
		id: 1,
		name: "Valorant Cup #1",
		game: "Valorant",
		players: "24 / 32",
		prize: "NPR 65,000",
		timeLeft: "2h 15m",
	},
	{
		id: 2,
		name: "PUBG Squad Showdown",
		game: "PUBG",
		players: "18 / 20",
		prize: "NPR 40,000",
		timeLeft: "45m",
	},
] as const;

const UPCOMING_TOURNAMENTS = [
	{
		id: 3,
		name: "Beginner 5v5 Cup",
		game: "Valorant",
		start: "Sat · 19:00 IST",
		prize: "NPR 25,000",
	},
	{
		id: 4,
		name: "Weekend Scrims",
		game: "PUBG",
		start: "Sun · 21:30 IST",
		prize: "NPR 30,000",
	},
	{
		id: 5,
		name: "Trios Rush",
		game: "PUBG",
		start: "Mon · 18:00 IST",
		prize: "NPR 50,000",
	},
] as const;

const GAME_FILTERS = ["All", "Valorant", "PUBG"] as const;

export default async function TournamentsPage() {
	const user = await getUserFromCookies();
	if (!user) redirect("/login");

	return (
		<div className="min-h-screen bg-[#050509] text-gray-100">
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
							Join live events or register for upcoming tournaments across Valorant
							and PUBG.
						</p>
					</header>

					{/* Filters */}
					<section
						className="flex flex-wrap items-center justify-between gap-3 text-xs"
						aria-label="Filters"
					>
						<div className="flex flex-wrap gap-2">
							{GAME_FILTERS.map((g, idx) => (
								<button
									key={g}
									className={`px-3 py-1.5 rounded-full border text-[11px] transition-colors ${
										idx === 0
											? "border-purple-500/60 bg-purple-600/20 text-purple-200"
											: "border-gray-700 text-gray-300 hover:border-purple-500/60 hover:bg-[#11111a]"
									}`}
								>
									{g}
								</button>
							))}
						</div>
						<span className="text-[11px] text-gray-500">
							Showing{" "}
							{LIVE_TOURNAMENTS.length + UPCOMING_TOURNAMENTS.length} tournaments
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
								<span className="h-1.5 w-1.5 rounded-full bg-red-400 mr-1" />
								LIVE
							</span>
						</div>
						{LIVE_TOURNAMENTS.length === 0 ? (
							<p className="text-xs text-gray-500 rounded-lg border border-gray-800 bg-[#0b0b11] px-4 py-4">
								No live tournaments at the moment. Check the upcoming section
								below.
							</p>
						) : (
							<div className="grid md:grid-cols-2 gap-4">
								{LIVE_TOURNAMENTS.map((t) => (
									<article
										key={t.id}
										className="rounded-lg border border-gray-800 bg-[#0b0b11] p-4 space-y-3 text-xs"
									>
										<div className="flex items-center justify-between">
											<div>
												<p className="text-gray-200 text-sm">{t.name}</p>
												<p className="text-[11px] text-gray-500">
													{t.game}
												</p>
											</div>
											<span className="text-[11px] text-gray-500">
												{t.players} players
											</span>
										</div>
										<p className="text-gray-400">
											<span className="text-amber-300">{t.prize}</span> prize ·{" "}
											<span className="text-gray-300">{t.timeLeft}</span>{" "}
											remaining
										</p>
										<button className="w-full rounded-md bg-purple-600/90 hover:bg-purple-500 text-xs py-2 text-gray-50 transition-colors">
											Join now
										</button>
									</article>
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
						<div className="rounded-lg border border-gray-800 bg-[#0b0b11] divide-y divide-gray-800 text-xs">
							{UPCOMING_TOURNAMENTS.map((t) => (
								<article
									key={t.id}
									className="flex items-center justify-between px-4 py-3 gap-4"
								>
									<div>
										<p className="text-gray-200">{t.name}</p>
										<p className="text-[11px] text-gray-500">
											{t.game} ·{" "}
											<span className="text-gray-300">{t.start}</span>
										</p>
										<p className="text-[11px] text-amber-300">
											{t.prize} prize pool
										</p>
									</div>
									<button className="rounded-md border border-gray-700 hover:border-purple-500 hover:bg-[#11111a] px-3 py-1.5 text-[11px] text-gray-100 transition-colors whitespace-nowrap">
										View details
									</button>
								</article>
							))}
						</div>
					</section>
				</div>
			</main>
		</div>
	);
}