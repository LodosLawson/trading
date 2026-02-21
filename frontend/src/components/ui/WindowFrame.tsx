'use client';

import React, { useState } from 'react';
import { DragControls } from 'framer-motion';

interface WindowFrameProps {
    title: string;
    children: React.ReactNode;
    onClose?: () => void;
    onFocus?: () => void;
    dragControls?: DragControls;
    className?: string;
}

export default function WindowFrame({
    title,
    children,
    onClose,
    onFocus,
    dragControls,
    className = '',
}: WindowFrameProps) {
    const [isMinimized, setIsMinimized] = useState(false);

    return (
        // Pure HTML — no motion.div, no layout prop, no competing drag
        <div
            className={`flex flex-col h-full w-full bg-[#111115]/95 backdrop-blur-xl border border-white/8 rounded-xl overflow-hidden relative select-none ${className}`}
            onPointerDown={onFocus}
        >
            {/* Title Bar — drag handle */}
            <div
                className="window-header shrink-0 h-9 bg-white/5 border-b border-white/5 flex items-center justify-between px-3 cursor-grab active:cursor-grabbing touch-none"
                onPointerDown={(e) => {
                    if (dragControls) {
                        e.preventDefault();
                        dragControls.start(e);
                    }
                }}
            >
                {/* Traffic Lights */}
                <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                        <button
                            onPointerDown={(e) => e.stopPropagation()}
                            onClick={onClose}
                            className="w-2.5 h-2.5 rounded-full bg-red-500/40 hover:bg-red-500 transition-colors"
                        />
                        <button
                            onPointerDown={(e) => e.stopPropagation()}
                            onClick={() => setIsMinimized((p) => !p)}
                            className="w-2.5 h-2.5 rounded-full bg-amber-500/40 hover:bg-amber-500 transition-colors"
                        />
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/40 opacity-40 cursor-not-allowed" />
                    </div>
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-2">
                        {title}
                    </span>
                </div>
            </div>

            {/* Content */}
            {!isMinimized && (
                <div className="flex-1 relative overflow-hidden bg-[#0a0a0f]/60">
                    {children}
                </div>
            )}
        </div>
    );
}
