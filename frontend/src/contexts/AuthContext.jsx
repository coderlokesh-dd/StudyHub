import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchProfile = useCallback(async (userId) => {
        const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
        setProfile(data);
    }, []);

    useEffect(() => {
        supabase.auth.getSession().then(async ({ data: { session } }) => {
            let u = session?.user ?? null;

            if (!u && import.meta.env.DEV && import.meta.env.VITE_DEV_AUTO_LOGIN === 'true') {
                const email = import.meta.env.VITE_DEV_EMAIL;
                const password = import.meta.env.VITE_DEV_PASSWORD;
                if (email && password) {
                    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
                    if (error) console.warn('[dev auto-login] failed:', error.message);
                    else u = data.user;
                }
            }

            setUser(u);
            if (u) fetchProfile(u.id);
            setLoading(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            const u = session?.user ?? null;
            setUser(u);
            if (u) fetchProfile(u.id);
            else setProfile(null);
        });

        return () => subscription.unsubscribe();
    }, [fetchProfile]);

    const signUp = async ({ email, password, metadata }) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { first_name: metadata.firstName, last_name: metadata.lastName } },
        });
        if (error) throw error;

        if (data.user) {
            const { error: profileError } = await supabase.from('profiles').insert({
                id: data.user.id,
                first_name: metadata.firstName,
                last_name: metadata.lastName,
                username: metadata.username,
                email,
                dob: metadata.dob || null,
                school_type: metadata.schoolType || null,
                school_name: metadata.schoolName || null,
                address: metadata.address || null,
                phone: metadata.phone || null,
            });
            if (profileError) throw profileError;
        }

        return data;
    };

    const signIn = async ({ email, password }) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        return data;
    };

    const signOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        setUser(null);
        setProfile(null);
    };

    const value = { user, profile, loading, signUp, signIn, signOut, fetchProfile };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
