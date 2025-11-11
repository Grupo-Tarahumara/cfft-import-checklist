'use client';

import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import Image from 'next/image';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-card/90 backdrop-blur-xl border-b border-border/50 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Image
                src="https://custom-images.strikinglycdn.com/res/hrscywv4p/image/upload/c_limit,fl_lossy,h_300,w_300,f_auto,q_auto/6088316/314367_858588.png"
                alt="Logo"
                width={40}
                height={40}
                className="relative object-contain"
              />
            </div>
            <div>
              <Link href="/dashboard" className="block group">
                <h1 className="text-lg font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent group-hover:from-primary group-hover:to-primary/70 transition-all duration-300">
                  CFFT Import
                </h1>
                <p className="text-xs text-muted-foreground font-medium">Quality Intelligence</p>
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {user && (
              <>
                <div className="flex items-center space-x-2 px-3 py-1.5 bg-muted/50 rounded border border-border/50">
                  <div className="w-7 h-7 bg-primary rounded flex items-center justify-center">
                    <svg className="w-3.5 h-3.5 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <p className="text-xs text-muted-foreground font-medium">Bienvenido</p>
                    <p className="text-xs font-semibold text-foreground">{user.username}</p>
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="group flex items-center space-x-1.5 bg-destructive hover:bg-destructive/90 text-destructive-foreground px-3 py-1.5 rounded transition-all duration-300 shadow-sm font-medium text-xs"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Salir</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
