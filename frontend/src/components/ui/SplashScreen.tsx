'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/* ── Synthesized Startup Sound ───────────────────── */
function playStartupSound() {
    try {
        const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();

        // Rising tone
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(220, ctx.currentTime);
        osc1.frequency.exponentialRampToValueAtTime(660, ctx.currentTime + 0.6);
        gain1.gain.setValueAtTime(0, ctx.currentTime);
        gain1.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.1);
        gain1.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.4);
        gain1.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.8);
        osc1.connect(gain1).connect(ctx.destination);
        osc1.start(ctx.currentTime);
        osc1.stop(ctx.currentTime + 0.8);

        // Shimmer overtone
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(440, ctx.currentTime + 0.15);
        osc2.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.7);
        gain2.gain.setValueAtTime(0, ctx.currentTime + 0.15);
        gain2.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 0.3);
        gain2.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.9);
        osc2.connect(gain2).connect(ctx.destination);
        osc2.start(ctx.currentTime + 0.15);
        osc2.stop(ctx.currentTime + 0.9);

        // Final chime
        const osc3 = ctx.createOscillator();
        const gain3 = ctx.createGain();
        osc3.type = 'sine';
        osc3.frequency.setValueAtTime(1320, ctx.currentTime + 0.5);
        gain3.gain.setValueAtTime(0, ctx.currentTime + 0.5);
        gain3.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.55);
        gain3.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.4);
        osc3.connect(gain3).connect(ctx.destination);
        osc3.start(ctx.currentTime + 0.5);
        osc3.stop(ctx.currentTime + 1.4);

        setTimeout(() => ctx.close(), 2000);
    } catch {
        // Audio not supported
    }
}

/* ── Animated Pulse Canvas ───────────────────────── */
function PulseCanvas({ phase }: { phase: 'drawing' | 'done' }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animRef = useRef<number>(0);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const dpr = window.devicePixelRatio || 1;
        const w = canvas.clientWidth;
        const h = canvas.clientHeight;
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        ctx.scale(dpr, dpr);

        // Generate a "price trend" path
        const points: Array<{ x: number; y: number }> = [];
        const segments = 60;
        const midY = h * 0.5;
        const amp = h * 0.3;

        // Create organic price-like movement
        let y = midY;
        for (let i = 0; i <= segments; i++) {
            const x = (i / segments) * w;
            const noise = (Math.random() - 0.5) * amp * 0.3;
            const trend = Math.sin((i / segments) * Math.PI * 2.5) * amp * 0.4;
            const pulse = i > segments * 0.4 && i < segments * 0.55
                ? Math.sin(((i - segments * 0.4) / (segments * 0.15)) * Math.PI) * amp * 0.6
                : 0;
            y = midY - trend - pulse + noise;
            y = Math.max(h * 0.1, Math.min(h * 0.9, y));
            points.push({ x, y });
        }

        let progress = 0;
        const speed = phase === 'drawing' ? 0.015 : 1;
        const totalLen = points.length - 1;

        function draw() {
            if (!ctx || !canvas) return;
            ctx.clearRect(0, 0, w, h);

            const drawTo = Math.min(Math.floor(progress * totalLen), totalLen);

            // Gradient glow underneath
            if (drawTo > 1) {
                const gradient = ctx.createLinearGradient(0, 0, 0, h);
                gradient.addColorStop(0, 'rgba(59, 130, 246, 0.08)');
                gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');

                ctx.beginPath();
                ctx.moveTo(points[0].x, h);
                for (let i = 0; i <= drawTo; i++) {
                    ctx.lineTo(points[i].x, points[i].y);
                }
                ctx.lineTo(points[drawTo].x, h);
                ctx.closePath();
                ctx.fillStyle = gradient;
                ctx.fill();
            }

            // Main line
            if (drawTo > 0) {
                ctx.beginPath();
                ctx.moveTo(points[0].x, points[0].y);
                for (let i = 1; i <= drawTo; i++) {
                    ctx.lineTo(points[i].x, points[i].y);
                }
                ctx.strokeStyle = '#3b82f6';
                ctx.lineWidth = 2;
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
                ctx.stroke();

                // Glowing tip
                if (drawTo < totalLen) {
                    const tip = points[drawTo];
                    const glowGrad = ctx.createRadialGradient(tip.x, tip.y, 0, tip.x, tip.y, 12);
                    glowGrad.addColorStop(0, 'rgba(59, 130, 246, 0.8)');
                    glowGrad.addColorStop(1, 'rgba(59, 130, 246, 0)');
                    ctx.fillStyle = glowGrad;
                    ctx.fillRect(tip.x - 12, tip.y - 12, 24, 24);

                    ctx.beginPath();
                    ctx.arc(tip.x, tip.y, 3, 0, Math.PI * 2);
                    ctx.fillStyle = '#fff';
                    ctx.fill();
                }
            }

            if (progress < 1) {
                progress += speed;
                animRef.current = requestAnimationFrame(draw);
            }
        }

        draw();
        return () => cancelAnimationFrame(animRef.current);
    }, [phase]);

    return (
        <canvas
            ref={canvasRef}
            className="w-full h-full"
            style={{ width: '100%', height: '100%' }}
        />
    );
}

/* ── Main Splash Component ───────────────────────── */
export default function SplashScreen({ onComplete }: { onComplete: () => void }) {
    const [phase, setPhase] = useState<'init' | 'pulse' | 'text' | 'exit'>('init');
    const soundPlayed = useRef(false);

    useEffect(() => {
        // Phase timeline
        const t1 = setTimeout(() => setPhase('pulse'), 200);
        const t2 = setTimeout(() => {
            setPhase('text');
            if (!soundPlayed.current) {
                soundPlayed.current = true;
                playStartupSound();
            }
        }, 800);
        const t3 = setTimeout(() => setPhase('exit'), 2800);
        const t4 = setTimeout(onComplete, 3400);

        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
            clearTimeout(t3);
            clearTimeout(t4);
        };
    }, [onComplete]);

    return (
        <AnimatePresence>
            {phase !== 'exit' ? (
                <motion.div
                    key="splash"
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6 }}
                    className="fixed inset-0 z-[200] bg-[#0a0a0f] flex flex-col items-center justify-center"
                >
                    {/* Pulse Animation Container */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: phase === 'pulse' || phase === 'text' ? 1 : 0 }}
                        transition={{ duration: 0.4 }}
                        className="w-[80vw] sm:w-[60vw] max-w-[500px] h-[120px] sm:h-[150px] mb-8"
                    >
                        <PulseCanvas phase="drawing" />
                    </motion.div>

                    {/* Logo Text */}
                    <AnimatePresence>
                        {(phase === 'text') && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, ease: 'easeOut' }}
                                className="text-center"
                            >
                                <h1 className="text-4xl sm:text-6xl font-thin tracking-tighter mb-2">
                                    MARKET<span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-500">PULSE</span>
                                </h1>
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                    className="text-[10px] sm:text-xs text-gray-600 uppercase tracking-[0.3em]"
                                >
                                    AI-Native Financial Intelligence
                                </motion.p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Subtle grid overlay */}
                    <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
                        style={{
                            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
                            backgroundSize: '40px 40px'
                        }}
                    />
                </motion.div>
            ) : null}
        </AnimatePresence>
    );
}
