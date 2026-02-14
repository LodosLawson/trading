'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from '@/components/dashboard/Sidebar';
import MobileNav from '@/components/layout/MobileNav';

export default function AppShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isLandingPage = pathname === '/';

    return (
        <div className="flex flex-col md:flex-row min-h-screen">
            {!isLandingPage && <Sidebar />}
            <main className={`flex-1 min-h-screen ${!isLandingPage ? 'pb-20 md:pb-0' : ''}`}>
                {children}
            </main>
            {!isLandingPage && <MobileNav />}
        </div>
    );
}
