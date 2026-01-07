
import React, { useState, useEffect } from 'react';
import { Expense } from '../types';
import { analyzeExpenses } from '../services/geminiService';

interface MonthListProps {
  expenses: Expense[];
  onBack: () => void;
  onAddExpense: () => void;
  onEditExpense: (expense: Expense) => void;
}

const MonthList: React.FC<MonthListProps> = ({ expenses, onBack, onAddExpense, onEditExpense }) => {
  const [insight, setInsight] = useState<string>('Carregando análise inteligente...');
  
  const currentMonthYear = new Date().toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
  const totalValue = expenses.reduce((sum, e) => sum + e.value, 0);

  useEffect(() => {
    const fetchInsight = async () => {
      const result = await analyzeExpenses(expenses);
      setInsight(result);
    };
    fetchInsight();
  }, [expenses]);

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
        {/* Gemini Insight */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-4 text-white shadow-lg">
          <div className="flex items-center space-x-2 mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M11.3 1.047a1 1 0 01.897.95l1.418 15.924a1 1 0 01-1.087 1.085l-15.924-1.418a1 1 0 01-.95-.897L1.047 8.7a1 1 0 01.897-.95l15.924-1.418a1 1 0 011.087 1.085L17.536 23.336a1 1 0 01-.897.95L.715 22.868a1 1 0 01-1.085-1.087l1.418-15.924a1 1 0 01.95-.897l15.924 1.418z" />
              <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1z" />
            </svg>
            <span className="text-xs font-bold uppercase tracking-wider">Insight IA</span>
          </div>
          <p className="text-sm font-medium leading-relaxed italic">{insight}</p>
        </div>

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
              {expenses.map((expense) => (
                <div 
                  key={expense.id} 
                  onClick={() => onEditExpense(expense)}
                  className="py-4 flex justify-between items-center animate-fadeIn cursor-pointer hover:bg-slate-50 transition-colors rounded-lg px-2 -mx-2"
                >
                  <div className="flex items-center space-x-4">
                    <div className="h-10 w-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 font-bold">
                      {expense.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-800">{expense.name}</h4>
                      <p className="text-xs text-slate-500">{new Date(expense.date).toLocaleDateString('pt-BR')}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900">R$ {expense.value.toFixed(2)}</p>
                    <p className="text-[10px] text-emerald-600 font-medium uppercase tracking-tight">Pago por {expense.paidBy.split(' ')[0]}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="pt-6 border-t-2 border-slate-100 flex justify-between items-center">
               <span className="text-slate-500 font-medium">Total de despesas</span>
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
