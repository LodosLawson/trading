'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ChartWidget from './ChartWidget';

interface MTTrade {
    id: string;
    symbol: string;
    side: 'LONG' | 'SHORT';
    qty: number;
    entryPrice: number;
    currentPrice: number;
    pnl: number;
    openedAt: Date;
}

export default function MetaTraderWidget() {
    const [status, setStatus] = useState<'idle' | 'connecting' | 'connected'>('idle');
    const [accounts, setAccounts] = useState({ broker: 'ICMarketsSC-Demo', login: '', password: '' });
    const [trades, setTrades] = useState<MTTrade[]>([]);
    const [summary, setSummary] = useState({ balance: 0, equity: 0, profit: 0 });
    const [errorMsg, setErrorMsg] = useState('');
    const [activeSymbol, setActiveSymbol] = useState('BINANCE:BTCUSDT');
    const [apiUrl, setApiUrl] = useState<string>(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000');

    useEffect(() => {
        // Read the custom serverUrl from settings if it exists
        const loadSettingsUrl = async () => {
            try {
                // Determine user gracefully
                let actualUserId = 'guest';

                // Try to get setting 
                const { getUserSettings } = await import('@/lib/userSettings');
                const settings = await getUserSettings(actualUserId);

                if (settings && settings.serverUrl) {
                    setApiUrl(settings.serverUrl);
                } else if (process.env.NEXT_PUBLIC_API_URL) {
                    setApiUrl(process.env.NEXT_PUBLIC_API_URL);
                } else {
                    setApiUrl('http://localhost:8000');
                }
            } catch (e) {
                console.error("Failed to load server URL preference", e);
            }
        };

        loadSettingsUrl();

        // Setup listener for dynamic updates from settings page
        const handleSettingsUpdate = (e: CustomEvent) => {
            const newSettings = e.detail;
            if (newSettings && newSettings.serverUrl !== undefined) {
                if (newSettings.serverUrl) {
                    setApiUrl(newSettings.serverUrl);
                } else {
                    setApiUrl(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000');
                }
            }
        };

        if (typeof window !== 'undefined') {
            window.addEventListener('mp-settings-updated', handleSettingsUpdate as EventListener);
            return () => window.removeEventListener('mp-settings-updated', handleSettingsUpdate as EventListener);
        }
    }, []);

    const API_URL = apiUrl;

    const handleConnect = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('connecting');
        setErrorMsg('');

        try {
            const res = await fetch(`${API_URL}/api/mt/connect`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    login: parseInt(accounts.login),
                    password: accounts.password,
                    server: accounts.broker
                })
            });
            const data = await res.json();
            if (res.ok && data.status === 'success') {
                setStatus('connected');
                if (data.account) {
                    setSummary({ balance: data.account.balance || 0, equity: data.account.equity || 0, profit: data.account.profit || 0 });
                }
            } else {
                setStatus('idle');
                setErrorMsg(data.detail || 'Connection failed. Check settings.');
            }
        } catch (err) {
            setStatus('idle');
            setErrorMsg('Network error connecting to backend API.');
        }
    };

    const handleDisconnect = async () => {
        try {
            await fetch(`${API_URL}/api/mt/disconnect`, { method: 'POST' });
        } catch (e) {
            console.error('Disconnect error', e);
        }
        setStatus('idle');
        setTrades([]);
        setSummary({ balance: 0, equity: 0, profit: 0 });
    };

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (status === 'connected') {
            const fetchPositions = async () => {
                try {
                    const res = await fetch(`${API_URL}/api/mt/positions`);
                    if (res.ok) {
                        const data = await res.json();
                        if (data.status === 'success') {
                            const newTrades = data.positions.map((p: any) => ({
                                ...p,
                                openedAt: new Date(p.openedAt)
                            }));
                            setTrades(newTrades);
                            setSummary({ balance: data.balance, equity: data.equity, profit: data.profit });

                            // Prevent error if there are trades but no active symbol (auto-select first)
                            if (newTrades.length > 0 && !newTrades.find((t: any) => t.symbol === activeSymbol)) {
                                setActiveSymbol(newTrades[0].symbol);
                            }
                        }
                    }
                } catch (e) {
                    console.error('Polling error', e);
                }
            };

            fetchPositions(); // trigger immediately
            interval = setInterval(fetchPositions, 2000); // Poll every 2 seconds
        }
        return () => clearInterval(interval);
    }, [status, activeSymbol]);

    // --- Disconnected / Login View ---
    if (status !== 'connected') {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-[#0a0a0f] relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03] pointer-events-none" />
                <div className="absolute top-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-blue-900/10 rounded-full blur-[100px] pointer-events-none" />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="w-full max-w-sm bg-white/3 border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden backdrop-blur-xl"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 pointer-events-none" />

                    <div className="text-center mb-8 relative z-10">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 border border-white/10 flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_rgba(255,255,255,0.05)]">
                            <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold tracking-tight text-white mb-1">MetaTrader <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-500">Sync</span></h3>
                        <p className="text-xs text-gray-500">Connect your MT4/MT5 account for live trading integration.</p>
                    </div>

                    {status === 'idle' ? (
                        <form onSubmit={handleConnect} className="space-y-4 relative z-10">
                            <div>
                                <label className="text-[10px] text-gray-500 uppercase tracking-widest mb-1.5 block">Broker / Server</label>
                                <input required type="text" placeholder="e.g. ICMarkets-Live15" value={accounts.broker} onChange={e => setAccounts({ ...accounts, broker: e.target.value })} className="w-full bg-black/40 border border-white/10 focus:border-blue-500/50 rounded-xl px-4 py-3 text-sm text-white outline-none transition-all placeholder:text-gray-700" />
                            </div>
                            <div>
                                <label className="text-[10px] text-gray-500 uppercase tracking-widest mb-1.5 block">Account Login</label>
                                <input required type="number" placeholder="Account Number" value={accounts.login} onChange={e => setAccounts({ ...accounts, login: e.target.value })} className="w-full bg-black/40 border border-white/10 focus:border-blue-500/50 rounded-xl px-4 py-3 text-sm text-white outline-none transition-all placeholder:text-gray-700" />
                            </div>
                            <div>
                                <label className="text-[10px] text-gray-500 uppercase tracking-widest mb-1.5 block">Master Password</label>
                                <input required type="password" placeholder="••••••••" value={accounts.password} onChange={e => setAccounts({ ...accounts, password: e.target.value })} className="w-full bg-black/40 border border-white/10 focus:border-blue-500/50 rounded-xl px-4 py-3 text-sm text-white outline-none transition-all placeholder:text-gray-700" />
                            </div>

                            {errorMsg && (
                                <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 p-2.5 rounded-lg font-mono">
                                    {errorMsg}
                                </div>
                            )}

                            <button type="submit" className="w-full py-4 mt-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-bold tracking-widest uppercase shadow-[0_0_20px_rgba(59,130,246,0.2)] hover:shadow-[0_0_30px_rgba(59,130,246,0.4)] transition-all">
                                Execute Connection
                            </button>
                        </form>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 relative z-10">
                            <div className="relative w-20 h-20 mb-6">
                                <div className="absolute inset-0 rounded-full border-2 border-white/5"></div>
                                <motion.div className="absolute inset-0 rounded-full border-2 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <svg className="w-6 h-6 text-blue-500 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="text-xs font-mono text-blue-400 tracking-widest uppercase animate-pulse">Establishing Secure Link...</div>
                            <div className="text-[10px] text-gray-600 mt-2">Connecting to {accounts.broker}</div>
                        </div>
                    )}
                </motion.div>

                <div className="mt-8 flex items-center gap-4 text-xs font-mono text-gray-600">
                    <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> MT4 Supported</span>
                    <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> MT5 Supported</span>
                    <span>REST API Mode</span>
                </div>
            </div>
        );
    }

    // --- Connected View (Split UI: List + Chart) ---
    return (
        <div className="w-full h-full flex flex-col md:flex-row bg-[#0a0a0f] overflow-hidden">

            {/* L E F T : MetaTrader Info & Trades List */}
            <div className="w-full md:w-[320px] lg:w-[380px] shrink-0 flex flex-col border-b md:border-b-0 md:border-r border-white/5 bg-[#0a0a0f]/80 z-20">
                {/* Header */}
                <div className="p-4 border-b border-white/5 bg-white/[0.02]">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs border border-emerald-500/30">
                                MT
                            </div>
                            <div>
                                <div className="text-xs font-bold text-white">{accounts.broker}</div>
                                <div className="text-[9px] text-gray-500 font-mono">{accounts.login}</div>
                            </div>
                        </div>
                        <button onClick={handleDisconnect} className="text-[10px] text-gray-500 hover:text-red-400 transition-colors bg-white/5 hover:bg-red-500/10 px-2 py-1 rounded">
                            Disconnect
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <div className="bg-black/40 border border-white/5 rounded-lg p-2.5">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-[9px] text-gray-500 uppercase tracking-widest">Total PnL</span>
                                <span className="text-[9px] text-gray-500 font-mono">Bal: ${summary.balance.toFixed(2)}</span>
                            </div>
                            <div className={`text-sm font-bold font-mono ${summary.profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                {summary.profit >= 0 ? '+' : ''}${summary.profit.toFixed(2)}
                            </div>
                        </div>
                        <div className="bg-black/40 border border-white/5 rounded-lg p-2.5">
                            <div className="text-[9px] text-gray-500 uppercase tracking-widest mb-1">Open Trades</div>
                            <div className="text-sm font-bold font-mono text-white">
                                {trades.length}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Trades List */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
                    <div className="text-[10px] text-gray-500 uppercase tracking-widest px-1 py-1 flex items-center justify-between">
                        <span>Active Positions</span>
                        <span>Click to view chart</span>
                    </div>
                    {trades.map(trade => (
                        <button
                            key={trade.id}
                            onClick={() => setActiveSymbol(trade.symbol)}
                            className={`w-full text-left p-3 rounded-xl border transition-all flex flex-col gap-2 ${activeSymbol === trade.symbol ? 'bg-blue-600/10 border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.1)]' : 'bg-white/3 border-white/5 hover:bg-white/5 hover:border-white/10'}`}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${trade.side === 'LONG' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'}`}>
                                        {trade.side}
                                    </span>
                                    <span className="text-xs font-bold text-white tracking-widest">{trade.symbol.split(':')[1] || trade.symbol}</span>
                                </div>
                                <div className={`text-xs font-mono font-bold ${trade.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                    {trade.pnl >= 0 ? '+' : ''}${trade.pnl.toFixed(2)}
                                </div>
                            </div>
                            <div className="flex items-center justify-between text-[10px] font-mono text-gray-500">
                                <div>{trade.qty.toFixed(2)} LOT</div>
                                <div>{formatTime(trade.openedAt)}</div>
                            </div>
                            <div className="flex items-center justify-between mt-1 pt-2 border-t border-white/5 text-[10px] font-mono">
                                <span className="text-gray-500">Entry: <span className="text-gray-300">{trade.entryPrice}</span></span>
                                <span className="text-gray-500">Curr: <span className="text-gray-300">{trade.currentPrice}</span></span>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* R I G H T : TradingView Chart + Glassmorphism Trade Overlays */}
            <div className="flex-1 relative z-10 min-h-[400px]">
                <ChartWidget symbol={activeSymbol} onSymbolChange={setActiveSymbol} />

                {/* MT Trades Overlay (Neon/Glassmorphism Avante-Garde) */}
                <div className="absolute top-16 right-4 bottom-4 w-[280px] pointer-events-none flex flex-col gap-3 justify-end items-end z-50">
                    <AnimatePresence>
                        {trades.filter(t => t.symbol === activeSymbol).map(trade => (
                            <motion.div
                                initial={{ opacity: 0, x: 20, scale: 0.9 }}
                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9, x: 20 }}
                                key={`overlay-${trade.id}`}
                                className="pointer-events-auto w-full backdrop-blur-xl bg-black/40 border-l-4 rounded-r-xl rounded-l-sm p-3 shadow-2xl relative overflow-hidden group transition-all"
                                style={{ borderColor: trade.side === 'LONG' ? '#10b981' : '#ef4444' }}
                            >
                                {/* Glow behind card */}
                                <div className="absolute inset-0 bg-gradient-to-r opacity-10 pointer-events-none" style={{ backgroundImage: `linear-gradient(to right, ${trade.side === 'LONG' ? '#10b981' : '#ef4444'} 0%, transparent 100%)` }} />

                                <div className="flex justify-between items-start mb-2 relative z-10">
                                    <div>
                                        <div className="flex items-center gap-1.5 mb-0.5">
                                            <span className={`text-[9px] font-bold tracking-widest uppercase ${trade.side === 'LONG' ? 'text-emerald-400' : 'text-red-400'}`}>{trade.side}</span>
                                            <span className="text-[10px] text-white/50">• {trade.qty} LOT</span>
                                        </div>
                                        <div className="text-sm font-bold text-white tracking-widest">{trade.symbol.split(':')[1] || trade.symbol}</div>
                                    </div>
                                    <div className={`text-sm font-mono font-bold ${trade.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                        {trade.pnl >= 0 ? '+' : ''}${trade.pnl.toFixed(2)}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono relative z-10">
                                    <div className="bg-white/5 rounded px-2 py-1">
                                        <div className="text-gray-500 mb-0.5">Entry</div>
                                        <div className="text-white">{trade.entryPrice}</div>
                                    </div>
                                    <div className="bg-white/5 rounded px-2 py-1">
                                        <div className="text-gray-500 mb-0.5">Current</div>
                                        <div className="text-white">{trade.currentPrice}</div>
                                    </div>
                                </div>

                                <button className="w-full mt-2 py-1.5 text-[9px] font-bold tracking-widest uppercase text-white/50 hover:text-white bg-white/5 hover:bg-white/10 rounded transition-colors relative z-10">
                                    Close Position ✕
                                </button>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>

        </div>
    );
}

function formatTime(d: Date) {
    return d.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
}
