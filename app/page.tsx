import { getUserFromCookies } from "@/lib/auth";
import { redirect } from "next/navigation";

const STATS = [
  { id: "won", label: "Tournaments won", value: "12", color: "text-purple-300" },
  { id: "streak", label: "Win streak", value: "8", color: "text-emerald-300" },
  { id: "earnings", label: "Total earnings", value: "$2,450", color: "text-amber-300" },
  { id: "rank", label: "Global rank", value: "1,247", color: "text-sky-300" },
] as const;

const LIVE_TOURNAMENTS = [
  { id: 1, name: "Valorant Cup #1", players: "24 / 32 players", prize: "$500", timeLeft: "2h 15m" },
  { id: 2, name: "Valorant Cup #2", players: "18 / 32 players", prize: "$300", timeLeft: "45m" },
  { id: 3, name: "Valorant Cup #3", players: "30 / 32 players", prize: "$750", timeLeft: "3h 05m" },
] as const;

const RECENT_MATCHES = [
  { id: 1, game: "Valorant", result: "Win" as const, score: "13 - 9", date: "Today" },
  { id: 2, game: "CS2", result: "Loss" as const, score: "10 - 13", date: "Yesterday" },
  { id: 3, game: "Apex Legends", result: "Top 3" as const, score: "Squad", date: "2 days ago" },
] as const;

const RECOMMENDED_TOURNAMENTS = [
  { id: 1, title: "Beginner 5v5 Cup", game: "Valorant", skill: "Bronze - Gold" },
  { id: 2, title: "Weekend Rush", game: "Apex Legends", skill: "All ranks" },
] as const;

const FRIENDS_TEAMS = [
  { id: 1, name: "Team Phoenix", status: "Scrim tonight", color: "text-purple-300" },
  { id: 2, name: "RogueSniper", status: "Online", color: "text-emerald-300" },
  { id: 3, name: "ClutchKing", status: "In match", color: "text-amber-300" },
] as const;

const ACTIVITY_ITEMS = [
  "Joined Valorant Cup #3",
  "Withdrew $120 to UPI",
  "New friend request from GhostRider",
  "Completed placement matches",
] as const;

