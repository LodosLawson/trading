'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthProvider';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function LoginPage() {
    const { signInWithGoogle, signInWithEmail } = useAuth();
    const router = useRouter();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [form, setForm] = useState({ email: '', password: '' });

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await signInWithEmail(form.email, form.password);
            router.push('/terminal');
        } catch (err: any) {
            setError(err.message || 'Sign in failed. Check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setGoogleLoading(true);
        setError('');
        try {
            await signInWithGoogle();
            router.push('/terminal');
        } catch (err: any) {
            setError('Google sign in failed. Please try again.');
        } finally {
            setGoogleLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-[#050508] relative overflow-hidden">

            {/* Ambient BG */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-20%] left-[-15%] w-[80vw] h-[80vw] bg-blue-600/8 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-violet-600/8 rounded-full blur-[80px]" />
            </div>

            {/* Back to home — top left */}
            <Link href="/" className="absolute top-5 left-5 z-20 p-2 rounded-full text-gray-500 hover:text-white hover:bg-white/5 transition-all active:scale-95">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
            </Link>

            {/* Main content — vertically centered, scrollable */}
            <div className="relative z-10 flex-1 flex items-center justify-center px-5 py-16">
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                    className="w-full max-w-sm"
                >
                    {/* Logo mark */}
                    <div className="mb-8 text-center">
                        <div className="text-lg font-black tracking-tighter mb-1">
                            MARKET<span className="text-blue-500">PULSE</span>
                        </div>
                        <h1 className="text-2xl font-thin tracking-tight">
                            Welcome <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-500">back</span>
                        </h1>
                        <p className="text-gray-500 text-xs mt-1">Sign in to your terminal</p>
                    </div>

                    {/* Error */}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-5 px-4 py-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl text-center leading-relaxed"
                        >
                            {error}
                        </motion.div>
                    )}

                    {/* Google — primary CTA on mobile (thumb-zone first) */}
                    <button
                        onClick={handleGoogleLogin}
                        disabled={googleLoading || loading}
                        className="w-full flex items-center justify-center gap-3 py-4 bg-white text-black font-bold text-sm rounded-2xl hover:bg-gray-100 active:scale-98 transition-all disabled:opacity-60 disabled:cursor-not-allowed mb-4 shadow-lg"
                    >
                        {googleLoading ? (
                            <Spinner dark />
                        ) : (
                            <GoogleIcon />
                        )}
                        {googleLoading ? 'Signing in…' : 'Continue with Google'}
                    </button>

                    {/* Divider */}
                    <div className="relative flex items-center gap-3 mb-4">
                        <div className="flex-1 h-px bg-white/8" />
                        <span className="text-[10px] uppercase tracking-widest text-gray-600">or email</span>
                        <div className="flex-1 h-px bg-white/8" />
                    </div>

                    {/* Email form */}
                    <form onSubmit={handleEmailLogin} className="space-y-3">
                        <div>
                            <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-1.5 ml-1">Email</label>
                            <input
                                type="email"
                                required
                                autoComplete="email"
                                inputMode="email"
                                placeholder="you@example.com"
                                className="w-full bg-white/4 border border-white/10 focus:border-blue-500 rounded-xl px-4 py-3.5 text-white text-sm placeholder-gray-600 outline-none transition-colors"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-1.5 ml-1">Password</label>
                            <input
                                type="password"
                                required
                                autoComplete="current-password"
                                placeholder="••••••••"
                                className="w-full bg-white/4 border border-white/10 focus:border-blue-500 rounded-xl px-4 py-3.5 text-white text-sm placeholder-gray-600 outline-none transition-colors"
                                value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading || googleLoading}
                            className="w-full py-4 bg-gradient-to-r from-blue-600 to-violet-600 rounded-2xl font-bold text-sm tracking-widest uppercase hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-1 shadow-[0_0_30px_rgba(99,102,241,0.25)]"
                        >
                            {loading ? <Spinner /> : null}
                            {loading ? 'Signing in…' : 'Sign In'}
                        </button>
                    </form>

                    {/* Footer links */}
                    <div className="mt-8 flex flex-col items-center gap-3 text-xs text-gray-500">
                        <p>
                            No account?{' '}
                            <Link href="/auth/signup" className="text-blue-400 hover:text-blue-300 font-bold">
                                Create one free
                            </Link>
                        </p>
                        <p className="text-[10px] text-gray-700 text-center leading-relaxed max-w-[240px]">
                            By continuing you agree to our Terms of Service and Privacy Policy.
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

function Spinner({ dark }: { dark?: boolean }) {
    return (
        <svg
            className={`w-4 h-4 animate-spin ${dark ? 'text-gray-700' : 'text-white'}`}
            fill="none"
            viewBox="0 0 24 24"
        >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
    );
}

function GoogleIcon() {
    return (
        <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
    );
}
