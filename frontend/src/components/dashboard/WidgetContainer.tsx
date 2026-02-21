'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import {
    motion,
    DragControls,
    useDragControls,
    useMotionValue,
} from 'framer-motion';

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
    updateWindowPosition: (id: string, absX: number, absY: number) => void;
    onRemove: (id: string) => void;
    onResize: (id: string, dx: number, dy: number) => void;
    onResizeEnd?: (id: string, w: number, h: number) => void;
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
    onResizeEnd,
    children,
}: WidgetContainerProps) {
    const dragControls = useDragControls();
    const isWindow = settings.layoutMode === 'window';

    const config = settings.widgets[widgetId] || { visible: true };
    const savedWin = config.window;

    // Initial values (used only at mount time)
    const initX = savedWin?.x ?? 80 + index * 40;
    const initY = savedWin?.y ?? 80 + index * 40;
    const initW = savedWin?.w ?? 520;
    const initH = savedWin?.h ?? 420;

    // Stable motion values — owned by this component, never overwritten by state
    const x = useMotionValue(initX);
    const y = useMotionValue(initY);
    const w = useMotionValue(initW);
    const h = useMotionValue(initH);

    // One-time sync when window config first loads from Firebase (only if significantly different)
    const didSyncRef = useRef(false);
    useEffect(() => {
        if (!isWindow || didSyncRef.current) return;
        if (savedWin && (
            Math.abs(savedWin.x - x.get()) > 10 ||
            Math.abs(savedWin.y - y.get()) > 10
        )) {
            x.set(savedWin.x);
            y.set(savedWin.y);
            w.set(savedWin.w ?? initW);
            h.set(savedWin.h ?? initH);
            didSyncRef.current = true;
        }
        if (savedWin) didSyncRef.current = true;
    }, [isWindow, savedWin]);

    // Resize via raw pointer events — no state updates while dragging
    const resizeRef = useRef<HTMLDivElement>(null);
    const isResizing = useRef(false);
    const resizeStart = useRef({ px: 0, py: 0, w: 0, h: 0 });

    const onResizePointerDown = useCallback((e: React.PointerEvent) => {
        e.preventDefault();
        e.stopPropagation();
        isResizing.current = true;
        resizeStart.current = { px: e.clientX, py: e.clientY, w: w.get(), h: h.get() };
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
    }, [w, h]);

    const onResizePointerMove = useCallback((e: React.PointerEvent) => {
        if (!isResizing.current) return;
        const newW = Math.max(280, resizeStart.current.w + (e.clientX - resizeStart.current.px));
        const newH = Math.max(200, resizeStart.current.h + (e.clientY - resizeStart.current.py));
        w.set(newW);
        h.set(newH);
    }, [w, h]);

    const onResizePointerUp = useCallback((e: React.PointerEvent) => {
        if (!isResizing.current) return;
        isResizing.current = false;
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
        // Save final size
        if (onResizeEnd) onResizeEnd(widgetId, w.get(), h.get());
    }, [widgetId, w, h, onResizeEnd]);

    const isActive = activeWindow === widgetId;
    const zIndex = isActive ? 100 : (savedWin?.z ?? 10 + index);

    if (isWindow) {
        return (
            <motion.div
                drag
                dragListener={false}
                dragControls={dragControls}
                dragMomentum={false}
                dragElastic={0}
                onMouseDown={() => setActiveWindow(widgetId)}
                onTouchStart={() => setActiveWindow(widgetId)}
                onDragEnd={() => {
                    updateWindowPosition(widgetId, x.get(), y.get());
                }}
                style={{ x, y, width: w, height: h, position: 'absolute', zIndex }}
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.88 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className="rounded-xl overflow-hidden shadow-2xl shadow-black/60 border border-white/10"
            >
                {/* Resize handle — pointer events only, no nested drag */}
                <div
                    ref={resizeRef}
                    onPointerDown={onResizePointerDown}
                    onPointerMove={onResizePointerMove}
                    onPointerUp={onResizePointerUp}
                    className="absolute bottom-0 right-0 w-5 h-5 cursor-nwse-resize z-[999] flex items-end justify-end p-1 group"
                >
                    <svg width="8" height="8" viewBox="0 0 8 8" className="text-white/20 group-hover:text-blue-400 transition-colors">
                        <path d="M7 1L1 7M7 4L4 7M7 7L7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                </div>

                {children(dragControls)}
            </motion.div>
        );
    }

    // ── Grid / List mode ──
    return (
        <motion.div
            layout
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
