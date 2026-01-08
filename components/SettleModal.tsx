
import React, { useState } from 'react';
import { User, Expense } from '../types';

interface SettleModalProps {
  user: User;
  balance: number;
  partnerName: string;
  onClose: () => void;
  onSettle: (amount: number) => void;
}

const SettleModal: React.FC<SettleModalProps> = ({ user, balance, partnerName, onClose, onSettle }) => {
  const amountToPay = Math.abs(balance);
  const [value, setValue] = useState(amountToPay.toFixed(2));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numValue = parseFloat(value);
    if (numValue > 0) {
      onSettle(numValue);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/40 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-md bg-white rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl p-8 animate-slideUp">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-black text-slate-800 tracking-tight">Acertar Contas</h3>
          <button onClick={onClose} className="p-2 bg-slate-100 rounded-xl text-slate-500 hover:bg-slate-200 transition-colors">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-8 p-6 bg-emerald-50 rounded-3xl border border-emerald-100 text-center">
          <p className="text-emerald-600 font-bold text-sm uppercase tracking-widest mb-1">Dívida Total</p>
          <p className="text-4xl font-black text-emerald-700 tracking-tighter">R$ {amountToPay.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          <p className="text-emerald-600/60 text-xs mt-2 font-medium">Você deve para {partnerName}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Quanto você vai pagar agora?</label>
            <div className="relative">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-emerald-600 font-black text-xl">R$</span>
              <input
                autoFocus
                required
                type="number"
                step="0.01"
                min="0.01"
                max={amountToPay}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full pl-14 pr-5 py-5 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-black text-2xl text-emerald-700 shadow-inner"
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-2 font-bold px-2">
              Você pode pagar o valor total ou apenas uma parte hoje.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
             <button 
               type="button" 
               onClick={() => setValue((amountToPay / 2).toFixed(2))}
               className="py-3 bg-slate-50 text-slate-500 rounded-xl text-xs font-black hover:bg-slate-100 transition-all"
             >
               Pagar Metade
             </button>
             <button 
               type="button" 
               onClick={() => setValue(amountToPay.toFixed(2))}
               className="py-3 bg-slate-50 text-slate-500 rounded-xl text-xs font-black hover:bg-slate-100 transition-all"
             >
               Pagar Tudo
             </button>
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-600 text-white font-black py-5 rounded-[1.5rem] shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all active:scale-95"
          >
            Confirmar Pagamento
          </button>
        </form>
      </div>
    </div>
  );
};

export default SettleModal;