export default async function HomePage() {
  const user = await getUserFromCookies();
  console.log(user)

  if (!user) redirect("/login");

  return (
    <div className="min-h-screen bg-[#050509] text-gray-100">
      <main className="px-4 py-8 md:px-8 md:py-10">
        <div className="max-w-6xl mx-auto space-y-10">
          {/* Header */}
          <header className="space-y-2">
            <p className="text-xs uppercase tracking-wide text-purple-400">GameHub Dashboard</p>
            <h1 className="text-2xl md:text-3xl font-semibold">
              Welcome back, <span className="text-purple-300">{user.name!}</span>
            </h1>
            <p className="text-sm text-gray-400">
              Track your performance, follow live tournaments, and jump back into your matches.
            </p>
          </header>

          {/* Top grid: Stats + Overview */}
          <section className="grid gap-6 lg:grid-cols-[2fr,1.3fr]" aria-label="Overview">
            {/* Stats */}
            <div>
              <h2 className="text-sm font-medium text-gray-300 mb-3">Your stats</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {STATS.map((stat) => (
                  <div key={stat.id} className="rounded-lg border border-gray-800 bg-[#0b0b11] p-4">
                    <p className="text-xs text-gray-400 mb-1">{stat.label}</p>
                    <p className={`text-xl font-semibold ${stat.color}`}>{stat.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Compact overview card */}
            <aside className="rounded-lg border border-gray-800 bg-[#0b0b11] p-4 space-y-3">
              <h2 className="text-sm font-medium text-gray-300">Today</h2>
              <p className="text-xs text-gray-400">
                You have <span className="text-purple-300 font-medium">2 live tournaments</span> and
                <span className="text-emerald-300 font-medium"> 3 pending invites</span>.
              </p>
              <div className="flex items-center justify-between text-xs text-gray-400">
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-gray-500">Next match</p>
                  <p className="text-gray-200">Valorant · 18:30 IST</p>
                </div>
                <button className="rounded-md bg-purple-600/90 hover:bg-purple-500 px-3 py-1.5 text-[11px] text-gray-50 transition-colors">
                  View schedule
                </button>
              </div>
            </aside>
          </section>

          {/* Live Tournaments */}
          <section aria-label="Live tournaments" className="space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-medium text-gray-300">Live tournaments</h2>
                <span className="inline-flex items-center rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-medium text-red-400 border border-red-500/30">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-400 mr-1" />
                  LIVE
                </span>
              </div>
              <button className="text-xs text-purple-300 hover:text-purple-200 transition-colors">View all</button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {LIVE_TOURNAMENTS.map((t) => (
                <article key={t.id} className="rounded-lg border border-gray-800 bg-[#0b0b11] p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-200">{t.name}</span>
                    <span className="text-gray-500">{t.players}</span>
                  </div>
                  <p className="text-xs text-gray-400">
                    <span className="text-amber-300">{t.prize}</span> prize ·{" "}
                    <span className="text-gray-300">{t.timeLeft}</span> remaining
                  </p>
                  <button className="w-full rounded-md bg-purple-600/90 hover:bg-purple-500 text-xs py-2 text-gray-50 transition-colors">
                    Join tournament
                  </button>
                </article>
              ))}
            </div>
          </section>

          {/* Middle grid: Recent matches + Recommendations */}
          <section className="grid gap-6 lg:grid-cols-[1.6fr,1.4fr]" aria-label="Matches and recommendations">
            {/* Recent matches */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <h2 className="font-medium text-gray-300">Recent matches</h2>
                <button className="text-xs text-gray-400 hover:text-gray-200 transition-colors">
                  View match history
                </button>
              </div>
              <div className="rounded-lg border border-gray-800 bg-[#0b0b11] divide-y divide-gray-800">
                {RECENT_MATCHES.map((match) => (
                  <div key={match.id} className="flex items-center justify-between px-4 py-3 text-xs">
                    <div>
                      <p className="text-gray-200">{match.game}</p>
                      <p className="text-[11px] text-gray-500">{match.date}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <p
                        className={
                          "text-[11px] px-2 py-0.5 rounded-full " +
                          (match.result === "Win"
                            ? "bg-emerald-500/10 text-emerald-300"
                            : match.result === "Loss"
                            ? "bg-red-500/10 text-red-300"
                            : "bg-sky-500/10 text-sky-300")
                        }
                      >
                        {match.result}
                      </p>
                      <p className="text-gray-300 text-xs">{match.score}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommended tournaments */}
            <div className="space-y-3">
              <h2 className="text-sm font-medium text-gray-300">Recommended for you</h2>
              <div className="rounded-lg border border-gray-800 bg-[#0b0b11] p-4 space-y-3">
                {RECOMMENDED_TOURNAMENTS.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between text-xs py-2 first:pt-0 last:pb-0"
                  >
                    <div>
                      <p className="text-gray-200">{t.title}</p>
                      <p className="text-[11px] text-gray-500">
                        {t.game} · {t.skill}
                      </p>
                    </div>
                    <button className="rounded-md border border-gray-700 px-3 py-1 text-[11px] text-gray-100 hover:border-purple-500 hover:bg-[#11111a] transition-colors">
                      View
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Bottom grid: Quick actions + Friends/Teams + Activity */}
          <section className="grid gap-6 lg:grid-cols-[1.3fr,1.7fr]" aria-label="Actions and activity">
            {/* Quick Actions */}
            <div className="space-y-3">
              <h2 className="text-sm font-medium text-gray-300">Quick actions</h2>
              <div className="grid md:grid-cols-2 gap-3">
                <button className="rounded-lg border border-gray-800 bg-[#0b0b11] p-4 text-left hover:border-purple-500/40 hover:bg-[#11111a] transition-colors">
                  <p className="text-sm font-medium text-gray-100 mb-1">Create tournament</p>
                  <p className="text-xs text-gray-400">Set up a new competition.</p>
                </button>
                <button className="rounded-lg border border-gray-800 bg-[#0b0b11] p-4 text-left hover-border-sky-500/40 hover:bg-[#11111a] transition-colors">
                  <p className="text-sm font-medium text-gray-100 mb-1">Find match</p>
                  <p className="text-xs text-gray-400">Search for an active match.</p>
                </button>
                <button className="rounded-lg border border-gray-800 bg-[#0b0b11] p-4 text-left hover:border-emerald-500/40 hover:bg-[#11111a] transition-colors">
                  <p className="text-sm font-medium text-gray-100 mb-1">Join team</p>
                  <p className="text-xs text-gray-400">Look for teams recruiting.</p>
                </button>
                <button className="rounded-lg border border-gray-800 bg-[#0b0b11] p-4 text-left hover:border-amber-500/40 hover:bg-[#11111a] transition-colors">
                  <p className="text-sm font-medium text-gray-100 mb-1">Practice mode</p>
                  <p className="text-xs text-gray-400">Play unranked practice games.</p>
                </button>
              </div>
            </div>

            {/* Friends / Teams & Activity */}
            <div className="grid gap-4 md:grid-cols-2">
              {/* Friends & teams */}
              <div className="space-y-3">
                <h2 className="text-sm font-medium text-gray-300">Friends & teams</h2>
                <div className="rounded-lg border border-gray-800 bg-[#0b0b11] divide-y divide-gray-800">
                  {FRIENDS_TEAMS.map((member) => (
                    <div
                      key={member.id}
                      className="px-4 py-3 flex items-center justify-between text-xs"
                    >
                      <div>
                        <p className="text-gray-200">{member.name}</p>
                        <p className="text-[11px] text-gray-500">{member.status}</p>
                      </div>
                      <span
                        className={`h-2 w-2 rounded-full ${member.color.replace("text-", "bg-")}`}
                      ></span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Activity timeline */}
              <div className="space-y-3">
                <h2 className="text-sm font-medium text-gray-300">Recent activity</h2>
                <div className="rounded-lg border border-gray-800 bg-[#0b0b11] p-4 space-y-3 text-xs">
                  {ACTIVITY_ITEMS.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-purple-400" />
                      <p className="text-gray-300">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}