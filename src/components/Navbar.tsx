"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export const Navbar = () => {
  const { data: session } = useSession();
  const avatarUrl = (session?.user as any)?.avatarUrl;
  const name = session?.user?.name || "";
  const initials = name
    ? name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-brand-bg/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0 flex items-center gap-2">
            <div className="w-8 h-8 rounded-brand-sm bg-brand-primary glow-primary flex items-center justify-center">
              <span className="text-brand-bg font-bold text-xs">WM</span>
            </div>
            <Link href="/" className="text-xl font-space font-bold tracking-tight text-white">
              Write<span className="text-brand-primary">Market</span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            {session ? (
              <>
                <Link href="/dashboard" className="text-brand-secondary hover:text-brand-primary transition-colors font-medium text-sm">
                  DASHBOARD
                </Link>
                <Link href="/profile" className="text-brand-secondary hover:text-brand-primary transition-colors font-medium text-sm">
                  PROFILE
                </Link>
                {/* Avatar circle — links to profile */}
                <Link href="/profile" className="flex-shrink-0">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={name}
                      className="w-8 h-8 rounded-full object-cover border-2 border-brand-primary ring-2 ring-brand-primary/20 hover:ring-brand-primary/50 transition-all"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-brand-primary flex items-center justify-center text-brand-bg text-xs font-bold ring-2 ring-brand-primary/20 hover:ring-brand-primary/50 transition-all">
                      {initials}
                    </div>
                  )}
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-brand-sm border border-white/10 text-xs font-bold tracking-widest transition-all uppercase"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-brand-secondary hover:text-brand-primary transition-colors font-medium text-sm tracking-wide">
                  LOG IN
                </Link>
                <Link
                  href="/register"
                  className="bg-brand-primary hover:bg-brand-primary/90 text-brand-bg px-5 py-2 rounded-brand-sm text-xs font-bold tracking-widest transition-all uppercase glow-primary"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
