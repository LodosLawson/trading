'use client';

import React, { useEffect, useRef } from 'react';
import { motion, DragControls, useDragControls, useMotionValue } from 'framer-motion';

interface WidgetContainerProps {
    widgetId: string;
    settings: any;
    isEditing: boolean;
    isMobile: boolean;
    colSpan: number;
    rowSpan: number;
    index: number;
    activeWindow: string | null;
    setActiveWindow: (id: string) => void;
    updateWindowPosition: (id: string, x: number, y: number) => void;
    onRemove: (id: string) => void;
    onResize: (id: string, dx: number, dy: number) => void;
    children: (dragControls: DragControls) => React.ReactNode;
}

export default function WidgetContainer({
    widgetId,
    settings,
    isEditing,
    isMobile,
    colSpan,
    rowSpan,
    index,
    activeWindow,
    setActiveWindow,
    updateWindowPosition,
    onRemove,
    onResize,
    children
}: WidgetContainerProps) {
    const dragControls = useDragControls();

    const config = settings.widgets[widgetId] || { visible: true };
    const winCfg = config.window || {
        x: 80 + (index * 40),
        y: 80 + (index * 40),
        w: 520,
        h: 420,
        z: 10 + index
    };

    const isWindow = settings.layoutMode === 'window';

    // Stable motion values — these do NOT reset on re-render.
    // They are the single source of truth for the window's position.
    const x = useMotionValue(winCfg.x);
    const y = useMotionValue(winCfg.y);

    // Sync from external config changes (e.g., when config first loaded from Firebase)
    // Only sync if the difference is significant (avoid fighting active drag)
    const lastSavedX = useRef(winCfg.x);
    const lastSavedY = useRef(winCfg.y);
    const lastSavedW = useRef(winCfg.w);
    const lastSavedH = useRef(winCfg.h);

    useEffect(() => {
        if (!isWindow) return;
        // Only teleport if the config changed meaningfully from outside
        const xDiff = Math.abs(winCfg.x - lastSavedX.current);
        const yDiff = Math.abs(winCfg.y - lastSavedY.current);
        if (xDiff > 2 || yDiff > 2) {
            x.set(winCfg.x);
            y.set(winCfg.y);
            lastSavedX.current = winCfg.x;
            lastSavedY.current = winCfg.y;
        }
    }, [winCfg.x, winCfg.y, isWindow]);

    const isActive = activeWindow === widgetId;
    const zIndex = isActive ? 100 : (winCfg.z || 1);

    if (isWindow) {
        return (
            <motion.div
                key={widgetId}
                drag
                dragListener={false}
                dragControls={dragControls}
                dragMomentum={false}
                dragElastic={0}
                onMouseDown={() => setActiveWindow(widgetId)}
                onDragEnd={() => {
                    // Save the ABSOLUTE position after drag ends
                    const newX = x.get();
                    const newY = y.get();
                    lastSavedX.current = newX;
                    lastSavedY.current = newY;
                    updateWindowPosition(widgetId, newX, newY);
                }}
                style={{
                    x,
                    y,
                    width: winCfg.w,
                    height: winCfg.h,
                    position: 'absolute',
                    zIndex,
                }}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.15 }}
                className="group rounded-2xl border border-white/10 bg-[#111115] shadow-2xl overflow-hidden"
            >
                <div className="h-full w-full">
                    {children(dragControls)}
                </div>
            </motion.div>
        );
    }

    // Grid / List mode
    return (
        <motion.div
            layout
            key={widgetId}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className={`
                relative group rounded-2xl border shadow-lg bg-[#111115]
                ${isEditing ? 'border-blue-500/50 ring-1 ring-blue-500/20' : 'border-white/5'}
                ${!isMobile ? '' : 'w-full min-h-[400px]'}
            `}
            style={
                !isMobile && settings.layoutMode === 'grid'
                    ? { gridColumn: `span ${colSpan}`, gridRow: `span ${rowSpan}` }
                    : {}
            }
        >
            <div className={`h-full w-full ${isEditing ? 'pointer-events-none opacity-50 blur-[1px]' : ''}`}>
                {children(dragControls)}
            </div>

            {/* Edit Overlay for Grid/List */}
            {isEditing && (
                <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm border-2 border-dashed border-blue-500/50 rounded-2xl">
                    <button
                        onClick={() => onRemove(widgetId)}
                        className="absolute top-2 right-2 p-1.5 bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white rounded-full transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    <div className="flex items-center gap-4 bg-black/60 px-4 py-2 rounded-full border border-white/10">
                        <div className="flex flex-col items-center gap-1">
                            <span className="text-[9px] text-gray-400 uppercase">Width</span>
                            <div className="flex gap-1">
                                <button onClick={() => onResize(widgetId, -1, 0)} className="p-1 hover:text-blue-400 font-mono text-lg">-</button>
                                <span className="font-mono text-xs w-4 text-center">{colSpan}</span>
                                <button onClick={() => onResize(widgetId, 1, 0)} className="p-1 hover:text-blue-400 font-mono text-lg">+</button>
                            </div>
                        </div>
                        <div className="flex flex-col items-center gap-1 border-l border-white/10 pl-4">
                            <span className="text-[9px] text-gray-400 uppercase">Height</span>
                            <div className="flex gap-1">
                                <button onClick={() => onResize(widgetId, 0, -1)} className="p-1 hover:text-blue-400 font-mono text-lg">-</button>
                                <span className="font-mono text-xs w-4 text-center">{rowSpan}</span>
                                <button onClick={() => onResize(widgetId, 0, 1)} className="p-1 hover:text-blue-400 font-mono text-lg">+</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </motion.div>
    );
}
