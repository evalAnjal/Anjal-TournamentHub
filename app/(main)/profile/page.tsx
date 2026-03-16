'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ProfileThemeSection from '@/components/ProfileThemeSection';
import { useTheme } from '@/components/ThemeProvider';

const PREFERENCES = [
	{
		id: 1,
		label: "Email notifications",
		value: "Tournament updates, match reminders",
	},
	{ id: 2, label: "Region", value: "Asia" },
	{ id: 3, label: "Primary game", value: "Valorant" },
] as const;

interface UserInfo {
	id: number;
	name: string;
	email: string;
	role: string;
}

export default function ProfilePage() {
	const router = useRouter();
	const { theme } = useTheme();
	const isDark = theme === "dark";

	const [user, setUser] = useState<UserInfo | null>(null);

	useEffect(() => {
		fetch("/api/auth/me")
			.then((r) => (r.ok ? r.json() : null))
			.then((data) => {
				if (!data?.user) { router.replace('/login'); return; }
				setUser(data.user);
			})
			.catch(() => router.replace('/login'));
	}, [router]);

	if (!user) {
		return (
			<div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-[#050509]' : 'bg-gray-50'}`}>
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
			</div>
		);
	}

	// Derived classes
	const bg = isDark ? "bg-[#050509]" : "bg-gray-50";
	const card = isDark ? "bg-[#0b0b11]" : "bg-white";
	const border = isDark ? "border-gray-800" : "border-gray-200";
	const txt1 = isDark ? "text-gray-100" : "text-gray-900";
	const txt2 = isDark ? "text-gray-400" : "text-gray-500";
	const txt3 = isDark ? "text-gray-200" : "text-gray-700";
	const btnBase = `text-xs border px-3 py-1.5 rounded-md transition ${isDark ? 'border-gray-700 hover:bg-[#11111a]' : 'border-gray-300 hover:bg-gray-100'}`;

	return (
		<div className={`min-h-screen ${bg} ${txt1}`}>
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
							<p className={`text-sm ${txt2} mt-1`}>
								Manage your account information and preferences.
							</p>
						</div>

						<button className={`${btnBase} hover:border-purple-500`}>
							Edit profile
						</button>
					</header>

					{/* PROFILE CARD */}
					<section className="grid gap-6 md:grid-cols-[1.1fr,1.9fr]">
						{/* USER INFO */}
						<div className={`rounded-xl border ${border} ${card} p-6 space-y-5`}>
							<div className="flex items-center gap-4">
								<div className="h-12 w-12 rounded-full bg-linear-to-br from-purple-500 to-indigo-500 flex items-center justify-center font-semibold text-white">
									{user.name.charAt(0)}
								</div>

								<div>
									<p className={`text-sm font-medium ${txt1}`}>{user.name}</p>
									<p className={`text-xs ${txt2}`}>{user.email}</p>
								</div>
							</div>

							<div className={`border-t ${border} pt-4 space-y-3 text-sm`}>
								<div>
									<p className={`text-xs ${txt2} mb-1`}>User ID</p>
									<p className={`${txt3} text-xs select-all`}>#{user.id}</p>
								</div>

								<div>
									<p className={`text-xs ${txt2} mb-1`}>Account type</p>
									<p className={txt3}>{user.role === 'admin' ? 'Administrator' : 'Standard'}</p>
								</div>

								<div>
									<p className={`text-xs ${txt2} mb-1`}>Member since</p>
									<p className={txt3}>March 2026</p>
								</div>
							</div>
						</div>

						{/* PREFERENCES */}
						<div className={`rounded-xl border ${border} ${card} p-6`}>
							<div className="flex items-center justify-between mb-5">
								<h2 className={`text-sm font-medium ${txt3}`}>Preferences</h2>

								<button className={`${btnBase} hover:border-purple-500`}>
									Edit
								</button>
							</div>

							<div className="space-y-4 text-sm">
								{/* Theme toggle row */}
								<ProfileThemeSection />

								{PREFERENCES.map((pref) => (
									<div
										key={pref.id}
										className={`flex justify-between items-center border-b ${border} pb-3`}
									>
										<p className={txt2}>{pref.label}</p>
										<p className={txt3}>{pref.value}</p>
									</div>
								))}
							</div>
						</div>
					</section>

					{/* SECURITY */}
					<section>
						<h2 className={`text-sm font-medium ${txt3} mb-4`}>Security</h2>

						<div className={`rounded-xl border ${border} ${card} p-6 space-y-4 text-sm`}>
							<div className="flex justify-between items-center">
								<div>
									<p className={txt2}>Password</p>
									<p className={`${txt3} text-xs`}>Last changed 2 months ago</p>
								</div>

								<button className={`${btnBase} hover:border-amber-500`}>
									Change
								</button>
							</div>

							<div className="flex justify-between items-center">
								<div>
									<p className={txt2}>Two-Factor Authentication</p>
									<p className="text-emerald-400 text-xs">Enabled</p>
								</div>

								<button className={`${btnBase} hover:border-purple-500`}>
									Manage
								</button>
							</div>

							<div className="flex justify-between items-center">
								<div>
									<p className={txt2}>Active sessions</p>
									<p className={`${txt3} text-xs`}>2 devices currently logged in</p>
								</div>

								<button className={`${btnBase} hover:border-red-500`}>
									View sessions
								</button>
							</div>
						</div>
					</section>

					{/* LOGOUT */}
					<section className="pt-2">
						<div className={`flex items-center justify-between rounded-xl ${card} px-4 py-3 text-sm`}>
							<div>
								<p className={`font-medium ${txt1}`}>Sign out</p>
								<p className={`text-xs ${txt2}`}>
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