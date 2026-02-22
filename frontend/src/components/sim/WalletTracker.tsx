'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WalletEntry } from '../../lib/simulationService';

type Chain = 'ETH' | 'BTC' | 'SOL';

interface WalletTrackerProps {
    wallets: WalletEntry[];
    onAdd: (wallet: Omit<WalletEntry, 'id'>) => Promise<void>;
    onRemove: (id: string) => Promise<void>;
}

const CHAIN_CONFIG = {
    ETH: { label: 'Ethereum', color: 'blue', icon: 'Ξ' },
    BTC: { label: 'Bitcoin', color: 'orange', icon: '₿' },
    SOL: { label: 'Solana', color: 'purple', icon: '◎' },
};

async function fetchWalletBalance(address: string, chain: Chain): Promise<string> {
    try {
        if (chain === 'ETH') {
            const apiKey = process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY || '';
            const res = await fetch(`https://api.etherscan.io/api?module=account&action=balance&address=${address}&tag=latest${apiKey ? `&apikey=${apiKey}` : ''}`);
            const json = await res.json();
            const wei = parseInt(json.result || '0');
            const eth = wei / 1e18;
            return `${eth.toFixed(4)} ETH`;
        }
        if (chain === 'BTC') {
            const res = await fetch(`https://blockchain.info/balance?active=${address}&cors=true`);
            const json = await res.json();
            const sat = json[address]?.final_balance ?? 0;
            return `${(sat / 1e8).toFixed(8)} BTC`;
        }
        if (chain === 'SOL') {
            const res = await fetch('https://api.mainnet-beta.solana.com', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'getBalance', params: [address] }),
            });
            const json = await res.json();
            const lamports = json?.result?.value ?? 0;
            return `${(lamports / 1e9).toFixed(4)} SOL`;
        }
    } catch { /* ignore */ }
    return '–';
}

interface WalletRowProps {
    wallet: WalletEntry;
    onRemove: () => void;
}

function WalletRow({ wallet, onRemove }: WalletRowProps) {
    const [balance, setBalance] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const cfg = CHAIN_CONFIG[wallet.chain];

    const refresh = async () => {
        setLoading(true);
        const b = await fetchWalletBalance(wallet.address, wallet.chain);
        setBalance(b);
        setLoading(false);
    };

    React.useEffect(() => { refresh(); }, []);

    const short = `${wallet.address.slice(0, 6)}…${wallet.address.slice(-4)}`;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: 16 }}
            className="flex items-center gap-3 rounded-xl bg-white/3 border border-white/8 px-3 py-3"
        >
            <div className={`w-8 h-8 rounded-lg bg-${cfg.color}-500/10 border border-${cfg.color}-500/20 flex items-center justify-center text-${cfg.color}-400 font-bold text-sm shrink-0`}>
                {cfg.icon}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white truncate">{wallet.label || short}</span>
                    <span className={`text-[8px] text-${cfg.color}-500 bg-${cfg.color}-500/10 px-1 rounded`}>{wallet.chain}</span>
                </div>
                <div className="text-[9px] text-gray-600 font-mono">{short}</div>
            </div>
            <div className="text-right shrink-0">
                {loading ? (
                    <div className="text-[10px] text-gray-600 animate-pulse">…</div>
                ) : (
                    <div className="text-xs font-mono font-bold text-white">{balance ?? '–'}</div>
                )}
                <button onClick={refresh} className="text-[8px] text-gray-600 hover:text-blue-400 transition-colors mt-0.5">↻ Yenile</button>
            </div>
            <button
                onClick={onRemove}
                className="text-gray-700 hover:text-red-400 transition-colors shrink-0 ml-1"
                title="Sil"
            >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </motion.div>
    );
}

export default function WalletTracker({ wallets, onAdd, onRemove }: WalletTrackerProps) {
    const [address, setAddress] = useState('');
    const [chain, setChain] = useState<Chain>('ETH');
    const [label, setLabel] = useState('');
    const [adding, setAdding] = useState(false);
    const [showForm, setShowForm] = useState(false);

    const handleAdd = async () => {
        if (!address.trim()) return;
        setAdding(true);
        try {
            await onAdd({ address: address.trim(), chain, label: label.trim() || address.slice(0, 8), addedAt: null });
            setAddress(''); setLabel(''); setShowForm(false);
        } finally { setAdding(false); }
    };

    return (
        <div className="flex flex-col gap-3 p-4">
            <div className="flex items-center justify-between">
                <div>
                    <div className="text-xs font-bold text-white">Cüzdan Takibi</div>
                    <div className="text-[9px] text-gray-600">Sadece bakiye görüntüleme • İşlem yapılmaz</div>
                </div>
                <button
                    onClick={() => setShowForm(v => !v)}
                    className="px-3 py-1.5 text-[10px] font-bold rounded-lg bg-blue-600/20 border border-blue-500/30 text-blue-400 hover:bg-blue-600/30 transition-all"
                >
                    + Ekle
                </button>
            </div>

            {/* Add form */}
            <AnimatePresence>
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="rounded-xl bg-white/3 border border-white/10 p-3 space-y-2">
                            {/* Chain selector */}
                            <div className="flex gap-1">
                                {(['ETH', 'BTC', 'SOL'] as Chain[]).map(c => {
                                    const cfg = CHAIN_CONFIG[c];
                                    return (
                                        <button
                                            key={c}
                                            onClick={() => setChain(c)}
                                            className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg border transition-all ${chain === c ? `bg-${cfg.color}-600/30 border-${cfg.color}-500/50 text-${cfg.color}-400` : 'bg-white/3 border-white/8 text-gray-500'}`}
                                        >
                                            {cfg.icon} {c}
                                        </button>
                                    );
                                })}
                            </div>

                            <input
                                value={address}
                                onChange={e => setAddress(e.target.value)}
                                placeholder="Cüzdan adresi…"
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none font-mono placeholder-gray-600 focus:border-blue-500/40 transition-colors"
                            />
                            <input
                                value={label}
                                onChange={e => setLabel(e.target.value)}
                                placeholder="İsim / Etiket (isteğe bağlı)"
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none placeholder-gray-600 focus:border-blue-500/40 transition-colors"
                            />

                            <button
                                onClick={handleAdd}
                                disabled={adding || !address.trim()}
                                className="w-full py-2 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 transition-all disabled:opacity-40"
                            >
                                {adding ? 'Ekleniyor…' : 'Cüzdanı Ekle'}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Wallet list */}
            <AnimatePresence>
                {wallets.length === 0 && !showForm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center justify-center py-8 gap-2 text-gray-600"
                    >
                        <span className="text-2xl">🔐</span>
                        <span className="text-xs text-center">Henüz cüzdan eklenmedi.<br />ETH, BTC veya SOL adresinizi ekleyerek bakiyenizi takip edin.</span>
                    </motion.div>
                )}
                {wallets.map(w => (
                    <WalletRow key={w.id} wallet={w} onRemove={() => onRemove(w.id!)} />
                ))}
            </AnimatePresence>
        </div>
    );
}
