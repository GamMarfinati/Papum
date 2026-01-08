
import React, { useState } from 'react';
import { Expense, User } from '../types';

interface DashboardProps {
  user: User;
  expenses: Expense[];
  onNavigateToMonth: () => void;
  onLeaveHouse: () => void;
  onUpdateGroup?: (data: { name: string, pix: string, sharePercentage: number }) => void;
  onDeleteGroup?: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, expenses, onNavigateToMonth, onLeaveHouse, onUpdateGroup, onDeleteGroup }) => {
  const [copied, setCopied] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  // 1. Calculate totals
  const totalExpenses = expenses.reduce((sum, e) => sum + e.value, 0);
  const myTotalPaid = expenses.filter(e => e.paidBy === user.name).reduce((sum, e) => sum + e.value, 0);
  
  // 2. Dynamic split logic based on percentage (Individual or House-wide)
  const myRequiredContribution = expenses.reduce((sum, e) => {
    const splitPercent = e.sharePercentage ?? user.sharePercentage ?? 50;
    return sum + (e.value * splitPercent) / 100;
  }, 0);
  
  const balance = myTotalPaid - myRequiredContribution;

  // 3. Find partner info
  const partnerName = expenses.find(e => e.paidBy !== user.name)?.paidBy || "Parceiro(a)";
  const baseShare = user.sharePercentage ?? 50;

  const copyPix = () => {
    navigator.clipboard.writeText(user.pix);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Settings Form State
  const [editName, setEditName] = useState(user.name);
  const [editPix, setEditPix] = useState(user.pix);
  const [editShare, setEditShare] = useState(user.sharePercentage || 50);

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateGroup) {
      onUpdateGroup({ name: editName, pix: editPix, sharePercentage: editShare });
      setShowSettings(false);
    }
  };

  return (
    <div className="p-4 space-y-6 max-w-4xl mx-auto pb-20">
      <header className="flex justify-between items-center py-6">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Olá, {user.name.split(' ')[0]}!</h2>
          <p className="text-slate-500 font-medium font-inter">Divisão flexível de gastos</p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setShowSettings(true)}
            className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-emerald-600 transition-all shadow-sm"
            title="Configurações do Grupo"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
          <button 
            onClick={onLeaveHouse}
            className="text-slate-400 hover:text-rose-500 p-2 rounded-xl hover:bg-rose-50 transition-all group flex items-center space-x-1"
            title="Sair deste grupo"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="text-xs font-bold uppercase tracking-wider hidden sm:inline">Sair</span>
          </button>
          <div className="h-12 w-12 bg-emerald-600 text-white rounded-2xl shadow-lg shadow-emerald-100 flex items-center justify-center font-bold text-xl">
            {user.name.charAt(0)}
          </div>
        </div>
      </header>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl animate-scaleIn">
            <h3 className="text-2xl font-black text-slate-900 mb-6">Ajustes do Grupo</h3>
            
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Nome do Perfil</label>
                <input 
                  type="text" 
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Chave Pix</label>
                <input 
                  type="text" 
                  value={editPix}
                  onChange={(e) => setEditPix(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Sua Parte Padrão (%)</label>
                <input 
                  type="range" min="0" max="100" step="5"
                  value={editShare}
                  onChange={(e) => setEditShare(parseInt(e.target.value))}
                  className="w-full h-2 bg-emerald-100 rounded-lg appearance-none cursor-pointer accent-emerald-600 mb-2"
                />
                <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase">
                   <span>Você: {editShare}%</span>
                   <span>Parceiro: {100-editShare}%</span>
                </div>
              </div>

              <div className="pt-6 space-y-3">
                <button type="submit" className="w-full bg-emerald-600 text-white font-black py-4 rounded-2xl shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all">
                  Salvar Mudanças
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowSettings(false)}
                  className="w-full bg-slate-100 text-slate-600 font-bold py-4 rounded-2xl hover:bg-slate-200 transition-all"
                >
                  Cancelar
                </button>
                <button 
                  type="button" 
                  onClick={() => { if(onDeleteGroup) { onDeleteGroup(); setShowSettings(false); } }}
                  className="w-full bg-rose-50 text-rose-600 font-bold py-4 rounded-2xl hover:bg-rose-100 transition-all mt-4 border border-rose-100"
                >
                  Excluir Grupo Permanentemente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Settlement Alert */}
      <div className={`p-6 rounded-[2rem] border shadow-sm transition-all animate-fadeIn ${
        balance > 0 ? 'bg-blue-50 border-blue-100' : balance < 0 ? 'bg-rose-50 border-rose-100' : 'bg-slate-50 border-slate-100'
      }`}>
        <div className="flex items-start space-x-4">
          <div className={`p-3 rounded-2xl ${balance > 0 ? 'bg-blue-500' : balance < 0 ? 'bg-rose-500' : 'bg-slate-400'} text-white`}>
            {balance >= 0 ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            )}
          </div>
          <div>
            <h4 className={`text-xs font-black uppercase tracking-widest mb-1 ${balance > 0 ? 'text-blue-600' : balance < 0 ? 'text-rose-600' : 'text-slate-500'}`}>
              Resumo de Acerto
            </h4>
            <p className="text-slate-700 font-medium leading-tight">
              {balance > 0 ? (
                <>Você pagou a mais. <strong>{partnerName}</strong> deve te pagar <span className="text-blue-600 font-black">R$ {balance.toFixed(2)}</span>.</>
              ) : balance < 0 ? (
                <>Você pagou a menos. Você deve pagar <span className="text-rose-600 font-black">R$ {Math.abs(balance).toFixed(2)}</span> para seu parceiro(a).</>
              ) : (
                <>As contas estão em dia! Ninguém deve nada para ninguém.</>
              )}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <button 
          onClick={onNavigateToMonth}
          className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all text-left group"
        >
          <div className="flex justify-between items-start mb-6">
            <span className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </span>
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-1 rounded-lg">Mensal</span>
          </div>
          <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest">Gasto Total do Grupo</h3>
          <p className="text-2xl font-black text-slate-800 mt-1">R$ {totalExpenses.toFixed(2)}</p>
          <div className="mt-4 pt-4 border-t border-slate-50 text-[10px] text-slate-400 flex flex-col gap-1 uppercase font-bold tracking-tighter">
            <span>Sua contribuição exigida: R$ {myRequiredContribution.toFixed(2)}</span>
            <span className="text-[8px] opacity-70 italic">Calculado com base nos splits individuais de cada gasto</span>
          </div>
        </button>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 transition-all">
          <div className="flex justify-between items-start mb-6">
            <span className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </span>
          </div>
          <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest">Quanto você já pagou</h3>
          <p className="text-2xl font-black text-slate-800 mt-1">R$ {myTotalPaid.toFixed(2)}</p>
          <p className="text-[10px] text-slate-400 mt-2 font-medium italic">Soma de todas as despesas em seu nome.</p>
        </div>
      </div>

      <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
        <div className="relative z-10">
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-slate-400 text-xs font-bold uppercase tracking-widest">Sua Chave Pix</h4>
            <button 
              onClick={copyPix}
              className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95"
            >
              {copied ? 'Copiado!' : 'Copiar Chave'}
            </button>
          </div>
          <p className="text-3xl font-mono font-bold break-all lowercase">{user.pix}</p>
          <div className="mt-8 flex items-center space-x-3 text-sm text-slate-400 bg-white/5 p-4 rounded-2xl">
            <svg className="h-6 w-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Seu parceiro(a) usará esta chave para te pagar no acerto de contas.</span>
          </div>
        </div>
        <div className="absolute top-0 right-0 -mr-16 -mt-16 opacity-10 group-hover:opacity-20 transition-opacity">
           <svg className="h-64 w-64 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
           </svg>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
