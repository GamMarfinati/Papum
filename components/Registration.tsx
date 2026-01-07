
import React, { useState } from 'react';
import { User } from '../types';

interface RegistrationProps {
  onRegister: (user: User) => void;
}

const Registration: React.FC<RegistrationProps> = ({ onRegister }) => {
  const [name, setName] = useState('');
  const [pix, setPix] = useState('');
  const [phone, setPhone] = useState('');
  const [roommates, setRoommates] = useState('2');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && pix && phone) {
      onRegister({ name, pix, phone, roommates: parseInt(roommates) || 2 });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-emerald-50">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 space-y-6">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-2xl mb-4">
            <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Setup da Casa</h1>
          <p className="text-slate-500 mt-2">Personalize como as contas serão divididas.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Seu Nome</label>
            <input
              required
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition"
              placeholder="Ex: João Silva"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Chave Pix</label>
              <input
                required
                type="text"
                value={pix}
                onChange={(e) => setPix(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition"
                placeholder="CPF ou Celular"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Moradores</label>
              <input
                required
                type="number"
                min="1"
                value={roommates}
                onChange={(e) => setRoommates(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Seu WhatsApp</label>
            <input
              required
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition"
              placeholder="(00) 00000-0000"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl shadow-xl transition-all transform active:scale-95"
          >
            Configurar Casa
          </button>
        </form>
      </div>
    </div>
  );
};

export default Registration;
