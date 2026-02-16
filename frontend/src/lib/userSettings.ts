import { db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export interface WidgetConfig {
    id: string;
    visible: boolean;
    order?: number;
}

export interface UserSettings {
    theme: 'dark' | 'light';
    widgets: Record<string, WidgetConfig>;
}

export const DEFAULT_SETTINGS: UserSettings = {
    theme: 'dark',
    widgets: {
        'market-overview': { id: 'market-overview', visible: true },
        'chart-widget': { id: 'chart-widget', visible: true },
        'news-feed': { id: 'news-feed', visible: true },
        'browser-widget': { id: 'browser-widget', visible: true },
        'ai-chat': { id: 'ai-chat', visible: true },
    }
};

export async function saveUserSettings(userId: string, settings: UserSettings) {
    if (!db) return;
    try {
        const ref = doc(db, 'users', userId, 'settings', 'layout');
        await setDoc(ref, settings, { merge: true });
    } catch (e) {
        console.error("Error saving settings:", e);
    }
}

export async function getUserSettings(userId: string): Promise<UserSettings> {
    if (!db) return DEFAULT_SETTINGS;
    try {
        const ref = doc(db, 'users', userId, 'settings', 'layout');
        const snap = await getDoc(ref);
        if (snap.exists()) {
            // Merge with default to ensure new widgets key exist if schema changes
            const data = snap.data() as UserSettings;
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
