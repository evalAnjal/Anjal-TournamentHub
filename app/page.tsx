import { getUserFromCookies } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const user = await getUserFromCookies();

  if (!user) redirect("/login");

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* Hero Section */}
      <section className="px-6 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            
            <p className="text-xl text-gray-300 font-rajdhani">
              Ready to dominate the battlefield?
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="text-center">
                <i className="fas fa-trophy text-3xl text-yellow-500 mb-2"></i>
                <div className="text-2xl font-bold">12</div>
                <div className="text-sm text-gray-400">Tournaments Won</div>
              </div>
            </div>
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="text-center">
                <i className="fas fa-fire text-3xl text-red-500 mb-2"></i>
                <div className="text-2xl font-bold">8</div>
                <div className="text-sm text-gray-400">Win Streak</div>
              </div>
            </div>
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="text-center">
                <i className="fas fa-coins text-3xl text-green-500 mb-2"></i>
                <div className="text-2xl font-bold">$2,450</div>
                <div className="text-sm text-gray-400">Total Earnings</div>
              </div>
            </div>
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="text-center">
                <i className="fas fa-chart-line text-3xl text-blue-500 mb-2"></i>
                <div className="text-2xl font-bold">1,247</div>
                <div className="text-sm text-gray-400">Global Rank</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Tournaments */}
      <section className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold font-orbitron">
              <i className="fas fa-broadcast-tower text-red-500 mr-3"></i>
              Live Tournaments
            </h2>
            <button className="text-purple-400 hover:text-purple-300 font-medium">
              View All <i className="fas fa-arrow-right ml-1"></i>
            </button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {[1, 2, 3].map((tournament) => (
              <div key={tournament} className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-purple-500 transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-red-500 font-medium">LIVE</span>
                  </div>
                  <div className="text-sm text-gray-400">24/32 Players</div>
                </div>
                
                <h3 className="text-xl font-bold mb-2">Valorant Championship #{tournament}</h3>
                <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                  <span><i className="fas fa-trophy mr-1"></i>Prize: $500</span>
                  <span><i className="fas fa-clock mr-1"></i>2h 15m left</span>
                </div>
                
                <button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 py-3 rounded-lg font-medium transition-colors">
                  Join Tournament
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold font-orbitron mb-6">
            <i className="fas fa-bolt text-yellow-500 mr-3"></i>
            Quick Actions
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <button className="bg-gray-800 hover:bg-gray-700 rounded-xl p-6 border border-gray-700 hover:border-blue-500 transition-colors text-left">
              <i className="fas fa-plus-circle text-3xl text-blue-500 mb-4"></i>
              <h3 className="font-bold mb-2">Create Tournament</h3>
              <p className="text-sm text-gray-400">Start your own competition</p>
            </button>

            <button className="bg-gray-800 hover:bg-gray-700 rounded-xl p-6 border border-gray-700 hover:border-green-500 transition-colors text-left">
              <i className="fas fa-search text-3xl text-green-500 mb-4"></i>
              <h3 className="font-bold mb-2">Find Match</h3>
              <p className="text-sm text-gray-400">Quick matchmaking</p>
            </button>

            <button className="bg-gray-800 hover:bg-gray-700 rounded-xl p-6 border border-gray-700 hover:border-purple-500 transition-colors text-left">
              <i className="fas fa-users text-3xl text-purple-500 mb-4"></i>
              <h3 className="font-bold mb-2">Join Team</h3>
              <p className="text-sm text-gray-400">Find your squad</p>
            </button>

            <button className="bg-gray-800 hover:bg-gray-700 rounded-xl p-6 border border-gray-700 hover:border-red-500 transition-colors text-left">
              <i className="fas fa-gamepad text-3xl text-red-500 mb-4"></i>
              <h3 className="font-bold mb-2">Practice Mode</h3>
              <p className="text-sm text-gray-400">Sharpen your skills</p>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}