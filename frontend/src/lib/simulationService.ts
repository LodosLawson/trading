/**
 * simulationService.ts
 * All Firebase read/write operations for the Trading Simulation feature.
 */
import {
    doc, collection, setDoc, addDoc, updateDoc, deleteDoc,
    getDocs, onSnapshot, serverTimestamp, query, orderBy, Unsubscribe
} from 'firebase/firestore';
import { db } from './firebase';

// ─── Types ──────────────────────────────────────────────────────────────────

export type TradeSide = 'BUY' | 'SELL';
export type TradeMode = 'SPOT' | 'FUTURES';

export interface Portfolio {
    spotBalance: number;
    futuresBalance: number;
    startBalance: number;
    startedAt: any; // Firestore Timestamp
    initialSpot: number;
    initialFutures: number;
}

export interface SimPosition {
    id?: string;
    symbol: string;
    side: 'LONG' | 'SHORT';
    qty: number;
    entryPrice: number;
    leverage: number;
    sl?: number | null;
    tp?: number | null;
    mode: TradeMode;
    openedAt: any;
}

export interface SimTrade {
    id?: string;
    symbol: string;
    side: TradeSide;
    qty: number;
    price: number;
    mode: TradeMode;
    pnl?: number;
    closedAt?: any;
    openedAt: any;
    positionId?: string;
    leverage?: number;
}

export interface WalletEntry {
    id?: string;
    address: string;
    chain: 'ETH' | 'BTC' | 'SOL';
    label: string;
    addedAt: any;
}

export interface DailySnapshot {
    id?: string;
    date: string; // YYYY-MM-DD
    spotBalance: number;
    futuresBalance: number;
    totalValue: number;
    pnl: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function simRef(userId: string) {
    return doc(db, 'simulations', userId);
}
function col(userId: string, name: string) {
    return collection(db, 'simulations', userId, name);
}

// ─── Portfolio ────────────────────────────────────────────────────────────────

export async function createPortfolio(userId: string, spotAmount: number, futuresAmount: number) {
    const data: Portfolio = {
        spotBalance: spotAmount,
        futuresBalance: futuresAmount,
        startBalance: spotAmount + futuresAmount,
        initialSpot: spotAmount,
        initialFutures: futuresAmount,
        startedAt: serverTimestamp(),
    };
    await setDoc(simRef(userId), data);
    return data;
}

export async function getPortfolio(userId: string): Promise<Portfolio | null> {
    const { getDoc } = await import('firebase/firestore');
    const snap = await getDoc(simRef(userId));
    return snap.exists() ? snap.data() as Portfolio : null;
}

export function listenPortfolio(userId: string, cb: (p: Portfolio | null) => void): Unsubscribe {
    return onSnapshot(
        simRef(userId),
        snap => cb(snap.exists() ? snap.data() as Portfolio : null),
        err => console.error("Portfolio listener error:", err)
    );
}

export async function updatePortfolio(userId: string, patch: Partial<Portfolio>) {
    await updateDoc(simRef(userId), patch as any);
}

// ─── Positions ────────────────────────────────────────────────────────────────

export async function openPosition(userId: string, pos: Omit<SimPosition, 'id'>): Promise<string> {
    const ref = await addDoc(col(userId, 'positions'), { ...pos, openedAt: serverTimestamp() });
    return ref.id;
}

export function listenPositions(userId: string, cb: (positions: SimPosition[]) => void): Unsubscribe {
    return onSnapshot(
        col(userId, 'positions'),
        snap => cb(snap.docs.map(d => ({ id: d.id, ...d.data() } as SimPosition))),
        err => console.error("Positions listener error:", err)
    );
}

export async function closePosition(userId: string, posId: string) {
    await deleteDoc(doc(db, 'simulations', userId, 'positions', posId));
}

// ─── Trades ───────────────────────────────────────────────────────────────────

export async function recordTrade(userId: string, trade: Omit<SimTrade, 'id'>): Promise<string> {
    const ref = await addDoc(col(userId, 'trades'), { ...trade, openedAt: serverTimestamp() });
    return ref.id;
}

export function listenTrades(userId: string, cb: (trades: SimTrade[]) => void): Unsubscribe {
    const q = query(col(userId, 'trades'), orderBy('openedAt', 'desc'));
    return onSnapshot(
        q,
        snap => cb(snap.docs.map(d => ({ id: d.id, ...d.data() } as SimTrade))),
        err => console.error("Trades listener error:", err)
    );
}

// ─── Wallets ──────────────────────────────────────────────────────────────────

export async function addWallet(userId: string, wallet: Omit<WalletEntry, 'id'>): Promise<string> {
    const ref = await addDoc(col(userId, 'wallets'), { ...wallet, addedAt: serverTimestamp() });
    return ref.id;
}

export async function removeWallet(userId: string, walletId: string) {
    await deleteDoc(doc(db, 'simulations', userId, 'wallets', walletId));
}

export function listenWallets(userId: string, cb: (wallets: WalletEntry[]) => void): Unsubscribe {
    return onSnapshot(
        col(userId, 'wallets'),
        snap => cb(snap.docs.map(d => ({ id: d.id, ...d.data() } as WalletEntry))),
        err => console.error("Wallets listener error:", err)
    );
}

// ─── Snapshots ────────────────────────────────────────────────────────────────

export async function saveSnapshot(userId: string, snap: Omit<DailySnapshot, 'id'>) {
    const ref = doc(col(userId, 'snapshots'), snap.date);
    await setDoc(ref, snap, { merge: true });
}

export async function getSnapshots(userId: string): Promise<DailySnapshot[]> {
    const q = query(col(userId, 'snapshots'), orderBy('date', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as DailySnapshot));
}
