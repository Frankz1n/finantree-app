import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Sparkles, Loader2, CheckCircle2, Sprout } from 'lucide-react';
import { toast } from 'sonner';

export default function PreSave() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
            setStatus('error');
            setErrorMessage('Por favor, insira um e-mail válido.');
            return;
        }

        setLoading(true);
        setStatus('idle');

        try {
            const { error } = await supabase
                .from('waitlist')
                .insert([{ email }]);

            if (error) {
                if (error.code === '23505') {
                    throw new Error('Este e-mail já está na nossa fila de espera VIP!');
                }
                console.error('Supabase Error:', error);
                throw new Error('Ocorreu um erro ao salvar seu e-mail. Tente novamente.');
            }

            setStatus('success');
            toast.success('Você entrou para a lista VIP!', {
                description: 'Fique de olho no seu e-mail para as próximas novidades.'
            });
            setEmail('');

        } catch (err: any) {
            setStatus('error');
            setErrorMessage(err.message || 'Erro inesperado.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0a0a] text-white relative overflow-hidden font-sans">

            {/* Background Grid Sutil com Mask para aparecer só no bottom right */}
            <div
                className="absolute inset-0 z-0 opacity-40 pointer-events-none"
                style={{
                    backgroundImage: `linear-gradient(rgba(16, 185, 129, 0.25) 1px, transparent 1px), linear-gradient(90deg, rgba(16, 185, 129, 0.25) 1px, transparent 1px)`,
                    backgroundSize: '4rem 4rem',
                    maskImage: 'radial-gradient(circle at bottom right, black 0%, transparent 70%)',
                    WebkitMaskImage: 'radial-gradient(circle at bottom right, black 0%, transparent 70%)',
                }}
            />

            {/* Header: Top Right Button */}
            <header className="absolute top-6 right-6 z-20">
                <Link
                    to="/login"
                    className="inline-flex items-center justify-center rounded-full border border-zinc-800 bg-transparent px-5 py-2 text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
                >
                    Acessar App
                </Link>
            </header>

            {/* Main Content Center */}
            <main className="relative z-10 flex flex-col items-center justify-center w-full px-4 max-w-4xl">

                {/* Logo Section */}
                <div className="flex items-center justify-center gap-3 mb-8">
                    <div className="h-12 w-12 md:h-14 md:w-14 rounded-2xl bg-[#10b981] flex items-center justify-center shadow-lg shadow-[#10b981]/10">
                        <Sprout size={28} className="text-white" />
                    </div>
                    <span className="text-3xl font-bold text-white tracking-tight">Finantree</span>
                </div>

                {/* Badge ✨ Inteligência Artificial Financeira */}
                <div className="mb-10 rounded-full border border-zinc-800 bg-zinc-900/50 px-4 py-1.5 flex items-center justify-center gap-2">
                    <Sparkles size={14} className="text-amber-500" />
                    <span className="text-xs md:text-sm font-medium text-gray-300">Inteligência Artificial Financeira</span>
                </div>

                {/* Typography Block */}
                <div className="text-center flex flex-col items-center mb-12">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight md:leading-[1.15] mb-6">
                        O futuro do seu dinheiro<br />no piloto automático.
                    </h1>
                    <p className="text-base md:text-lg text-gray-400 max-w-2xl leading-relaxed">
                        Conecte seus bancos, controle seus gastos sem planilhas e deixe o Oráculo
                        guiar suas finanças. Entre para a lista VIP e ganhe benefícios exclusivos no lançamento.
                    </p>
                </div>

                {/* Capture Form */}
                <form onSubmit={handleSubmit} className="w-full max-w-md md:max-w-xl relative">
                    <div className="flex items-center bg-[#121212] p-1.5 rounded-full border border-zinc-800 shadow-xl">
                        <input
                            type="email"
                            required
                            placeholder="Seu melhor e-mail"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                if (status !== 'success') setStatus('idle');
                            }}
                            disabled={status === 'success' || loading}
                            className="flex-1 bg-transparent border-none text-white placeholder-zinc-500 focus:ring-0 outline-none px-5 text-sm md:text-base disabled:opacity-50 w-full"
                        />
                        <button
                            type="submit"
                            disabled={status === 'success' || loading}
                            className={`rounded-full px-6 md:px-8 py-2.5 md:py-3 font-semibold text-white transition-all flex items-center justify-center gap-2 whitespace-nowrap text-sm md:text-base ${status === 'success'
                                ? 'bg-[#10b981]/20 text-[#10b981]'
                                : 'bg-[#10b981] hover:bg-emerald-500'
                                }`}
                        >
                            {loading ? (
                                <Loader2 size={18} className="animate-spin" />
                            ) : status === 'success' ? (
                                <>
                                    <CheckCircle2 size={18} />
                                    VIP Garantido!
                                </>
                            ) : (
                                'Garantir meu acesso VIP'
                            )}
                        </button>
                    </div>

                    {/* Error Message */}
                    {status === 'error' && (
                        <p className="text-red-400 text-sm mt-4 text-center absolute -bottom-8 left-0 right-0">
                            {errorMessage}
                        </p>
                    )}
                </form>

            </main>
        </div>
    );
}
