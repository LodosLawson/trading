'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
    User,
    onAuthStateChanged,
    signInWithPopup,
    GoogleAuthProvider,
    signOut as firebaseSignOut,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    updateProfile
} from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signInWithGoogle: () => Promise<void>;
    signUpWithEmail: (email: string, pass: string, nickname: string) => Promise<void>;
    signInWithEmail: (email: string, pass: string) => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    signInWithGoogle: async () => { },
    signUpWithEmail: async () => { },
    signInWithEmail: async () => { },
    signOut: async () => { },
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!auth) {
            setLoading(false);
            return;
        }
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const signInWithGoogle = async () => {
        if (!auth) return;
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
        } catch (error) {
            console.error("Error signing in with Google", error);
            throw error;
        }
    };

    const signUpWithEmail = async (email: string, pass: string, nickname: string) => {
        if (!auth) return;
        try {
            const result = await createUserWithEmailAndPassword(auth, email, pass);
            if (result.user) {
                await updateProfile(result.user, { displayName: nickname });
                // Force refresh user to get updated display name
                setUser({ ...result.user, displayName: nickname });
            }
        } catch (error) {
            console.error("Error signing up with email", error);
            throw error;
        }
    }

    const signInWithEmail = async (email: string, pass: string) => {
        if (!auth) return;
        try {
            await signInWithEmailAndPassword(auth, email, pass);
        } catch (error) {
            console.error("Error signing in with email", error);
            throw error;
        }
    }

    const signOut = async () => {
        if (!auth) return;
        try {
            await firebaseSignOut(auth);
        } catch (error) {
            console.error("Error signing out", error);
            throw error;
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, signInWithGoogle, signUpWithEmail, signInWithEmail, signOut }}>
            {!loading && children}
        </AuthContext.Provider>
    );
}
