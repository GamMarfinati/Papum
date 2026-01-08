
import React, { useState, useEffect } from 'react';
import { User, Expense, ViewState } from './types';
import Registration from './components/Registration';
import Dashboard from './components/Dashboard';
import MonthList from './components/MonthList';
import AddExpenseModal from './components/AddExpenseModal';
import { supabase } from './services/supabaseClient';
import ConfirmModal from './components/ConfirmModal';
import Auth from './components/Auth';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('loading');
  const [user, setUser] = useState<User | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [lastExpenseCount, setLastExpenseCount] = useState<number>(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);


  // Notification logic
  useEffect(() => {
    if (expenses.length > lastExpenseCount && lastExpenseCount > 0) {
      const newExpense = expenses[0]; // Ordered by date DESC
      if (newExpense.category === 'Pagamento' && newExpense.paidBy !== user?.name) {
        setConfirmConfig({
          isOpen: true,
          title: 'Pagamento Recebido! 💸',
          message: `${newExpense.paidBy} acabou de registrar um pagamento de R$ ${newExpense.value.toFixed(2)}. Seu saldo foi atualizado!`,
          type: 'info',
          onConfirm: () => setConfirmConfig(prev => ({ ...prev, isOpen: false }))
        });
      }
    }
    setLastExpenseCount(expenses.length);
  }, [expenses]);

  // Confirm Modal State
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type?: 'danger' | 'info';
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // Load user from localStorage or URL on mount
  useEffect(() => {
    const checkUser = async () => {
      // 1. Check Auth Session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setView('auth');
        return;
      }

      // 2. Load profile from Auth
      const authUser = session.user;
      const profile = {
        name: authUser.user_metadata.full_name || '',
        pix: authUser.user_metadata.pix || '',
        phone: authUser.user_metadata.phone || '',
      };

      // 3. Check for saved house context
      const savedUser = localStorage.getItem('house_user');
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
        // Merge auth profile with house context
        const mergedUser = { ...parsedUser, ...profile };
        setUser(mergedUser);
        setView('dashboard');
        if (mergedUser.houseId) {
          fetchExpenses(mergedUser.houseId);
          subscribeToExpenses(mergedUser.houseId);
        }
      } else {
        setView('registration');
      }
    };

    checkUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) setView('auth');
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleAuthSuccess = (session: any) => {
    const profile = {
      name: session.user.user_metadata.full_name || '',
      pix: session.user.user_metadata.pix || '',
      phone: session.user.user_metadata.phone || '',
    };
    
    // Check if we have a saved house but no session previously
    const savedUser = localStorage.getItem('house_user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      const mergedUser = { ...parsedUser, ...profile };
      setUser(mergedUser);
      localStorage.setItem('house_user', JSON.stringify(mergedUser));
      setView('dashboard');
      if (mergedUser.houseId) {
        fetchExpenses(mergedUser.houseId);
        subscribeToExpenses(mergedUser.houseId);
      }
    } else {
      setView('registration');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('house_user');
    setUser(null);
    setExpenses([]);
    setView('auth');
  };

  const fetchExpenses = async (houseId: string) => {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('house_id', houseId)
      .order('date', { ascending: false });

    if (!error && data) {
      const formattedExpenses: Expense[] = data.map(e => ({
        id: e.id,
        name: e.name,
        date: e.date,
        value: parseFloat(e.value),
        category: e.category as any,
        paidBy: e.paid_by,
        sharePercentage: (e.share_percentage !== null && e.share_percentage !== undefined) ? parseFloat(e.share_percentage) : undefined
      }));
      setExpenses(formattedExpenses);
    }
  };

  const subscribeToExpenses = (houseId: string) => {
    supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'expenses',
          filter: `house_id=eq.${houseId}`
        },
        () => {
          fetchExpenses(houseId);
        }
      )
      .subscribe();
  };

  const handleRegister = (newUser: User) => {
    setUser(newUser);
    localStorage.setItem('house_user', JSON.stringify(newUser));
    
    // Save to recent groups
    if (newUser.houseId) {
      const recentGroups = JSON.parse(localStorage.getItem('papum_recent_groups') || '[]');
      const groupName = newUser.name.endsWith('s Group') ? newUser.name : `${newUser.name}'s Group`;
      
      // Prevent duplicates
      const filteredGroups = recentGroups.filter((g: any) => g.id !== newUser.houseId);
      const updatedGroups = [{ id: newUser.houseId, name: groupName }, ...filteredGroups].slice(0, 5);
      
      localStorage.setItem('papum_recent_groups', JSON.stringify(updatedGroups));
      
      fetchExpenses(newUser.houseId);
      subscribeToExpenses(newUser.houseId);
    }
    
    setView('dashboard');
  };

  const handleAddExpense = async (expenseData: Omit<Expense, 'id'>) => {
    if (!user?.houseId) return;

    const { error } = await supabase
      .from('expenses')
      .insert([{
        name: expenseData.name,
        date: expenseData.date,
        value: expenseData.value,
        category: expenseData.category,
        paid_by: expenseData.paidBy,
        share_percentage: expenseData.sharePercentage,
        house_id: user.houseId
      }]);

    if (error) {
      console.error('Error adding expense:', error);
      setConfirmConfig({
        isOpen: true,
        title: 'Ops! Erro',
        message: 'Não conseguimos salvar sua despesa agora. Verifique se você está conectado à internet.',
        type: 'danger',
        onConfirm: () => setConfirmConfig(prev => ({ ...prev, isOpen: false }))
      });
    }
  };

  const handleUpdateExpense = async (id: string, expenseData: Omit<Expense, 'id'>) => {
    const { error } = await supabase
      .from('expenses')
      .update({
        name: expenseData.name,
        date: expenseData.date,
        value: expenseData.value,
        category: expenseData.category,
        paid_by: expenseData.paidBy,
        share_percentage: expenseData.sharePercentage
      })
      .eq('id', id);

    if (error) {
      console.error('Error updating expense:', error);
      alert('Erro ao atualizar despesa');
    }
  };

  const handleUpdateGroup = async (groupData: { name?: string, pix?: string, sharePercentage?: number }) => {
    if (!user?.houseId) return;

    const { error } = await supabase
      .from('house_config')
      .update({
        name: groupData.name,
        pix: groupData.pix,
        share_percentage: groupData.sharePercentage
      })
      .eq('id', user.houseId);

    if (error) {
      console.error('Error updating group:', error);
      alert('Erro ao atualizar grupo');
      return;
    }

    // Update local state and storage
    const updatedUser = { ...user, ...groupData };
    setUser(updatedUser);
    localStorage.setItem('house_user', JSON.stringify(updatedUser));
    
    // Update recent groups name if changed
    if (groupData.name) {
      const recentGroups = JSON.parse(localStorage.getItem('papum_recent_groups') || '[]');
      const updatedGroups = recentGroups.map((g: any) => 
        g.id === user.houseId ? { ...g, name: groupData.name } : g
      );
      localStorage.setItem('papum_recent_groups', JSON.stringify(updatedGroups));
    }
  };

  const handleDeleteGroup = async () => {
    if (!user?.houseId) return;
    
    setConfirmConfig({
      isOpen: true,
      title: 'Excluir Grupo?',
      message: 'TEM CERTEZA? Isso excluirá permanentemente o GRUPO e TODAS as despesas. Não há como desfazer!',
      type: 'danger',
      onConfirm: async () => {
        // 1. Delete all expenses
        await supabase.from('expenses').delete().eq('house_id', user.houseId as any);
        
        // 2. Delete house config
        await supabase.from('house_config').delete().eq('id', user.houseId as any);

        // 3. Clear local list
        const recentGroups = JSON.parse(localStorage.getItem('papum_recent_groups') || '[]');
        const filteredGroups = recentGroups.filter((g: any) => g.id !== user.houseId);
        localStorage.setItem('papum_recent_groups', JSON.stringify(filteredGroups));

        handleLeaveHouse();
      }
    });
  };

  const handleDeleteExpense = async (id: string) => {
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting expense:', error);
      alert('Erro ao deletar despesa');
    }
  };

  const handleSettle = async (amount: number) => {
    if (!user?.houseId) return;

    const { error } = await supabase
      .from('expenses')
      .insert([{
        name: 'Acerto de Contas',
        date: new Date().toISOString().split('T')[0],
        value: amount,
        category: 'Pagamento',
        paid_by: user.name,
        share_percentage: 0, // Payer gets 0% of the cost, so it's a pure credit
        house_id: user.houseId
      }]);

    if (error) {
      console.error('Error settling debt:', error);
      alert('Erro ao processar pagamento');
    }
  };

  const handleLeaveHouse = () => {
    localStorage.removeItem('house_user');
    setUser(null);
    setExpenses([]);
    setView('registration');
  };

  const openEditModal = (expense: Expense) => {
    setEditingExpense(expense);
    setShowAddModal(true);
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditingExpense(null);
  };

  const triggerConfirm = (config: { title: string, message: string, onConfirm: () => void, type?: 'danger' | 'info' }) => {
    setConfirmConfig({
      isOpen: true,
      ...config,
      onConfirm: () => {
        config.onConfirm();
        setConfirmConfig(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  if (view === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-emerald-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          <p className="font-black text-emerald-800 tracking-tighter text-2xl animate-pulse">PaPum</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 overflow-x-hidden">
      {view === 'auth' && <Auth onAuthSuccess={handleAuthSuccess} />}

      {view === 'registration' && (
        <Registration 
          onRegister={handleRegister} 
          triggerConfirm={triggerConfirm} 
          initialProfile={user ? { name: user.name, pix: user.pix, phone: user.phone } : undefined}
          onLogout={handleLogout}
        />
      )}
      
      {view === 'dashboard' && user && (
        <Dashboard 
          user={user} 
          expenses={expenses} 
          onNavigateToMonth={() => setView('month_list')} 
          onLeaveHouse={handleLeaveHouse}
          onUpdateGroup={handleUpdateGroup}
          onDeleteGroup={handleDeleteGroup}
          onLogout={handleLogout}
          onSettle={handleSettle}
          triggerConfirm={triggerConfirm}
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

      {/* Custom Global Modal */}
      <ConfirmModal 
        {...confirmConfig}
        onCancel={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
      />

      {showAddModal && user && (
        <AddExpenseModal 
          user={user}
          onClose={closeModal}
          onAdd={handleAddExpense}
          onUpdate={handleUpdateExpense}
          onDelete={handleDeleteExpense}
          initialData={editingExpense}
          triggerConfirm={triggerConfirm}
        />
      )}

      {user?.houseId && view === 'dashboard' && (
        <div className="bg-white border-t border-slate-100 p-4 fixed bottom-0 left-0 right-0 shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.05)]">
           <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-center sm:text-left">
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Seu ID do Grupo (Convide sua esposa):</p>
                <p className="text-sm font-mono font-bold text-slate-600 select-all">{user.houseId}</p>
              </div>
              
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => {
                    const shareUrl = `${window.location.origin}?houseId=${user.houseId}`;
                    const message = `Oi! Entra aqui no PaPum pra gente dividir nossas contas: ${shareUrl}`;
                    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
                  }}
                  className="flex items-center space-x-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 shadow-lg shadow-emerald-100"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.031 6.172c-2.32 0-4.518.903-6.155 2.54a8.677 8.677 0 0 0-2.54 6.155c0 1.94.618 3.824 1.777 5.378l-1.89 6.94 7.07-1.854a8.64 8.64 0 0 0 4.14 1.054c2.321 0 4.519-.903 6.156-2.54a8.683 8.683 0 0 0 2.54-6.156 8.64 8.64 0 0 0-11.098-11.53zm5.738 12.311a6.666 6.666 0 0 1-4.735 1.956c-1.32 0-2.614-.354-3.743-1.026l-.268-.158-4.2 1.1 1.118-4.102-.172-.275a6.685 6.685 0 0 1-1.066-3.61c0-1.782.695-3.457 1.956-4.717a6.68 6.68 0 0 1 4.717-1.956c1.782 0 3.457.695 4.717 1.956a6.69 6.69 0 0 1 1.957 4.717 6.66 6.66 0 0 1-1.931 4.717v-.004zm-3.078-4.18c-.167-.083-.984-.486-1.137-.541-.153-.056-.264-.083-.375.083-.111.167-.43.541-.528.653-.097.111-.194.125-.361.042-.167-.083-.704-.26-1.341-.827-.496-.443-.83-.99-.927-1.157-.097-.167-.01-.257.073-.34.076-.075.167-.194.25-.291.083-.097.111-.167.167-.278.056-.111.028-.208-.014-.291-.042-.083-.375-.903-.514-1.237-.135-.327-.272-.282-.375-.287l-.319-.004c-.111 0-.292.042-.444.208-.153.167-.583.569-.583 1.389 0 .819.597 1.611.68 1.722.083.111 1.17 1.787 2.834 2.503.396.17.705.271.946.348.398.127.76.108 1.047.065.32-.047.984-.403 1.123-.792.14-.389.14-.722.097-.792-.042-.07-.153-.111-.32-.194z"/>
                  </svg>
                  <span>WhatsApp</span>
                </button>
                <button 
                  onClick={() => {
                    const shareUrl = `${window.location.origin}?houseId=${user.houseId}`;
                    navigator.clipboard.writeText(shareUrl);
                    alert('Link de convite copiado!');
                  }}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95"
                >
                  Copiar Link
                </button>
              </div>
           </div>
        </div>
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
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn { animation: fadeIn 0.4s ease-out forwards; }
        .animate-slideUp { animation: slideUp 0.3s ease-out forwards; }
        .animate-scaleIn { animation: scaleIn 0.2s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default App;
