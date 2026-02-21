'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthProvider'; // Import Auth
import { getUserSettings, DEFAULT_SETTINGS, UserSettings } from '@/lib/userSettings';

// ... icons ...

export default function AppShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const { user, signOut } = useAuth(); // Use Auth
    const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    React.useEffect(() => {
        const uid = user?.uid || 'guest';
        if (uid) {
            getUserSettings(uid).then(setSettings);
        }
    }, [user, pathname]); // Re-fetch on pathname change to catch updates if needed, though strictly settings update should trigger context. For now fetch on mount/nav.

    const navItems = [
        { name: 'Home', path: '/', icon: (/*...*/ <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /> /*...*/) },
        { name: 'Terminal', path: '/terminal', icon: (/*...*/ <path d="M4 6a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" /> /*...*/) },
        { name: 'News', path: '/news', icon: (/*...*/ <path d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /> /*...*/) },
        { name: 'Prices', path: '/prices', icon: (/*...*/ <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /> /*...*/) },
        { name: 'AI Chat', path: '/chat', icon: (/*...*/ <path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /> /*...*/) },
    ];

    const isPublicRoute = pathname === '/' || pathname?.startsWith('/auth');
    // In window mode on terminal: full-screen immersive — hide bottom nav
    const isWindowMode = pathname === '/terminal' && settings.layoutMode === 'window';

    if (isPublicRoute) {
        return <>{children}</>;
    }

    // Hide sidebar if in 'hidden' navigation mode
    const isSidebarHidden = settings.navigationMode === 'hidden';

    return (
        <div className="flex h-screen w-full overflow-hidden bg-[#050508]">
            {/* Desktop Sidebar (Left Rail) - Conditionally Rendered */}
            {!isSidebarHidden && (
                <aside className="hidden md:flex w-20 flex-col items-center py-6 border-r border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl z-50">
                    <Link href="/" className="mb-8 p-3 rounded-xl bg-blue-600/10 text-blue-500 hover:bg-blue-600 hover:text-white transition-all">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </Link>

                    <nav className="flex-1 flex flex-col gap-4 w-full px-2">
                        {navItems.map((item) => {
                            const isActive = pathname === item.path;
                            return (
                                <Link
                                    key={item.path}
                                    href={item.path}
                                    className={`relative flex flex-col items-center justify-center p-3 rounded-xl transition-all group ${isActive ? 'text-white bg-white/10' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                                >
                                    <svg className={`w-6 h-6 mb-1 ${isActive ? 'text-blue-400' : 'group-hover:text-blue-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                        {item.icon}
                                    </svg>
                                    <span className="text-[10px] font-medium">{item.name}</span>
                                    {isActive && <motion.div layoutId="activeNav" className="absolute left-0 w-1 h-8 bg-blue-500 rounded-r-full" />}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* User Profile / Auth Action */}
                    <div className="mt-auto px-2 w-full flex flex-col items-center gap-4">
                        {user ? (
                            <div className="group relative">
                                <button
                                    className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-violet-500 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-blue-500/20"
                                    title={user.displayName || user.email || 'User'}
                                >
                                    {user.photoURL ? (
                                        <img src={user.photoURL} alt="User" className="w-full h-full rounded-full object-cover" />
                                    ) : (
                                        (user.displayName?.[0] || user.email?.[0] || 'U').toUpperCase()
                                    )}
                                </button>
                                {/* Hover Menu */}
                                <div className="absolute left-full bottom-0 ml-4 w-32 bg-[#1a1a20] border border-white/10 rounded-xl p-2 shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 transform translate-x-[-10px] group-hover:translate-x-0">
                                    <div className="text-xs text-gray-400 px-2 py-1 mb-2 border-b border-white/5 truncate">
                                        {user.displayName || 'User'}
                                    </div>
                                    <button
                                        onClick={() => signOut()}
                                        className="w-full text-left px-2 py-1.5 text-xs text-red-400 hover:bg-white/5 rounded-lg flex items-center gap-2"
                                    >
                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                                        Sign Out
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <Link
                                href="/auth/login"
                                className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                                title="Sign In"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                </svg>
                            </Link>
                        )}
                    </div>
                </aside>
            )}

            {/* Main Content Area */}
            <main className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${isWindowMode ? 'pb-0' : 'pb-16 md:pb-0'}`}>
                {children}
            </main>

            {/* Mobile Navigation (Bottom Bar) — hidden in window mode */}
            <AnimatePresence>
                {!isWindowMode && (
                    <motion.div
                        key="mobile-nav"
                        initial={{ y: 0 }}
                        animate={{ y: 0 }}
                        exit={{ y: 80, opacity: 0 }}
                        transition={{ duration: 0.2, ease: 'easeInOut' }}
                        className="fixed bottom-0 left-0 right-0 md:hidden bg-[#0a0a0f]/95 backdrop-blur-xl border-t border-white/5 z-40"
                        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
                    >
                        <nav className="flex justify-around py-2">
                            {navItems.map((item) => {
                                const isActive = pathname === item.path;
                                return (
                                    <Link
                                        key={item.path}
                                        href={item.path}
                                        className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all ${isActive ? 'text-blue-400' : 'text-gray-400 hover:text-white'}`}
                                    >
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                            {item.icon}
                                        </svg>
                                        <span className="text-[10px] font-medium">{item.name}</span>
                                    </Link>
                                );
                            })}
                            {user ? (
                                <button
                                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                    className="flex flex-col items-center justify-center p-2 rounded-lg text-gray-400 hover:text-white"
                                >
                                    {user.photoURL ? (
                                        <img src={user.photoURL} alt="User" className="w-5 h-5 rounded-full object-cover" />
                                    ) : (
                                        <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-blue-500 to-violet-500 flex items-center justify-center text-white text-[10px] font-bold">
                                            {(user.displayName?.[0] || user.email?.[0] || 'U').toUpperCase()}
                                        </div>
                                    )}
                                    <span className="text-[10px] font-medium">Me</span>
                                </button>
                            ) : (
                                <Link
                                    href="/auth/login"
                                    className="flex flex-col items-center justify-center p-2 rounded-lg text-gray-400 hover:text-white"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                    </svg>
                                    <span className="text-[10px] font-medium">Sign In</span>
                                </Link>
                            )}
                        </nav>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Mobile User Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && user && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="fixed bottom-16 left-0 right-0 bg-[#1a1a20] border-t border-white/10 p-4 shadow-lg md:hidden z-50"
                    >
                        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/5">
                            {user.photoURL ? (
                                <img src={user.photoURL} alt="User" className="w-10 h-10 rounded-full object-cover" />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-violet-500 flex items-center justify-center text-white font-bold text-sm">
                                    {(user.displayName?.[0] || user.email?.[0] || 'U').toUpperCase()}
                                </div>
                            )}
                            <div>
                                <p className="text-white font-medium">{user.displayName || 'User'}</p>
                                <p className="text-gray-400 text-sm">{user.email}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => { signOut(); setIsMobileMenuOpen(false); }}
                            className="w-full text-left px-3 py-2 text-red-400 hover:bg-white/5 rounded-lg flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                            Sign Out
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
