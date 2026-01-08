
import React, { useState, useEffect } from 'react';
import { Expense, User, ExpenseCategory } from '../types';

interface AddExpenseModalProps {
  user: User;
  onClose: () => void;
  onAdd: (expense: Omit<Expense, 'id'>) => void;
  onUpdate: (id: string, expense: Omit<Expense, 'id'>) => void;
  onDelete: (id: string) => void;
  initialData?: Expense | null;
}

const categories: ExpenseCategory[] = ['Casa', 'Mercado', 'Luz/Água', 'Internet', 'Outros'];

const AddExpenseModal: React.FC<AddExpenseModalProps> = ({ 
  user, 
  onClose, 
  onAdd, 
  onUpdate, 
  onDelete, 
  initialData 
}) => {
  const [name, setName] = useState('');
  const [value, setValue] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('Outros');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [sharePercentage, setSharePercentage] = useState<number>(user.sharePercentage || 50);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setValue(initialData.value.toString());
      setCategory(initialData.category);
      setDate(initialData.date);
      setSharePercentage(initialData.sharePercentage ?? user.sharePercentage ?? 50);
    }
  }, [initialData, user.sharePercentage]);

  const handleSubmit = (e: React.FormEvent) => {
     e.preventDefault();
     if (name && value) {
       const expenseData = {
         name,
         value: parseFloat(value),
         date,
         category,
         paidBy: user.name,
         sharePercentage
       };
 
       if (initialData) {
         onUpdate(initialData.id, expenseData);
       } else {
         onAdd(expenseData);
       }
       onClose();
     }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/40 backdrop-blur-md">
      <div className="w-full max-w-lg bg-white rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl p-8 animate-slideUp overflow-y-auto max-h-[95vh]">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">
            {initialData ? 'Editar Despesa' : 'Nova despesa'}
          </h3>
          <button onClick={onClose} className="p-2 bg-slate-100 rounded-xl text-slate-500 hover:bg-slate-200 transition-colors">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Descrição</label>
              <input
                autoFocus
                required
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-medium"
                placeholder="Ex: Mercado do mês"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Valor (R$)</label>
              <input
                required
                type="number"
                step="0.01"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-bold text-emerald-700"
                placeholder="0,00"
              />
            </div>
          </div>

          <div className="bg-slate-50 p-5 rounded-[2rem] border border-slate-100">
             <div className="flex justify-between items-center mb-4">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Divisão Proporcional</label>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                  Sua parte: {sharePercentage}%
                </span>
             </div>
             
             <input
               type="range"
               min="0"
               max="100"
               step="5"
               value={sharePercentage}
               onChange={(e) => setSharePercentage(parseInt(e.target.value))}
               className="w-full h-2 bg-emerald-100 rounded-lg appearance-none cursor-pointer accent-emerald-600 mb-4"
             />

             <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                <span>0% (Só ela)</span>
                <span>50/50</span>
                <span>100% (Só você)</span>
             </div>
             
             <p className="text-[10px] text-slate-400 mt-4 leading-relaxed bg-white/50 p-2 rounded-xl italic">
                Ajuste se este gasto específico deve ser dividido de forma diferente da regra geral da casa.
             </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Categoria</label>
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border ${
                    category === cat 
                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-100 scale-105' 
                    : 'bg-white border-slate-200 text-slate-500 hover:border-emerald-300'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Data do Pagamento</label>
            <input
              required
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
            />
          </div>

          <div className="pt-4 flex flex-col gap-3">
            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-5 rounded-2xl shadow-xl shadow-emerald-50 transition-all transform active:scale-95"
            >
              {initialData ? 'Atualizar Gasto' : 'Adicionar à Casa'}
            </button>
            
            {initialData && (
              <button
                type="button"
                onClick={() => { if(confirm('Excluir?')) { onDelete(initialData.id); onClose(); } }}
                className="w-full bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold py-4 rounded-2xl transition-all"
              >
                Excluir Registro
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddExpenseModal;
