
import React, { useState } from 'react';
import { User } from '../types';
import { supabase } from '../services/supabaseClient';

interface RegistrationProps {
  onRegister: (user: User) => void;
  triggerConfirm?: (config: { title: string, message: string, onConfirm: () => void, type?: 'danger' | 'info' }) => void;
}

const Registration: React.FC<RegistrationProps> = ({ onRegister, triggerConfirm }) => {
  const [mode, setMode] = useState<'initial' | 'create' | 'join'>('initial');
  const [joinId, setJoinId] = useState('');
  const [name, setName] = useState('');
  const [pix, setPix] = useState('');
  const [phone, setPhone] = useState('');
  const [roommates, setRoommates] = useState('2');
  const [sharePercentage, setSharePercentage] = useState('50');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  // Load Profile from localStorage on mount
  React.useEffect(() => {
    const savedProfile = localStorage.getItem('papum_user_profile');
    if (savedProfile) {
      const profile = JSON.parse(savedProfile);
      setName(profile.name || '');
      setPix(profile.pix || '');
      setPhone(profile.phone || '');
    }

    const params = new URLSearchParams(window.location.search);
    const urlHouseId = params.get('houseId');
    if (urlHouseId) {
      setJoinId(urlHouseId);
      setMode('join');
    }

    // PWA Install Prompt
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as any);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as any);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  const saveProfile = (p: { name: string, pix: string, phone: string }) => {
    localStorage.setItem('papum_user_profile', JSON.stringify(p));
  };

  const handleCreateHouse = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const { data, error: insertError } = await supabase
        .from('house_config')
        .insert([{ 
          name: `${name}'s Group`, 
          pix, 
          phone, 
          roommates: parseInt(roommates) || 2,
          share_percentage: parseFloat(sharePercentage) || 50
        }])
        .select()
        .single();

      if (insertError) throw insertError;
      
      saveProfile({ name, pix, phone });

      onRegister({ 
        name, 
        pix, 
        phone, 
        roommates: parseInt(roommates) || 2,
        houseId: data.id,
        sharePercentage: parseFloat(sharePercentage) || 50
      });
    } catch (err: any) {
      setError(err.message || 'Erro ao criar grupo');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinHouse = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error: fetchError } = await supabase
        .from('house_config')
        .select('*')
        .eq('id', joinId)
        .single();

      if (fetchError || !data) throw new Error('ID do Grupo não encontrado');

      // For the joining person, we assume they take the remaining percentage (100 - share_percentage)
      const joiningPercentage = 100 - (data.share_percentage || 50);

      saveProfile({ name, pix: data.pix, phone: data.phone });

      onRegister({ 
        name, 
        pix: data.pix, 
        phone: data.phone, 
        roommates: data.roommates,
        houseId: data.id,
        sharePercentage: joiningPercentage
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const [recentGroups, setRecentGroups] = useState<{id: string, name: string}[]>(() => {
    const saved = localStorage.getItem('papum_recent_groups');
    return saved ? JSON.parse(saved) : [];
  });

  const handleShare = async () => {
    const shareData = {
      title: 'PaPum - Divisão de Despesas',
      text: 'Use o PaPum para dividir nossas contas de casa de forma justa!',
      url: window.location.origin
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.origin);
        alert('Link copiado para a área de transferência!');
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  const handleWhatsAppShare = () => {
    const message = `Oi! Vamos usar o PaPum para dividir nossas contas de casa: ${window.location.origin}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  if (mode === 'initial') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-emerald-50/50">
        <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl p-8 space-y-8 text-center relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 -transe-y-1/2 translate-x-1/2 w-32 h-32 bg-emerald-100 rounded-full opacity-20"></div>
          
          <div className="relative">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-2xl mb-6 shadow-sm">
               <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
               </svg>
            </div>
            <h1 className="text-4xl font-black text-slate-800 leading-tight">
              Em casa é sempre <br/>
              <span className="text-emerald-600">PaPum</span>
            </h1>
            <p className="text-slate-400 font-medium mt-3">Divisão de contas justa e simplificada.</p>
          </div>
          
          <div className="space-y-3 pt-4">
            <button 
              onClick={() => setMode('create')}
              className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all hover:-translate-y-1 active:scale-95"
            >
              Novo Grupo
            </button>
            <button 
              onClick={() => setMode('join')}
              className="w-full bg-white text-slate-900 border-2 border-slate-100 font-bold py-4 rounded-2xl hover:bg-slate-50 transition-all active:scale-95"
            >
              Entrar em um grupo
            </button>
          </div>

          {deferredPrompt && (
            <div className="pt-2 animate-fadeIn">
              <button 
                onClick={handleInstallClick}
                className="w-full flex items-center justify-center space-x-2 bg-emerald-50 text-emerald-700 font-black py-4 rounded-2xl border-2 border-emerald-100 hover:bg-emerald-100 transition-all active:scale-95"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <span>Instalar App na tela inicial</span>
              </button>
            </div>
          )}

          {recentGroups.length > 0 && (
            <div className="pt-6 border-t border-slate-50">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Meus grupos</h3>
              <div className="space-y-2">
                {recentGroups.map(group => (
                  <div key={group.id} className="relative group/item">
                    <button 
                      onClick={() => {
                        setJoinId(group.id);
                        setMode('join');
                      }}
                      className="w-full flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-emerald-50 transition-colors group"
                    >
                      <div className="flex items-center space-x-3 text-left">
                        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-slate-400 group-hover:text-emerald-600 shadow-sm font-bold">
                          {group.name.charAt(0)}
                        </div>
                        <span className="font-bold text-slate-700">{group.name}</span>
                      </div>
                      <svg className="w-4 h-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        const removeAction = () => {
                          const updated = recentGroups.filter(g => g.id !== group.id);
                          setRecentGroups(updated);
                          localStorage.setItem('papum_recent_groups', JSON.stringify(updated));
                        };

                        if (triggerConfirm) {
                          triggerConfirm({
                            title: 'Remover Grupo?',
                            message: `Deseja remover "${group.name}" da sua lista de grupos recentes?`,
                            onConfirm: () => {
                              removeAction();
                              // Close this custom modal after action
                              // (App.tsx handles closing via state update in triggerConfirm wrapper if we wanted, 
                              // but here we just need to ensure the action runs)
                            }
                          });
                        } else if (confirm(`Remover "${group.name}" da lista?`)) {
                          removeAction();
                        }
                      }}
                      className="absolute -right-2 -top-2 p-1.5 bg-white border border-slate-100 text-slate-300 hover:text-rose-500 rounded-lg shadow-sm opacity-0 group-hover/item:opacity-100 transition-opacity"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-6 flex items-center justify-center space-x-4">
            <button 
              onClick={handleWhatsAppShare}
              className="p-3 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-colors"
              title="Compartilhar no WhatsApp"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.031 6.172c-2.32 0-4.518.903-6.155 2.54a8.677 8.677 0 0 0-2.54 6.155c0 1.94.618 3.824 1.777 5.378l-1.89 6.94 7.07-1.854a8.64 8.64 0 0 0 4.14 1.054c2.321 0 4.519-.903 6.156-2.54a8.683 8.683 0 0 0 2.54-6.156 8.64 8.64 0 0 0-11.098-11.53zm5.738 12.311a6.666 6.666 0 0 1-4.735 1.956c-1.32 0-2.614-.354-3.743-1.026l-.268-.158-4.2 1.1 1.118-4.102-.172-.275a6.685 6.685 0 0 1-1.066-3.61c0-1.782.695-3.457 1.956-4.717a6.68 6.68 0 0 1 4.717-1.956c1.782 0 3.457.695 4.717 1.956a6.69 6.69 0 0 1 1.957 4.717 6.66 6.66 0 0 1-1.931 4.717v-.004zm-3.078-4.18c-.167-.083-.984-.486-1.137-.541-.153-.056-.264-.083-.375.083-.111.167-.43.541-.528.653-.097.111-.194.125-.361.042-.167-.083-.704-.26-1.341-.827-.496-.443-.83-.99-.927-1.157-.097-.167-.01-.257.073-.34.076-.075.167-.194.25-.291.083-.097.111-.167.167-.278.056-.111.028-.208-.014-.291-.042-.083-.375-.903-.514-1.237-.135-.327-.272-.282-.375-.287l-.319-.004c-.111 0-.292.042-.444.208-.153.167-.583.569-.583 1.389 0 .819.597 1.611.68 1.722.083.111 1.17 1.787 2.834 2.503.396.17.705.271.946.348.398.127.76.108 1.047.065.32-.047.984-.403 1.123-.792.14-.389.14-.722.097-.792-.042-.07-.153-.111-.32-.194z"/>
              </svg>
            </button>
            <button 
              onClick={handleShare}
              className="p-3 bg-slate-50 text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
              title="Copiar link do App"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-emerald-50">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 space-y-6">
        <button onClick={() => setMode('initial')} className="text-slate-400 hover:text-slate-600 flex items-center text-sm font-bold">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Voltar
        </button>

        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
            {mode === 'create' ? 'Configurar Grupo' : 'Entrar no Grupo'}
          </h1>
          <p className="text-slate-500 mt-2">
            {mode === 'create' ? 'Defina como vocês dividirão as contas.' : 'Peça o ID do grupo para seu parceiro(a).'}
          </p>
        </div>

        {error && <div className="p-3 bg-rose-50 text-rose-600 rounded-xl text-sm font-medium border border-rose-100">{error}</div>}
        
        <form onSubmit={mode === 'create' ? handleCreateHouse : handleJoinHouse} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Seu Nome</label>
            <input
              required
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 transition"
              placeholder="Ex: João"
            />
          </div>

          {mode === 'join' && (
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">ID da Casa</label>
              <input
                required
                type="text"
                value={joinId}
                onChange={(e) => setJoinId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 transition"
                placeholder="Cole o código aqui"
              />
            </div>
          )}

          {mode === 'create' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Chave Pix</label>
                  <input
                    required
                    type="text"
                    value={pix}
                    onChange={(e) => setPix(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 transition"
                    placeholder="CPF/Celular"
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
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 transition"
                  />
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Sua Porcentagem (%)</label>
                <div className="flex items-center space-x-4">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={sharePercentage}
                    onChange={(e) => setSharePercentage(e.target.value)}
                    className="flex-1 h-2 bg-emerald-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                  />
                  <span className="font-bold text-slate-700 min-w-[3rem] text-right">{sharePercentage}%</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-2 font-medium">
                  Seu parceiro(a) ficará com os outros {100 - parseInt(sharePercentage)}%.
                </p>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Seu WhatsApp</label>
                <input
                  required
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 transition"
                  placeholder="(00) 00000-0000"
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl shadow-xl transition-all transform active:scale-95 disabled:opacity-50"
          >
            {loading ? 'Carregando...' : (mode === 'create' ? 'Configurar Grupo' : 'Entrar Agora')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Registration;
