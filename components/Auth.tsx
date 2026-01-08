
import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';

interface AuthProps {
  onAuthSuccess: (userSession: any) => void;
}

const Auth: React.FC<AuthProps> = ({ onAuthSuccess }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [pix, setPix] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      if (mode === 'signup') {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
              pix: pix,
              phone: phone
            },
            emailRedirectTo: window.location.origin
          }
        });
        if (signUpError) throw signUpError;
        setMessage('📨 Quase lá! Enviamos um link de confirmação para o seu e-mail. Ative sua conta para entrar.');
        setMode('login');
      } else {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (signInError) throw signInError;
        if (data.session) onAuthSuccess(data.session);
      }
    } catch (err: any) {
      setError(err.message || 'Erro na autenticação');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-emerald-50/50">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl p-8 space-y-8 relative overflow-hidden">
        {/* Decoration */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-32 h-32 bg-emerald-100 rounded-full opacity-20"></div>

        <div className="text-center relative">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-2xl mb-6 shadow-sm">
             <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
             </svg>
          </div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">
            {mode === 'login' ? 'Bem-vindo de volta' : 'Crie sua conta'}
          </h1>
          <p className="text-slate-400 font-medium mt-2">
            {mode === 'login' ? 'Entre para gerenciar seus grupos.' : 'Cadastre-se para salvar seus dados do PaPum.'}
          </p>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl text-sm font-bold border border-rose-100 animate-fadeIn text-center">
            {error}
          </div>
        )}

        {message && (
          <div className="p-4 bg-emerald-50 text-emerald-700 rounded-2xl text-sm font-bold border border-emerald-100 animate-fadeIn text-center">
            {message}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          {mode === 'signup' && (
            <>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Seu Nome</label>
                <input
                  required
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-medium"
                  placeholder="Seu nome completo"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Chave PIX</label>
                  <input
                    required
                    type="text"
                    value={pix}
                    onChange={(e) => setPix(e.target.value)}
                    className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-medium text-sm"
                    placeholder="Celular/CPF"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">WhatsApp</label>
                  <input
                    required
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-medium text-sm"
                    placeholder="(00) 00000-0000"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">E-mail</label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-medium"
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Senha</label>
            <input
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-medium"
              placeholder="••••••••"
            />
          </div>

          <button
            disabled={loading}
            type="submit"
            className="w-full bg-slate-900 text-white font-black py-5 rounded-[1.5rem] shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all hover:-translate-y-1 active:scale-95 disabled:opacity-50"
          >
            {loading ? 'Processando...' : mode === 'login' ? 'Entrar' : 'Cadastrar agora'}
          </button>
        </form>

        <div className="text-center pt-4">
          <button
            onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
            className="text-slate-500 font-bold text-sm hover:text-emerald-600 transition-colors"
          >
            {mode === 'login' ? 'Não tem uma conta? Cadastre-se' : 'Já tem uma conta? Entre aqui'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
