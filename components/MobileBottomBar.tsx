'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function MobileBottomBar() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 px-4 py-2">
      <div className="flex justify-around items-center">
        {/* Home */}
        <Link href="/" className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
          isActive('/') ? 'text-purple-400 bg-gray-800' : 'text-gray-400'
        }`}>
          <i className="fas fa-home text-lg mb-1"></i>
          <span className="text-xs font-rajdhani">Home</span>
        </Link>

        {/* Matches */}
        <Link href="/tournaments" className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
          isActive('/matches') ? 'text-purple-400 bg-gray-800' : 'text-gray-400'
        }`}>
          <i className="fas fa-gamepad text-lg mb-1"></i>
          <span className="text-xs font-rajdhani">Matches</span>
        </Link>

        {/* Wallet */}
        <Link href="/wallet" className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
          isActive('/wallet') ? 'text-purple-400 bg-gray-800' : 'text-gray-400'
        }`}>
          <i className="fas fa-wallet text-lg mb-1"></i>
          <span className="text-xs font-rajdhani">Wallet</span>
        </Link>

        {/* Profile */}
        <Link href="/profile" className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
          isActive('/profile') ? 'text-purple-400 bg-gray-800' : 'text-gray-400'
        }`}>
          <i className="fas fa-user text-lg mb-1"></i>
          <span className="text-xs font-rajdhani">Profile</span>
        </Link>
      </div>
    </div>
  );
}