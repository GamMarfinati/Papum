
import React, { useState, useEffect } from 'react';
import { User, Expense, ViewState } from './types';
import Registration from './components/Registration';
import Dashboard from './components/Dashboard';
import MonthList from './components/MonthList';
import AddExpenseModal from './components/AddExpenseModal';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('registration');
  const [user, setUser] = useState<User | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  // Load state from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('house_user');
    const savedExpenses = localStorage.getItem('house_expenses');
    
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setView('dashboard');
    }
    if (savedExpenses) {
      setExpenses(JSON.parse(savedExpenses));
    }
  }, []);

  // Save state to localStorage
  useEffect(() => {
    if (user) localStorage.setItem('house_user', JSON.stringify(user));
    localStorage.setItem('house_expenses', JSON.stringify(expenses));
  }, [user, expenses]);

  const handleRegister = (newUser: User) => {
    setUser(newUser);
    setView('dashboard');
  };

  const handleAddExpense = (expenseData: Omit<Expense, 'id'>) => {
    const newExpense: Expense = {
      ...expenseData,
      id: Math.random().toString(36).substr(2, 9)
    };
    setExpenses(prev => [newExpense, ...prev]);
  };

  const handleUpdateExpense = (id: string, expenseData: Omit<Expense, 'id'>) => {
    setExpenses(prev => prev.map(exp => exp.id === id ? { ...exp, ...expenseData } : exp));
  };

  const handleDeleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(exp => exp.id !== id));
  };

  const openEditModal = (expense: Expense) => {
    setEditingExpense(expense);
    setShowAddModal(true);
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditingExpense(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 overflow-x-hidden">
      {view === 'registration' && <Registration onRegister={handleRegister} />}
      
      {view === 'dashboard' && user && (
        <Dashboard 
          user={user} 
          expenses={expenses} 
          onNavigateToMonth={() => setView('month_list')} 
        />
      )}

      {view === 'month_list' && user && (
        <MonthList 
          expenses={expenses} 
          onBack={() => setView('dashboard')}
          onAddExpense={() => setShowAddModal(true)}
          onEditExpense={openEditModal}
        />
      )}

      {showAddModal && user && (
        <AddExpenseModal 
          user={user}
          onClose={closeModal}
          onAdd={handleAddExpense}
          onUpdate={handleUpdateExpense}
          onDelete={handleDeleteExpense}
          initialData={editingExpense}
        />
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.4s ease-out forwards; }
        .animate-slideUp { animation: slideUp 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default App;
