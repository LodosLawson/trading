import { db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export interface WidgetConfig {
    id: string;
    visible: boolean;
    order?: number;
    window?: {
        x: number;
        y: number;
        w: number;
        h: number;
        z: number;
    };
}

export type LayoutMode = 'grid' | 'list' | 'window' | 'page';
export type NavigationMode = 'sidebar' | 'hidden';

export interface LayoutWidget {
    id: string;
    type: string;
    colSpan: number;
    rowSpan: number;
}

export interface UserSettings {
    theme: 'dark' | 'light';
    layoutMode: LayoutMode;
    navigationMode: NavigationMode;
    widgets: Record<string, WidgetConfig>;
    savedLayout?: LayoutWidget[]; // persisted widget list
}

export const DEFAULT_SETTINGS: UserSettings = {
    theme: 'dark',
    layoutMode: 'grid',
    navigationMode: 'sidebar',
    widgets: {
        'market-overview': { id: 'market-overview', visible: true, order: 0 },
        'chart-widget': { id: 'chart-widget', visible: true, order: 1 },
        'news-feed': { id: 'news-feed', visible: true, order: 2 },
        'ai-chat': { id: 'ai-chat', visible: true, order: 3 },
        'browser-widget': { id: 'browser-widget', visible: true, order: 4 },
        'live-wire': { id: 'live-wire', visible: true, order: 5 },
    }
};

export async function saveUserSettings(userId: string | undefined, settings: UserSettings) {
    // Guest / Local Mode
    if (!userId || userId === 'guest') {
        if (typeof window !== 'undefined') {
            localStorage.setItem('market_pulse_settings', JSON.stringify(settings));
        }
        return;
    }

    // Cloud Mode (Firestore)
    if (!db) return;
    try {
        const ref = doc(db, 'users', userId, 'settings', 'layout');
        await setDoc(ref, settings, { merge: true });
    } catch (e) {
        console.error("Error saving settings:", e);
    }
}

export async function getUserSettings(userId: string | undefined): Promise<UserSettings> {
    // 1. Try Local Storage first if Guest or fallback needed
    if (!userId || userId === 'guest') {
        if (typeof window !== 'undefined') {
            const local = localStorage.getItem('market_pulse_settings');
            if (local) {
                try {
                    return JSON.parse(local) as UserSettings;
                } catch (e) {
                    console.error("Error parsing local settings", e);
                }
            }
        }
        return DEFAULT_SETTINGS;
    }

    // 2. Try Firestore
    if (!db) return DEFAULT_SETTINGS;
    try {
        const ref = doc(db, 'users', userId, 'settings', 'layout');
        const snap = await getDoc(ref);
        if (snap.exists()) {
            const data = snap.data() as UserSettings;
            // Merge with default to ensure schema compatibility
            return {
                ...DEFAULT_SETTINGS,
                ...data,
                widgets: { ...DEFAULT_SETTINGS.widgets, ...data.widgets }
            };
        }
    } catch (e) {
        console.error("Error loading settings:", e);
    }
    return DEFAULT_SETTINGS;
}
