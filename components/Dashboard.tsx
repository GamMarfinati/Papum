
import React, { useState } from 'react';
import { Expense, User } from '../types';

interface DashboardProps {
  user: User;
  expenses: Expense[];
  onNavigateToMonth: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, expenses, onNavigateToMonth }) => {
  const [copied, setCopied] = useState(false);
  const currentMonth = new Date().toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
  
  const totalExpenses = expenses.reduce((sum, e) => sum + e.value, 0);
  const myTotalPaid = expenses.filter(e => e.paidBy === user.name).reduce((sum, e) => sum + e.value, 0);
  
  // Split logic based on number of residents
  const sharePerPerson = totalExpenses / user.roommates;
  const balance = myTotalPaid - sharePerPerson;

  const copyPix = () => {
    navigator.clipboard.writeText(user.pix);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-4 space-y-6 max-w-4xl mx-auto pb-20">
      <header className="flex justify-between items-center py-6">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Olá, {user.name.split(' ')[0]}!</h2>
          <p className="text-slate-500 font-medium">Divisão entre {user.roommates} moradores</p>
        </div>
        <div className="h-12 w-12 bg-emerald-600 text-white rounded-2xl shadow-lg shadow-emerald-100 flex items-center justify-center font-bold text-xl">
          {user.name.charAt(0)}
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
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
          <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest">Total da Casa</h3>
          <p className="text-2xl font-black text-slate-800 mt-1">R$ {totalExpenses.toFixed(2)}</p>
        </button>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 transition-all">
          <div className="flex justify-between items-start mb-6">
            <span className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
            {balance > 0 && <span className="flex h-3 w-3 rounded-full bg-blue-500 animate-pulse"></span>}
          </div>
          <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest">A Receber</h3>
          <p className={`text-2xl font-black mt-1 ${balance > 0 ? 'text-blue-600' : 'text-slate-300'}`}>
            R$ {balance > 0 ? balance.toFixed(2) : '0,00'}
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 transition-all">
          <div className="flex justify-between items-start mb-6">
            <span className="p-3 bg-rose-50 text-rose-600 rounded-2xl">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </span>
            {balance < 0 && <span className="flex h-3 w-3 rounded-full bg-rose-500 animate-pulse"></span>}
          </div>
          <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest">A Pagar</h3>
          <p className={`text-2xl font-black mt-1 ${balance < 0 ? 'text-rose-600' : 'text-slate-300'}`}>
            R$ {balance < 0 ? Math.abs(balance).toFixed(2) : '0,00'}
          </p>
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
          <p className="text-3xl font-mono font-bold break-all">{user.pix}</p>
          <div className="mt-8 flex items-center space-x-3 text-sm text-slate-400 bg-white/5 p-4 rounded-2xl">
            <svg className="h-6 w-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Seus moradores precisam pagar a parte deles para esta chave.</span>
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
