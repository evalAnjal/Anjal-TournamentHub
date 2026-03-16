'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTheme } from './ThemeProvider';

export default function MobileBottomBar() {
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        if (data?.user?.role === 'admin') setIsAdmin(true);
      })
      .catch(() => {});
  }, []);

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/');

  const links = [
    { href: '/home',        icon: 'fa-home',    label: 'Home' },
    { href: '/tournaments', icon: 'fa-gamepad', label: 'Tournaments' },
    { href: '/wallet',      icon: 'fa-wallet',  label: 'Wallet' },
    { href: '/profile',     icon: 'fa-user',    label: 'Profile' },
    ...(isAdmin ? [{ href: '/admin', icon: 'fa-shield-halved', label: 'Admin' }] : []),
  ];

  return (
    <div
      className={`lg:hidden fixed bottom-0 left-0 right-0 border-t px-2 py-1 ${
        isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
      }`}
    >
      <div className="flex justify-around items-center">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={`flex flex-col items-center py-2 px-2 rounded-lg transition-colors ${
              isActive(l.href)
                ? 'text-purple-500 ' + (isDark ? 'bg-gray-800' : 'bg-purple-50')
                : isDark ? 'text-gray-400' : 'text-gray-500'
            }`}
          >
            <i className={`fas ${l.icon} text-lg mb-1`}></i>
            <span className="text-[10px]">{l.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}