import { getUserFromCookies } from "@/lib/auth";
import { redirect } from "next/navigation";

const PREFERENCES = [
  { id: 1, label: "Email notifications", value: "Tournament updates, match reminders" },
  { id: 2, label: "Region", value: "Asia" },
  { id: 3, label: "Primary game", value: "Valorant" },
] as const;

export default async function ProfilePage() {
  const user = await getUserFromCookies();
  if (!user) redirect("/login");

  return (
    <div className="min-h-screen bg-[#050509] text-gray-100">
      <main className="px-4 py-8 md:px-8 md:py-10">
        <div className="max-w-4xl mx-auto space-y-8">
          <header className="space-y-2">
            <p className="text-xs uppercase tracking-wide text-purple-400">Profile</p>
            <h1 className="text-2xl md:text-3xl font-semibold">Account settings</h1>
            <p className="text-sm text-gray-400">
              Manage your account info and preferences.
            </p>
          </header>

          <section className="grid gap-6 md:grid-cols-[1.2fr,1.8fr]" aria-label="Profile overview">
            <div className="rounded-lg border border-gray-800 bg-[#0b0b11] p-5 space-y-3 text-sm">
              <div>
                <p className="text-xs text-gray-400 mb-1">Name</p>
                <p className="text-gray-200">{user.name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Email</p>
                <p className="text-gray-200">{user.email}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">User ID</p>
                <p className="text-gray-400 text-xs select-all">#{user.id}</p>
              </div>
            </div>

            <div className="rounded-lg border border-gray-800 bg-[#0b0b11] p-5 space-y-4 text-xs">
              <h2 className="text-sm font-medium text-gray-300 mb-1">Preferences</h2>
              {PREFERENCES.map((pref) => (
                <div key={pref.id}>
                  <p className="text-gray-400 mb-0.5">{pref.label}</p>
                  <p className="text-gray-200">{pref.value}</p>
                </div>
              ))}
              <button className="mt-2 inline-flex items-center rounded-md border border-gray-700 px-3 py-1.5 text-[11px] text-gray-100 hover:border-purple-500 hover:bg-[#11111a] transition-colors">
                Edit preferences
              </button>
            </div>
          </section>

          <section className="space-y-3" aria-label="Security">
            <h2 className="text-sm font-medium text-gray-300">Security</h2>
            <div className="rounded-lg border border-gray-800 bg-[#0b0b11] p-5 space-y-3 text-xs">
              <p className="text-gray-400">
                Password: <span className="text-gray-200">Last changed 2 months ago</span>
              </p>
              <p className="text-gray-400">
                2FA: <span className="text-emerald-300">Enabled</span>
              </p>
              <button className="inline-flex items-center rounded-md border border-gray-700 px-3 py-1.5 text-[11px] text-gray-100 hover:border-amber-500 hover:bg-[#11111a] transition-colors">
                Manage security
              </button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}