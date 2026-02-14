'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from '@/components/dashboard/Sidebar';

export default function AppShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isLandingPage = pathname === '/';

    return (
        <div className="flex">
            {!isLandingPage && <Sidebar />}
            <main className="flex-1 min-h-screen">
                {children}
            </main>
        </div>
    );
}
