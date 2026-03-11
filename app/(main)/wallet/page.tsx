import { getUserFromCookies } from "@/lib/auth";
import { redirect } from "next/navigation";

const BALANCE = {
  available: 245000,
  locked: 30000,
  currency: "NPR",
};

const TRANSACTIONS = [
  { id: 1, type: "Payout", amount: "-NPR 15,000", date: "Today", detail: "Bank withdrawal" },
  { id: 2, type: "Prize", amount: "+NPR 65,000", date: "Yesterday", detail: "Valorant Cup #3" },
  { id: 3, type: "Deposit", amount: "+NPR 5,000", date: "2 days ago", detail: "Top-up" },
] as const;

const SUMMARY = {
  lifetimeWinnings: "NPR 320,000",
  totalDeposits: "NPR 40,000",
  totalPayouts: "NPR 95,000",
};

const FILTERS = ["All", "Prize", "Deposit", "Payout"] as const;

export default async function WalletPage() {
  const user = await getUserFromCookies();
  if (!user) redirect("/login");

  return (
    <div className="min-h-screen bg-[#050509] text-gray-100">
      <main className="px-4 py-8 md:px-8 md:py-10">
        <div className="max-w-4xl mx-auto space-y-8">
          <header className="space-y-2">
            <p className="text-xs uppercase tracking-wide text-purple-400">Wallet</p>
            <h1 className="text-2xl md:text-3xl font-semibold">Your wallet</h1>
            <p className="text-sm text-gray-400">
              Track winnings, deposits and withdrawals.
            </p>
          </header>

          {/* Summary row */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs" aria-label="Wallet summary">
            <div className="rounded-lg border border-gray-800 bg-[#0b0b11] px-4 py-3">
              <p className="text-[11px] text-gray-400 mb-1">Lifetime winnings</p>
              <p className="text-sm font-semibold text-emerald-300">{SUMMARY.lifetimeWinnings}</p>
            </div>
            <div className="rounded-lg border border-gray-800 bg-[#0b0b11] px-4 py-3">
              <p className="text-[11px] text-gray-400 mb-1">Total deposits</p>
              <p className="text-sm font-semibold text-purple-300">{SUMMARY.totalDeposits}</p>
            </div>
            <div className="rounded-lg border border-gray-800 bg-[#0b0b11] px-4 py-3">
              <p className="text-[11px] text-gray-400 mb-1">Total payouts</p>
              <p className="text-sm font-semibold text-amber-300">{SUMMARY.totalPayouts}</p>
            </div>
          </section>

          <section className="grid gap-6 md:grid-cols-[1.4fr,1.6fr]" aria-label="Wallet overview">
            <div className="rounded-lg border border-gray-800 bg-[#0b0b11] p-5 space-y-4">
              <div>
                <p className="text-xs text-gray-400 mb-1">Available balance</p>
                <p className="text-3xl font-semibold text-emerald-300">
                  NPR {BALANCE.available.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Locked in tournaments</p>
                <p className="text-sm text-amber-300">
                  NPR {BALANCE.locked.toLocaleString()}
                </p>
              </div>
              <div className="flex gap-3 pt-1">
                <button className="flex-1 rounded-md bg-purple-600/90 hover:bg-purple-500 text-xs py-2.5 text-gray-50 transition-colors">
                  Add funds
                </button>
                <button className="flex-1 rounded-md border border-gray-700 hover:border-emerald-400/60 hover:bg-[#11111a] text-xs py-2.5 text-gray-100 transition-colors">
                  Withdraw
                </button>
              </div>
            </div>

            <div className="rounded-lg border border-gray-800 bg-[#0b0b11] p-5 space-y-3 text-xs">
              <h2 className="text-sm font-medium text-gray-300 mb-1">Limits & status</h2>
              <p className="text-gray-400">
                Daily withdrawal limit: <span className="text-gray-200">NPR 100,000</span>
              </p>
              <p className="text-gray-400">
                KYC status: <span className="text-emerald-300">Verified</span>
              </p>
              <p className="text-gray-500">
                Manage your payment methods and KYC in settings.
              </p>
            </div>
          </section>

          {/* Transactions */}
          <section className="space-y-3" aria-label="Transactions">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-medium text-gray-300">Recent transactions</h2>
              <div className="flex flex-wrap gap-1 text-[11px]">
                {FILTERS.map((f, idx) => (
                  <span
                    key={f}
                    className={`px-2 py-1 rounded-full border cursor-default ${
                      idx === 0
                        ? "border-purple-500/60 bg-purple-600/20 text-purple-100"
                        : "border-gray-700 text-gray-300"
                    }`}
                  >
                    {f}
                  </span>
                ))}
              </div>
            </div>
            <div className="rounded-lg border border-gray-800 bg-[#0b0b11] divide-y divide-gray-800 text-xs">
              {TRANSACTIONS.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="text-gray-200">{tx.type}</p>
                    <p className="text-[11px] text-gray-500">{tx.detail}</p>
                  </div>
                  <div className="text-right">
                    <p
                      className={
                        tx.amount.startsWith("+") ? "text-emerald-300" : "text-red-300"
                      }
                    >
                      {tx.amount}
                    </p>
                    <p className="text-[11px] text-gray-500">{tx.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}