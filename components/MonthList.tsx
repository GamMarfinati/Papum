
import React from 'react';
import { Expense } from '../types';

interface MonthListProps {
  expenses: Expense[];
  onBack: () => void;
  onAddExpense: () => void;
  onEditExpense: (expense: Expense) => void;
}

const MonthList: React.FC<MonthListProps> = ({ expenses, onBack, onAddExpense, onEditExpense }) => {
  const currentMonthYear = new Date().toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
  const totalValue = expenses
    .filter(e => e.category !== 'Pagamento')
    .reduce((sum, e) => sum + e.value, 0);

  return (
    <div className="min-h-screen pb-32 bg-white">
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-100 p-4 flex items-center justify-between">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-slate-100 rounded-full transition text-slate-600"
          aria-label="Voltar"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <h2 className="text-xl font-bold text-slate-800 capitalize">{currentMonthYear}</h2>
        <div className="w-10"></div>
      </header>

      <div className="p-4 max-w-2xl mx-auto space-y-6">
        {expenses.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <svg className="mx-auto h-12 w-12 opacity-20 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p>Nenhuma despesa registrada ainda.</p>
          </div>
        ) : (
          <>
            <div className="divide-y divide-slate-100">
              {expenses.map((expense) => {
                const isPayment = expense.category === 'Pagamento';
                return (
                  <div 
                    key={expense.id} 
                    onClick={() => onEditExpense(expense)}
                    className={`py-4 flex justify-between items-center animate-fadeIn cursor-pointer hover:bg-slate-50 transition-colors rounded-lg px-2 -mx-2 ${isPayment ? 'bg-emerald-50/30' : ''}`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-bold ${
                        isPayment ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {isPayment ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        ) : expense.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className={`font-semibold ${isPayment ? 'text-emerald-800' : 'text-slate-800'}`}>{expense.name}</h4>
                        <p className="text-xs text-slate-500">{new Date(expense.date).toLocaleDateString('pt-BR')}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${isPayment ? 'text-emerald-600' : 'text-slate-900'}`}>
                        {isPayment ? '-' : ''}R$ {expense.value.toFixed(2)}
                      </p>
                      <p className="text-[10px] text-slate-400 font-medium uppercase tracking-tight">
                        {isPayment ? 'Pagou para participante' : `Pago por ${expense.paidBy.split(' ')[0]}`}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="pt-6 border-t-2 border-slate-100 flex justify-between items-center">
               <span className="text-slate-500 font-medium">Total de Gastos (Consumo)</span>
               <span className="text-2xl font-black text-slate-900">R$ {totalValue.toFixed(2)}</span>
            </div>
          </>
        )}
      </div>

      <button
        onClick={onAddExpense}
        className="fixed bottom-8 right-8 h-14 w-14 bg-emerald-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-emerald-700 transition-all transform hover:scale-110 active:scale-90 z-50"
        aria-label="Adicionar despesa"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>
  );
};

export default MonthList;
