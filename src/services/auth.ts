import { supabase } from '../lib/supabase';
import { AuthError } from '@supabase/supabase-js';


const getErrorMessage = (error: AuthError) => {


    const msg = error.message.toLowerCase();

    if (msg.includes('user already registered')) return 'Este e-mail já está cadastrado.';
    if (msg.includes('invalid login credentials')) return 'E-mail ou senha incorretos.';
    if (msg.includes('invalid email')) return 'Formato de e-mail inválido.';

    return error.message || 'Ocorreu um erro na autenticação. Tente novamente.';
};

export const AuthService = {
    async signInWithGoogle() {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {

                redirectTo: `${window.location.origin}/dashboard`,
            },
        });
        if (error) throw new Error(getErrorMessage(error));
        return data;
    },

    async signUp(email: string, pass: string, fullName: string) {
        const { data, error } = await supabase.auth.signUp({
            email,
            password: pass,
            options: {

                data: { full_name: fullName },
                emailRedirectTo: `${window.location.origin}/dashboard`,
            },
        });
        if (error) throw new Error(getErrorMessage(error));
        return data;
    },

    async signIn(email: string, pass: string) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password: pass,
        });
        if (error) throw new Error(getErrorMessage(error));
        return data;
    },

    async signOut() {
        const { error } = await supabase.auth.signOut();
        if (error) throw new Error(getErrorMessage(error));
    },

    async getUser() {
        const { data: { user } } = await supabase.auth.getUser();
        return user;
    }
};
