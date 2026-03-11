import { getUserFromCookies, UserJwtPayload } from "@/lib/auth";
import { redirect } from "next/navigation";

const PREFERENCES = [
	{
		id: 1,
		label: "Email notifications",
		value: "Tournament updates, match reminders",
	},
	{ id: 2, label: "Region", value: "Asia" },
	{ id: 3, label: "Primary game", value: "Valorant" },
] as const;

export default async function ProfilePage() {
	const user = (await getUserFromCookies()) as UserJwtPayload | null;
	if (!user) redirect("/login");

	return (
		<div className="min-h-screen bg-[#050509] text-gray-100">
			<main className="px-4 py-10 md:px-8">
				<div className="max-w-5xl mx-auto space-y-10">
					{/* HEADER */}
					<header className="flex items-center justify-between">
						<div>
							<p className="text-xs uppercase tracking-widest text-purple-400">
								Profile
							</p>
							<h1 className="text-3xl font-semibold mt-1">
								Account settings
							</h1>
							<p className="text-sm text-gray-400 mt-1">
								Manage your account information and preferences.
							</p>
						</div>

						<button className="text-xs border border-gray-700 px-4 py-2 rounded-md hover:border-purple-500 hover:bg-[#11111a] transition">
							Edit profile
						</button>
					</header>

					{/* PROFILE CARD */}
					<section className="grid gap-6 md:grid-cols-[1.1fr,1.9fr]">
						{/* USER INFO */}
						<div className="rounded-xl border border-gray-800 bg-[#0b0b11] p-6 space-y-5">
							<div className="flex items-center gap-4">
								<div className="h-12 w-12 rounded-full bg-linear-to-br from-purple-500 to-indigo-500 flex items-center justify-center font-semibold">
									{user.name.charAt(0)}
								</div>

								<div>
									<p className="text-sm font-medium">{user.name}</p>
									<p className="text-xs text-gray-400">{user.email}</p>
								</div>
							</div>

							<div className="border-t border-gray-800 pt-4 space-y-3 text-sm">
								<div>
									<p className="text-xs text-gray-400 mb-1">User ID</p>
									<p className="text-gray-300 text-xs select-all">#{user.id}</p>
								</div>

								<div>
									<p className="text-xs text-gray-400 mb-1">Account type</p>
									<p className="text-gray-200">Standard</p>
								</div>

								<div>
									<p className="text-xs text-gray-400 mb-1">Member since</p>
									<p className="text-gray-200">March 2026</p>
								</div>
							</div>
						</div>

						{/* PREFERENCES */}
						<div className="rounded-xl border border-gray-800 bg-[#0b0b11] p-6">
							<div className="flex items-center justify-between mb-5">
								<h2 className="text-sm font-medium text-gray-300">
									Preferences
								</h2>

								<button className="text-xs border border-gray-700 px-3 py-1.5 rounded-md hover:border-purple-500 hover:bg-[#11111a] transition">
									Edit
								</button>
							</div>

							<div className="space-y-4 text-sm">
								{PREFERENCES.map((pref) => (
									<div
										key={pref.id}
										className="flex justify-between items-center border-b border-gray-800 pb-3"
									>
										<p className="text-gray-400">{pref.label}</p>
										<p className="text-gray-200">{pref.value}</p>
									</div>
								))}
							</div>
						</div>
					</section>

					{/* SECURITY */}
					<section>
						<h2 className="text-sm font-medium text-gray-300 mb-4">
							Security
						</h2>

						<div className="rounded-xl border border-gray-800 bg-[#0b0b11] p-6 space-y-4 text-sm">
							<div className="flex justify-between items-center">
								<div>
									<p className="text-gray-400">Password</p>
									<p className="text-gray-200 text-xs">
										Last changed 2 months ago
									</p>
								</div>

								<button className="text-xs border border-gray-700 px-3 py-1.5 rounded-md hover:border-amber-500 hover:bg-[#11111a] transition">
									Change
								</button>
							</div>

							<div className="flex justify-between items-center">
								<div>
									<p className="text-gray-400">Two-Factor Authentication</p>
									<p className="text-emerald-400 text-xs">Enabled</p>
								</div>

								<button className="text-xs border border-gray-700 px-3 py-1.5 rounded-md hover:border-purple-500 hover:bg-[#11111a] transition">
									Manage
								</button>
							</div>

							<div className="flex justify-between items-center">
								<div>
									<p className="text-gray-400">Active sessions</p>
									<p className="text-gray-200 text-xs">
										2 devices currently logged in
									</p>
								</div>

								<button className="text-xs border border-gray-700 px-3 py-1.5 rounded-md hover:border-red-500 hover:bg-[#11111a] transition">
									View sessions
								</button>
							</div>
						</div>
					</section>

					{/* Logout / Danger zone */}
					<section className="pt-2">
						<div className="flex items-center justify-between rounded-xl bg-[#0b0b11] px-4 py-3 text-sm">
							<div className="text-gray-400">
								<p className="font-medium text-gray-200">Sign out</p>
								<p className="text-xs text-gray-500">
									Log out from this device by clearing your session cookie.
								</p>
							</div>
							<form action="/api/logout" method="post">
								<button
									type="submit"
									className="text-xs border border-red-500/70 text-red-300 px-3 py-1.5 rounded-md hover:bg-red-500/10 transition"
								>
									Log out
								</button>
							</form>
						</div>
					</section>
				</div>
			</main>
		</div>
	);
}