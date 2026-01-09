
import React, { useState } from 'react';
import { User } from '../types';
import { supabase } from '../services/supabaseClient';

interface RegistrationProps {
  onRegister: (user: User) => void;
  triggerConfirm?: (config: { title: string, message: string, onConfirm: () => void, type?: 'danger' | 'info' }) => void;
  initialProfile?: { name: string, pix: string, phone: string };
  onLogout?: () => void;
}

const Registration: React.FC<RegistrationProps> = ({ onRegister, triggerConfirm, initialProfile, onLogout }) => {
  const [mode, setMode] = useState<'initial' | 'create'>('initial');
  const [name, setName] = useState(initialProfile?.name || '');
  const [pix, setPix] = useState(initialProfile?.pix || '');
  const [phone, setPhone] = useState(initialProfile?.phone || '');
  const [roommates, setRoommates] = useState('2');
  const [sharePercentage, setSharePercentage] = useState('50');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [inviteHouseId, setInviteHouseId] = useState<string | null>(null);
  const [inviteHouseName, setInviteHouseName] = useState<string>('');
  const [inviteLoading, setInviteLoading] = useState(false);

  /* Load recent groups */
  const [recentGroups, setRecentGroups] = useState<any[]>([]);
  React.useEffect(() => {
    const loadGroups = () => {
      const groups = JSON.parse(localStorage.getItem('papum_recent_groups') || '[]');
      setRecentGroups(groups);
    };
    loadGroups();
    window.addEventListener('papum-groups-updated', loadGroups);
    return () => window.removeEventListener('papum-groups-updated', loadGroups);
  }, [initialProfile]);

  React.useEffect(() => {
    if (initialProfile?.name) setName(initialProfile.name);
    if (initialProfile?.pix) setPix(initialProfile.pix);
    if (initialProfile?.phone) setPhone(initialProfile.phone);
  }, [initialProfile]);

  // Load Profile from localStorage on mount
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlHouseId = params.get('houseId');
    if (urlHouseId) {
      setInviteHouseId(urlHouseId);
    }

  // Load Profile from localStorage on mount
  React.useEffect(() => {
    // PWA Install Prompt
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as any);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as any);
  }, []);

  React.useEffect(() => {
    const fetchInviteGroup = async () => {
      if (!inviteHouseId) return;
      setInviteLoading(true);
      setError('');
      try {
        const { data, error: fetchError } = await supabase
          .from('house_config')
          .select('name')
          .eq('id', inviteHouseId)
          .single();

        if (fetchError || !data) throw new Error('Convite de grupo inválido.');
        setInviteHouseName(data.name);
      } catch (err: any) {
        setInviteHouseName('');
        setError(err.message || 'Não foi possível carregar o convite.');
      } finally {
        setInviteLoading(false);
      }
    };

    fetchInviteGroup();
  }, [inviteHouseId]);

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
        houseName: data.name,
        sharePercentage: parseFloat(sharePercentage) || 50
      });
    } catch (err: any) {
      setError(err.message || 'Erro ao criar grupo');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinInvite = async () => {
    if (!inviteHouseId) return;
    const resolvedName = initialProfile?.name || name;
    if (!resolvedName) {
      setError('Informe seu nome para entrar no grupo.');
      return;
    }
    setInviteLoading(true);
    setError('');

    try {
      const { data, error: fetchError } = await supabase
        .from('house_config')
        .select('*')
        .eq('id', inviteHouseId)
        .single();

      if (fetchError || !data) throw new Error('Convite de grupo inválido.');

      const joiningPercentage = 100 - (data.share_percentage || 50);

      saveProfile({ name: resolvedName, pix: data.pix, phone: data.phone });

      onRegister({
        name: resolvedName,
        pix: data.pix,
        phone: data.phone,
        roommates: data.roommates,
        houseId: data.id,
        houseName: data.name,
        sharePercentage: joiningPercentage
      });
    } catch (err: any) {
      setError(err.message || 'Falha ao entrar no grupo.');
    } finally {
      setInviteLoading(false);
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
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-32 h-32 bg-emerald-100 rounded-full opacity-20"></div>

          {onLogout && (
            <button 
              onClick={onLogout}
              className="absolute top-6 left-6 flex items-center space-x-1.5 p-2 text-slate-400 hover:text-rose-500 transition-colors group"
              title="Sair da conta"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="text-xs font-bold uppercase tracking-wider hidden group-hover:inline">Sair</span>
            </button>
          )}
          
          <div className="relative">
            <h1 className="text-5xl font-black text-emerald-600 tracking-tighter mb-2">PaPum</h1>
            <p className="text-slate-400 font-bold text-sm">Divisão de contas justa e simplificada.</p>
            {initialProfile?.name && (
              <p className="text-emerald-600/60 font-medium text-xs mt-3 bg-emerald-50 py-1 px-3 rounded-full inline-block">
                Logado como: <b>{initialProfile.name}</b>
              </p>
            )}
          </div>
          
          <div className="space-y-3 pt-4">
            <button 
              onClick={() => setMode('create')}
              className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all hover:-translate-y-1 active:scale-95"
            >
              Novo Grupo
            </button>
          </div>

          {error && (
            <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl text-sm font-bold border border-rose-100 animate-fadeIn text-center">
              {error}
            </div>
          )}

          {inviteHouseId && (
            <div className="bg-emerald-50/60 border border-emerald-100 rounded-2xl p-4 space-y-3 text-left">
              <p className="text-xs font-black text-emerald-600 uppercase tracking-widest">Convite para grupo</p>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-slate-700">
                    {inviteLoading ? 'Carregando grupo...' : (inviteHouseName || 'Grupo')}
                  </p>
                  <p className="text-[11px] text-slate-400 font-medium">Entre para acompanhar as despesas.</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (initialProfile?.name) {
                      handleJoinInvite();
                    } else {
                      setMode('create');
                    }
                  }}
                  disabled={inviteLoading}
                  className="bg-emerald-600 text-white font-bold px-4 py-2 rounded-xl text-xs hover:bg-emerald-700 transition-all disabled:opacity-50"
                >
                  {initialProfile?.name ? 'Entrar' : 'Completar perfil'}
                </button>
              </div>
            </div>
          )}

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
                      onClick={async () => {
                        // Attempt to use passed profile or fallback to local storage one
                        const userProfile = initialProfile?.name ? initialProfile : JSON.parse(localStorage.getItem('house_user') || '{}');
                        
                        if (userProfile?.name) {
                          // Auto Join if logged in
                          setLoading(true);
                          try {
                            const { data, error: fetchError } = await supabase
                              .from('house_config')
                              .select('*')
                              .eq('id', group.id)
                              .single();
                            
                            if (fetchError || !data) {
                               console.error('Fetch error:', fetchError); 
                               throw new Error('Grupo não encontrado ou sem permissão.');
                            }
                            
                            const joiningPercentage = 100 - (data.share_percentage || 50);
                            onRegister({ 
                              name: userProfile.name, 
                              pix: data.pix, 
                              phone: data.phone, 
                              roommates: data.roommates,
                              houseId: data.id,
                              houseName: data.name,
                              sharePercentage: joiningPercentage
                            });
                          } catch (err: any) {
                            console.error('Auto-join failed:', err);
                            setError(err.message || 'Falha ao entrar automaticamente.');
                          } finally {
                            setLoading(false);
                          }
                        } else {
                          setError('Seu perfil não foi carregado. Faça login novamente.');
                        }
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
                        if (triggerConfirm) {
                          triggerConfirm({
                            title: 'Remover Grupo?',
                            message: `Deseja remover "${group.name}" da lista?`,
                            onConfirm: () => {
                              const updated = recentGroups.filter(g => g.id !== group.id);
                              setRecentGroups(updated);
                              localStorage.setItem('papum_recent_groups', JSON.stringify(updated));
                            }
                          });
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

          <div className="pt-4 flex items-center justify-center space-x-4">
            <button 
              onClick={handleWhatsAppShare}
              className="p-3 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-colors"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.031 6.172c-2.32 0-4.518.903-6.155 2.54a8.677 8.677 0 0 0-2.54 6.155c0 1.94.618 3.824 1.777 5.378l-1.89 6.94 7.07-1.854a8.64 8.64 0 0 0 4.14 1.054c2.321 0 4.519-.903 6.156-2.54a8.683 8.683 0 0 0 2.54-6.156 8.64 8.64 0 0 0-11.098-11.53zm5.738 12.311a6.666 6.666 0 0 1-4.735 1.956c-1.32 0-2.614-.354-3.743-1.026l-.268-.158-4.2 1.1 1.118-4.102-.172-.275a6.685 6.685 0 0 1-1.066-3.61c0-1.782.695-3.457 1.956-4.717a6.68 6.68 0 0 1 4.717-1.956c1.782 0 3.457.695 4.717 1.956a6.69 6.69 0 0 1 1.957 4.717 6.66 6.66 0 0 1-1.931 4.717v-.004zm-3.078-4.18c-.167-.083-.984-.486-1.137-.541-.153-.056-.264-.083-.375.083-.111.167-.43.541-.528.653-.097.111-.194.125-.361.042-.167-.083-.704-.26-1.341-.827-.496-.443-.83-.99-.927-1.157-.097-.167-.01-.257.073-.34.076-.075.167-.194.25-.291.083-.097.111-.167.167-.278.056-.111.028-.208-.014-.291-.042-.083-.375-.903-.514-1.237-.135-.327-.272-.282-.375-.287l-.319-.004c-.111 0-.292.042-.444.208-.153.167-.583.569-.583 1.389 0 .819.597 1.611.68 1.722.083.111 1.17 1.787 2.834 2.503.396.17.705.271.946.348.398.127.76.108 1.047.065.32-.047.984-.403 1.123-.792.14-.389.14-.722.097-.792-.042-.07-.153-.111-.32-.194z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-emerald-50">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl p-8 space-y-6">
        <button onClick={() => setMode('initial')} className="text-slate-400 hover:text-slate-600 flex items-center text-sm font-bold">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Voltar
        </button>

        <div className="text-center">
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">
            Configurar Grupo
          </h1>
          <p className="text-slate-500 mt-2 font-medium">
            Defina como vocês dividirão as contas.
          </p>
        </div>

        {error && <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl text-sm font-bold border border-rose-100 animate-fadeIn text-center">{error}</div>}

        {inviteHouseId && (
          <div className="bg-emerald-50/60 border border-emerald-100 rounded-2xl p-4 space-y-3 text-left">
            <p className="text-xs font-black text-emerald-600 uppercase tracking-widest">Convite para grupo</p>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-slate-700">
                  {inviteLoading ? 'Carregando grupo...' : (inviteHouseName || 'Grupo')}
                </p>
                <p className="text-[11px] text-slate-400 font-medium">Entre sem precisar digitar o ID.</p>
              </div>
              <button
                type="button"
                onClick={handleJoinInvite}
                disabled={inviteLoading}
                className="bg-emerald-600 text-white font-bold px-4 py-2 rounded-xl text-xs hover:bg-emerald-700 transition-all disabled:opacity-50"
              >
                Entrar
              </button>
            </div>
          </div>
        )}
        
        <form onSubmit={handleCreateHouse} className="space-y-4">
          {!initialProfile?.name ? (
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Seu Nome</label>
              <input
                required
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-medium"
                placeholder="Ex: João"
              />
            </div>
          ) : (
            <div className="bg-emerald-50 text-emerald-700 font-bold text-sm rounded-2xl px-5 py-4 text-center">
              Entrando como <span className="font-black">{initialProfile.name}</span>
            </div>
          )}

          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Chave Pix</label>
                <input
                  required
                  type="text"
                  value={pix}
                  onChange={(e) => setPix(e.target.value)}
                  className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-medium text-sm"
                  placeholder="Celular/CPF"
                />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Moradores</label>
                <input
                  required
                  type="number"
                  min="1"
                  value={roommates}
                  onChange={(e) => setRoommates(e.target.value)}
                  className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-medium"
                />
              </div>
            </div>

            <div className="bg-slate-50 p-5 rounded-[2rem] border border-slate-100">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Sua Porcentagem (%)</label>
              <div className="flex items-center space-x-4">
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={sharePercentage}
                  onChange={(e) => setSharePercentage(e.target.value)}
                  className="flex-1 h-2 bg-emerald-100 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
                <span className="font-bold text-emerald-700 min-w-[3rem] text-right">{sharePercentage}%</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-2 font-bold italic">
                O(a) participante ficará com os outros {100 - parseInt(sharePercentage)}%.
              </p>
            </div>
            
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Seu WhatsApp</label>
              <input
                required
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-medium"
                placeholder="(00) 00000-0000"
              />
            </div>
          </>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 text-white font-black py-5 rounded-[1.5rem] shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all hover:-translate-y-1 active:scale-95 disabled:opacity-50"
          >
            {loading ? 'Carregando...' : 'Configurar Grupo'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Registration;
