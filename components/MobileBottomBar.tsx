'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function MobileBottomBar() {
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);

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
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 px-2 py-1">
      <div className="flex justify-around items-center">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={`flex flex-col items-center py-2 px-2 rounded-lg transition-colors ${
              isActive(l.href) ? 'text-purple-400 bg-gray-800' : 'text-gray-400'
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