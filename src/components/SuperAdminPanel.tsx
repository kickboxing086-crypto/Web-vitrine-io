import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus,
  Trash2,
  Store,
  LogOut,
  CheckCircle2,
  TrendingUp,
  DollarSign,
  Calendar,
  AlertTriangle,
  Clock,
  Search,
  Eye,
  EyeOff,
  Copy,
  Check,
  MessageCircle,
  RefreshCw,
  Edit3,
  Crown,
  Lock,
  User,
  X,
  ChevronRight,
  Zap,
  ShieldAlert,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { StoreClient } from '../types';
import { getClients, saveClient, deleteClient } from '../lib/firestoreService';

interface SuperAdminPanelProps {
  onLogout: () => void;
}

export function SuperAdminPanel({ onLogout }: SuperAdminPanelProps) {
  const [clients, setClients] = useState<StoreClient[]>([]);
  const [isAddingOrEditing, setIsAddingOrEditing] = useState(false);
  const [editingClient, setEditingClient] = useState<Partial<StoreClient> | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'expiring_soon' | 'overdue' | 'inactive'>('all');
  const [visiblePasswords, setVisiblePasswords] = useState<{ [clientId: string]: boolean }>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [renewingId, setRenewingId] = useState<string | null>(null);

  // 2-Step Luxury Deletion Modal State
  const [deleteTargetClient, setDeleteTargetClient] = useState<StoreClient | null>(null);
  const [deleteStep, setDeleteStep] = useState<1 | 2>(1);
  const [deleteConfirmationInput, setDeleteConfirmationInput] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [feedbackToast, setFeedbackToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Form State for Adding / Editing
  const [formData, setFormData] = useState<{
    id?: string;
    storeName: string;
    username: string;
    password: string;
    planPrice: number | string;
    dueDate: string;
    storeType: 'clothing' | 'natural';
    phoneWhatsapp: string;
    notes: string;
    status: 'active' | 'inactive';
  }>({
    storeName: '',
    username: '',
    password: '',
    planPrice: 89.90,
    dueDate: getDefaultDueDate(30),
    storeType: 'clothing',
    phoneWhatsapp: '',
    notes: '',
    status: 'active',
  });

  useEffect(() => {
    const unsubscribe = getClients((data) => {
      setClients(Array.isArray(data) ? data : []);
    });
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  function showToast(message: string, type: 'success' | 'info' | 'error' = 'success') {
    setFeedbackToast({ message, type });
    setTimeout(() => setFeedbackToast(null), 3000);
  }

  function getDefaultDueDate(daysAhead: number = 30): string {
    const d = new Date();
    d.setDate(d.getDate() + daysAhead);
    return d.toISOString().split('T')[0];
  }

  // Calculate days remaining or days overdue
  const getDueStatus = (dueDateStr?: string) => {
    if (!dueDateStr) return { days: 999, status: 'ok', label: 'Sem vencimento', color: 'text-slate-400 bg-slate-800/60 border-slate-700' };
    
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const due = new Date(dueDateStr + 'T00:00:00');
      if (isNaN(due.getTime())) {
        return { days: 999, status: 'ok', label: 'Sem vencimento', color: 'text-slate-400 bg-slate-800/60 border-slate-700' };
      }

      const diffTime = due.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays < 0) {
        return {
          days: diffDays,
          status: 'overdue',
          label: `Vencida há ${Math.abs(diffDays)} ${Math.abs(diffDays) === 1 ? 'dia' : 'dias'}`,
          color: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
          badge: 'Falta Renovar',
        };
      } else if (diffDays <= 5) {
        return {
          days: diffDays,
          status: 'expiring_soon',
          label: diffDays === 0 ? 'Vence Hoje!' : `Vence em ${diffDays} ${diffDays === 1 ? 'dia' : 'dias'}`,
          color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
          badge: 'Vence em Breve',
        };
      } else {
        return {
          days: diffDays,
          status: 'ok',
          label: `Em dia (${diffDays} dias)`,
          color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
          badge: 'Ativa & Em Dia',
        };
      }
    } catch {
      return { days: 999, status: 'ok', label: 'Sem vencimento', color: 'text-slate-400 bg-slate-800/60 border-slate-700' };
    }
  };

  // Financial Metrics Calculation
  const metrics = useMemo(() => {
    const totalClients = clients.length;
    let mrr = 0;
    let activeInGoodStanding = 0;
    let expiringSoonCount = 0;
    let overdueCount = 0;
    let overdueValue = 0;
    let expiringSoonValue = 0;

    clients.forEach((c) => {
      const price = Number(c.planPrice) || 0;
      if (c.status !== 'inactive') {
        mrr += price;
      }

      const dueInfo = getDueStatus(c.dueDate);
      if (dueInfo.status === 'overdue') {
        overdueCount++;
        overdueValue += price;
      } else if (dueInfo.status === 'expiring_soon') {
        expiringSoonCount++;
        expiringSoonValue += price;
      } else {
        activeInGoodStanding++;
      }
    });

    const annualProjected = mrr * 12;
    const paymentHealth = totalClients > 0 ? Math.round(((totalClients - overdueCount) / totalClients) * 100) : 100;

    return {
      totalClients,
      mrr,
      annualProjected,
      activeInGoodStanding,
      expiringSoonCount,
      expiringSoonValue,
      overdueCount,
      overdueValue,
      paymentHealth,
    };
  }, [clients]);

  // Filtered Clients
  const filteredClients = useMemo(() => {
    return clients.filter((client) => {
      const storeNameStr = client.storeName || '';
      const usernameStr = client.username || '';
      const phoneStr = client.phoneWhatsapp || '';

      const matchesSearch =
        storeNameStr.toLowerCase().includes(searchQuery.toLowerCase()) ||
        usernameStr.toLowerCase().includes(searchQuery.toLowerCase()) ||
        phoneStr.includes(searchQuery);

      if (!matchesSearch) return false;

      const dueInfo = getDueStatus(client.dueDate);

      if (statusFilter === 'all') return true;
      if (statusFilter === 'active') return client.status === 'active' && dueInfo.status === 'ok';
      if (statusFilter === 'expiring_soon') return dueInfo.status === 'expiring_soon';
      if (statusFilter === 'overdue') return dueInfo.status === 'overdue';
      if (statusFilter === 'inactive') return client.status === 'inactive';

      return true;
    });
  }, [clients, searchQuery, statusFilter]);

  // Actions
  const handleOpenAddModal = () => {
    setEditingClient(null);
    setFormData({
      storeName: '',
      username: '',
      password: generateRandomPassword(),
      planPrice: 89.90,
      dueDate: getDefaultDueDate(30),
      storeType: 'clothing',
      phoneWhatsapp: '',
      notes: '',
      status: 'active',
    });
    setIsAddingOrEditing(true);
  };

  const handleOpenEditModal = (client: StoreClient) => {
    setEditingClient(client);
    setFormData({
      id: client.id,
      storeName: client.storeName || '',
      username: client.username || '',
      password: client.password || '',
      planPrice: client.planPrice !== undefined ? client.planPrice : 89.90,
      dueDate: client.dueDate || getDefaultDueDate(30),
      storeType: client.storeType || 'clothing',
      phoneWhatsapp: client.phoneWhatsapp || '',
      notes: client.notes || '',
      status: client.status || 'active',
    });
    setIsAddingOrEditing(true);
  };

  const handleSaveClientForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.storeName || !formData.username || !formData.password) return;

    const cleanUsername = formData.username.trim().toLowerCase().replace(/\s+/g, '');
    const priceNum = typeof formData.planPrice === 'string' ? parseFloat(formData.planPrice.replace(',', '.')) : Number(formData.planPrice);

    const clientToSave: StoreClient = {
      id: formData.id || `client-${Date.now()}`,
      storeName: formData.storeName.trim(),
      username: cleanUsername,
      password: formData.password.trim(),
      planPrice: isNaN(priceNum) ? 89.90 : priceNum,
      dueDate: formData.dueDate || getDefaultDueDate(30),
      storeType: formData.storeType,
      phoneWhatsapp: formData.phoneWhatsapp.trim(),
      notes: formData.notes.trim(),
      status: formData.status,
      createdAt: editingClient?.createdAt || new Date().toISOString(),
      lastRenewedAt: editingClient?.lastRenewedAt || new Date().toISOString(),
    };

    try {
      await saveClient(clientToSave);
      showToast(editingClient ? 'Loja atualizada com sucesso!' : 'Nova loja criada com sucesso!', 'success');
      setIsAddingOrEditing(false);
      setEditingClient(null);
    } catch (err) {
      console.error('Error saving client:', err);
      showToast('Erro ao salvar loja. Tente novamente.', 'error');
    }
  };

  const handleQuickRenew = async (client: StoreClient) => {
    setRenewingId(client.id);
    try {
      const currentDue = client.dueDate ? new Date(client.dueDate + 'T00:00:00') : new Date();
      const today = new Date();
      
      const baseDate = isNaN(currentDue.getTime()) || currentDue < today ? today : currentDue;
      const nextDue = new Date(baseDate);
      nextDue.setDate(nextDue.getDate() + 30);
      const nextDueDateStr = nextDue.toISOString().split('T')[0];

      const updated: StoreClient = {
        ...client,
        dueDate: nextDueDateStr,
        status: 'active',
        lastRenewedAt: new Date().toISOString(),
      };

      await saveClient(updated);
      showToast(`Plano de "${client.storeName}" renovado por +30 dias!`, 'success');
    } catch (err) {
      console.error('Error renewing client:', err);
      showToast('Erro ao renovar plano.', 'error');
    } finally {
      setTimeout(() => setRenewingId(null), 400);
    }
  };

  // Luxury 2-Step Deletion Flow
  const handleOpenDeleteModal = (client: StoreClient) => {
    setDeleteTargetClient(client);
    setDeleteStep(1);
    setDeleteConfirmationInput('');
    setIsDeleting(false);
  };

  const handleConfirmStep1 = () => {
    setDeleteStep(2);
    setDeleteConfirmationInput('');
  };

  const handleExecuteDeletion = async () => {
    if (!deleteTargetClient) return;
    setIsDeleting(true);

    try {
      await deleteClient(deleteTargetClient.id);
      showToast(`Login da loja "${deleteTargetClient.storeName}" foi excluído com sucesso.`, 'info');
      setDeleteTargetClient(null);
      setDeleteStep(1);
      setDeleteConfirmationInput('');
    } catch (err) {
      console.error('Error deleting store client:', err);
      showToast('Erro ao excluir loja do banco de dados.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const togglePasswordVisibility = (id: string) => {
    setVisiblePasswords((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast('Copiado para a área de transferência!', 'success');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopyFullAccessMessage = (client: StoreClient) => {
    const storeLink = `${window.location.origin}/?loja=${client.storeSlug || client.username}`;
    const msg = `👑 *ACESSO À SUA WEB VITRINE*\n\nOlá! Aqui estão as credenciais exclusivas da sua loja:\n\n🏬 *Loja:* ${client.storeName}\n👤 *Usuário:* ${client.username}\n🔑 *Senha:* ${client.password}\n\n🌐 *Link da sua Vitrine:* ${storeLink}\n📅 *Vencimento do Plano:* ${formatDateBr(client.dueDate)}\n💵 *Valor:* R$ ${(Number(client.planPrice) || 0).toFixed(2).replace('.', ',')}/mês\n\nQualquer dúvida, estamos à disposição na Gestão Web Vitrine! ✨`;
    
    copyToClipboard(msg, `msg-${client.id}`);
  };

  const handleSendWhatsappReminder = (client: StoreClient) => {
    const dueInfo = getDueStatus(client.dueDate);
    const priceFormatted = `R$ ${(Number(client.planPrice) || 0).toFixed(2).replace('.', ',')}`;
    
    let msg = '';
    if (dueInfo.status === 'overdue') {
      msg = `Olá! Notamos que a assinatura da sua Web Vitrine (*${client.storeName}*) venceu em *${formatDateBr(client.dueDate)}*. O valor da renovação é de *${priceFormatted}*. Gostaria de renovar agora para manter o catálogo 100% online?`;
    } else {
      msg = `Olá! Tudo bem? Lembramos que a renovação da sua Web Vitrine (*${client.storeName}*) vence em *${formatDateBr(client.dueDate)}* (Valor: *${priceFormatted}*). Estamos à disposição para qualquer suporte!`;
    }

    const cleanPhone = (client.phoneWhatsapp || '').replace(/\D/g, '');
    if (cleanPhone) {
      window.open(`https://wa.me/55${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank');
    } else {
      copyToClipboard(msg, `wa-${client.id}`);
      showToast('Mensagem copiada para envio manual no WhatsApp!', 'info');
    }
  };

  function generateRandomPassword(): string {
    return Math.floor(10000000 + Math.random() * 90000000).toString().substring(0, 8);
  }

  function formatDateBr(dateStr?: string): string {
    if (!dateStr) return 'N/A';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  }

  return (
    <div className="min-h-screen bg-[#0A0D14] text-slate-100 font-sans selection:bg-amber-500/30 selection:text-amber-200">
      {/* Toast Notification */}
      <AnimatePresence>
        {feedbackToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 right-6 z-50 flex items-center space-x-3 px-5 py-3 rounded-2xl bg-[#141B2D] border border-amber-500/40 shadow-2xl shadow-stone-950/80 backdrop-blur-md"
          >
            {feedbackToast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
            {feedbackToast.type === 'info' && <Sparkles className="w-5 h-5 text-amber-400" />}
            {feedbackToast.type === 'error' && <AlertTriangle className="w-5 h-5 text-rose-400" />}
            <span className="text-xs sm:text-sm font-semibold text-slate-100">{feedbackToast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Subtle Luxury Ambient Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] rounded-full bg-amber-500/5 blur-[120px]" />
        <div className="absolute top-[30%] right-[10%] w-[600px] h-[600px] rounded-full bg-indigo-500/5 blur-[140px]" />
      </div>

      {/* Top Navbar */}
      <header className="relative z-20 bg-[#0F1420]/90 backdrop-blur-md border-b border-amber-500/20 sticky top-0 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Brand Logo & Identification */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-600 to-amber-900 p-0.5 shadow-lg shadow-amber-950/40">
                  <div className="w-full h-full bg-[#0F1420] rounded-[14px] flex items-center justify-center">
                    <Crown className="w-6 h-6 text-amber-400" />
                  </div>
                </div>
                <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-[#0F1420]"></span>
                </span>
              </div>

              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="font-bold text-lg text-white tracking-wide flex items-center gap-1.5">
                    Webgestor Vitrine
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-500/15 text-amber-300 border border-amber-500/30">
                      Master SaaS
                    </span>
                  </h1>
                </div>
                <p className="text-xs text-slate-400 font-medium">
                  Gestão Financeira, Controle de Acessos & Logins
                </p>
              </div>
            </div>

            {/* Top Right Action & Logout */}
            <div className="flex items-center space-x-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleOpenAddModal}
                className="flex items-center space-x-2 px-4 sm:px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold rounded-xl text-xs sm:text-sm shadow-lg shadow-amber-900/30 transition-all cursor-pointer"
                id="btn-gestor-new-store"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Cadastrar Nova Loja</span>
                <span className="sm:hidden">Nova Loja</span>
              </motion.button>

              <button
                onClick={onLogout}
                className="flex items-center space-x-2 px-3.5 py-2.5 bg-[#171E2D] hover:bg-[#20293D] text-slate-300 hover:text-white rounded-xl text-xs font-semibold border border-slate-700/50 transition-colors cursor-pointer"
                id="btn-gestor-logout"
              >
                <LogOut className="w-4 h-4 text-slate-400" />
                <span className="hidden sm:inline">Desconectar</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Urgent Alerts (If any store is overdue or expiring soon) */}
        {(metrics.overdueCount > 0 || metrics.expiringSoonCount > 0) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-[#161C2A] to-rose-950/30 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl"
          >
            <div className="flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0 border border-amber-500/40">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-amber-200">
                  Atenção de Renovação Inteligente
                </h4>
                <p className="text-xs text-slate-300">
                  Você tem{' '}
                  {metrics.overdueCount > 0 && (
                    <span className="text-rose-400 font-bold">
                      {metrics.overdueCount} {metrics.overdueCount === 1 ? 'loja vencida' : 'lojas vencidas'} (R$ {metrics.overdueValue.toFixed(2).replace('.', ',')})
                    </span>
                  )}
                  {metrics.overdueCount > 0 && metrics.expiringSoonCount > 0 && ' e '}
                  {metrics.expiringSoonCount > 0 && (
                    <span className="text-amber-300 font-bold">
                      {metrics.expiringSoonCount} a vencer nos próximos 5 dias (R$ {metrics.expiringSoonValue.toFixed(2).replace('.', ',')})
                    </span>
                  )}.
                </p>
              </div>
            </div>

            <button
              onClick={() => setStatusFilter(metrics.overdueCount > 0 ? 'overdue' : 'expiring_soon')}
              className="px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer whitespace-nowrap"
            >
              <span>Ver Lojas Pendentes</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}

        {/* Financial KPI Dashboard Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Card 1: MRR Total */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="p-5 sm:p-6 rounded-3xl bg-[#121724] border border-amber-500/20 shadow-xl relative overflow-hidden group hover:border-amber-500/40 transition-all"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-bl-full pointer-events-none" />
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Faturamento Mensal (MRR)
              </span>
              <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              R$ {metrics.mrr.toFixed(2).replace('.', ',')}
              <span className="text-xs font-semibold text-slate-400">/mês</span>
            </div>
            <div className="mt-2 flex items-center text-xs text-amber-400/90 font-medium">
              <TrendingUp className="w-3.5 h-3.5 mr-1" />
              <span>Projeção anual: R$ {metrics.annualProjected.toFixed(2).replace('.', ',')}</span>
            </div>
          </motion.div>

          {/* Card 2: Lojas Ativas & Em Dia */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05 }}
            className="p-5 sm:p-6 rounded-3xl bg-[#121724] border border-emerald-500/20 shadow-xl relative overflow-hidden group hover:border-emerald-500/40 transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Lojas Em Dia
              </span>
              <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {metrics.activeInGoodStanding}{' '}
              <span className="text-xs font-semibold text-slate-400">de {metrics.totalClients} lojas</span>
            </div>
            <div className="mt-2 flex items-center text-xs text-emerald-400 font-medium">
              <Zap className="w-3.5 h-3.5 mr-1" />
              <span>{metrics.paymentHealth}% de adimplência na carteira</span>
            </div>
          </motion.div>

          {/* Card 3: A Vencer em Breve */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="p-5 sm:p-6 rounded-3xl bg-[#121724] border border-amber-500/20 shadow-xl relative overflow-hidden group hover:border-amber-500/40 transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                A Vencer (Próx. 5 Dias)
              </span>
              <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-300 tracking-tight">
              {metrics.expiringSoonCount}
              <span className="text-xs font-semibold text-slate-400 ml-1.5">
                (R$ {metrics.expiringSoonValue.toFixed(2).replace('.', ',')})
              </span>
            </div>
            <div className="mt-2 flex items-center text-xs text-slate-400">
              <Calendar className="w-3.5 h-3.5 mr-1 text-amber-400" />
              <span>Renovações da semana</span>
            </div>
          </motion.div>

          {/* Card 4: Faltam Renovar / Vencidas */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
            className="p-5 sm:p-6 rounded-3xl bg-[#121724] border border-rose-500/20 shadow-xl relative overflow-hidden group hover:border-rose-500/40 transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Faltam Renovar (Vencidas)
              </span>
              <div className="w-9 h-9 rounded-xl bg-rose-500/15 text-rose-400 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-rose-400 tracking-tight">
              {metrics.overdueCount}
              <span className="text-xs font-semibold text-slate-400 ml-1.5">
                (R$ {metrics.overdueValue.toFixed(2).replace('.', ',')})
              </span>
            </div>
            <div className="mt-2 flex items-center text-xs text-rose-300 font-medium">
              <span>{metrics.overdueCount > 0 ? 'Pendente de contato/cobrança' : 'Nenhuma loja em atraso'}</span>
            </div>
          </motion.div>
        </div>

        {/* Section Header & Filters Bar */}
        <div className="bg-[#121724] p-5 sm:p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <Store className="w-5 h-5 text-amber-400" />
                Carteira de Lojas, Acessos & Logins
              </h2>
              <p className="text-xs text-slate-400">
                Gerencie credenciais, valores de mensalidade, status e exclusão com segurança em 2 etapas.
              </p>
            </div>

            {/* Real-time Search Box */}
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por loja, usuário..."
                className="w-full pl-10 pr-4 py-2 bg-[#0B0F19] border border-slate-700/80 rounded-xl text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-amber-500 transition-colors"
                id="input-gestor-search"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Quick Status Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
            {[
              { id: 'all', label: `Todas (${clients.length})` },
              { id: 'active', label: `Em Dia (${metrics.activeInGoodStanding})`, icon: CheckCircle2, color: 'text-emerald-400' },
              { id: 'expiring_soon', label: `Vencem em Breve (${metrics.expiringSoonCount})`, icon: Clock, color: 'text-amber-400' },
              { id: 'overdue', label: `Faltam Renovar (${metrics.overdueCount})`, icon: AlertTriangle, color: 'text-rose-400' },
              { id: 'inactive', label: 'Suspensas / Inativas' },
            ].map((tab) => {
              const isSelected = statusFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id as any)}
                  className={`px-3.5 py-1.5 rounded-xl font-bold transition-all flex items-center space-x-1.5 flex-shrink-0 cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-950/40'
                      : 'bg-[#182030] text-slate-300 hover:bg-[#20293D] border border-slate-700/50'
                  }`}
                >
                  {tab.icon && <tab.icon className={`w-3.5 h-3.5 ${isSelected ? 'text-stone-950' : tab.color}`} />}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Clients Table / Cards List */}
        <div className="bg-[#121724] rounded-3xl border border-slate-800 shadow-2xl overflow-hidden">
          {filteredClients.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/20">
                <Store className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-white">Nenhuma loja encontrada</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Não localizamos nenhuma loja com os filtros aplicados. Cadastre uma nova loja ou altere os termos da busca.
              </p>
              <button
                onClick={handleOpenAddModal}
                className="mt-3 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl text-xs shadow-lg transition-all cursor-pointer"
              >
                Cadastrar Primeira Loja
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#0B0F19]/80 border-b border-slate-800 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                    <th className="px-6 py-4">Nome da Loja & Tipo</th>
                    <th className="px-6 py-4">Credenciais (Usuário / Senha)</th>
                    <th className="px-6 py-4">Valor do Plano</th>
                    <th className="px-6 py-4">Data de Vencimento</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Ações Inteligentes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 text-xs sm:text-sm">
                  {filteredClients.map((client) => {
                    const dueInfo = getDueStatus(client.dueDate);
                    const isPassVisible = !!visiblePasswords[client.id];
                    const priceFormatted = `R$ ${(Number(client.planPrice) || 0).toFixed(2).replace('.', ',')}`;

                    return (
                      <tr
                        key={client.id}
                        className={`hover:bg-[#182030]/60 transition-colors ${
                          dueInfo.status === 'overdue' ? 'bg-rose-950/10' : ''
                        }`}
                      >
                        {/* Store Info */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-bold text-white text-sm flex items-center gap-1.5">
                            {client.storeName}
                            {client.storeType === 'clothing' ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                👗 Roupas
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                🌿 Naturais
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                            <span>Link: <code className="text-amber-300/80">/?loja={client.storeSlug || client.username}</code></span>
                          </div>
                        </td>

                        {/* Login & Password (Credentials) */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-1.5 font-mono text-xs">
                              <span className="text-slate-400">Usuário:</span>
                              <span className="text-amber-300 font-bold bg-[#0B0F19] px-2 py-0.5 rounded border border-slate-700">
                                {client.username}
                              </span>
                            </div>
                            <div className="flex items-center space-x-1.5 font-mono text-xs">
                              <span className="text-slate-400">Senha:</span>
                              <span className="text-emerald-300 font-bold bg-[#0B0F19] px-2 py-0.5 rounded border border-slate-700">
                                {isPassVisible ? client.password : '••••••••'}
                              </span>
                              <button
                                type="button"
                                onClick={() => togglePasswordVisibility(client.id)}
                                className="p-1 text-slate-400 hover:text-white transition-colors"
                                title={isPassVisible ? 'Ocultar Senha' : 'Ver Senha'}
                              >
                                {isPassVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </div>
                        </td>

                        {/* Plan Price */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-extrabold text-white text-sm">
                            {priceFormatted}
                          </div>
                          <span className="text-[10px] text-slate-400 uppercase tracking-wider">mensal</span>
                        </td>

                        {/* Due Date & Remaining Days Badge */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-semibold text-slate-200 text-xs flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>{formatDateBr(client.dueDate)}</span>
                          </div>
                          <div className="mt-1">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${dueInfo.color}`}
                            >
                              {dueInfo.label}
                            </span>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          {client.status === 'inactive' ? (
                            <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700">
                              Suspensa
                            </span>
                          ) : dueInfo.status === 'overdue' ? (
                            <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse">
                              Pendente Renovação
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                              Ativa
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            {/* Quick 1-Click Renew (+30 days) */}
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleQuickRenew(client)}
                              disabled={renewingId === client.id}
                              className="px-2.5 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-bold transition-all flex items-center space-x-1 cursor-pointer"
                              title="Renovar Plano (+30 Dias)"
                            >
                              <RefreshCw className={`w-3.5 h-3.5 ${renewingId === client.id ? 'animate-spin' : ''}`} />
                              <span className="hidden sm:inline">Renovar (+30d)</span>
                            </motion.button>

                            {/* Copy Full Credentials Message */}
                            <button
                              onClick={() => handleCopyFullAccessMessage(client)}
                              className="p-2 bg-[#182030] hover:bg-[#20293D] text-slate-300 hover:text-amber-300 rounded-xl border border-slate-700 transition-colors cursor-pointer"
                              title="Copiar Convite / Acesso Completo"
                            >
                              {copiedId === `msg-${client.id}` ? (
                                <Check className="w-4 h-4 text-emerald-400" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </button>

                            {/* Send Whatsapp Reminder / Acesso */}
                            <button
                              onClick={() => handleSendWhatsappReminder(client)}
                              className="p-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30 transition-colors cursor-pointer"
                              title="Enviar Acesso ou Lembrete pelo WhatsApp"
                            >
                              <MessageCircle className="w-4 h-4" />
                            </button>

                            {/* Edit Client */}
                            <button
                              onClick={() => handleOpenEditModal(client)}
                              className="p-2 bg-[#182030] hover:bg-[#20293D] text-slate-300 hover:text-white rounded-xl border border-slate-700 transition-colors cursor-pointer"
                              title="Editar Loja e Valores"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>

                            {/* Luxury 2-Step Delete Button */}
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleOpenDeleteModal(client)}
                              className="p-2 bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 hover:text-rose-300 rounded-xl border border-rose-500/30 hover:border-rose-500/50 transition-all cursor-pointer"
                              title="Excluir Login (Confirmação em 2 Etapas)"
                              id={`btn-delete-login-${client.id}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </motion.button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Modal: Create or Edit Client (Smart Financial SaaS) */}
      <AnimatePresence>
        {isAddingOrEditing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-2xl bg-[#121724] border border-amber-500/30 rounded-3xl shadow-2xl overflow-hidden my-8"
              id="modal-gestor-client-form"
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-[#171E2E] to-[#121724] p-6 border-b border-slate-800 relative">
                <button
                  onClick={() => setIsAddingOrEditing(false)}
                  className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/50 hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                    <Store className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      {editingClient ? 'Editar Loja & Plano Financeiro' : 'Cadastrar Nova Loja na Gestão'}
                    </h3>
                    <p className="text-xs text-slate-400">
                      Preencha os dados de acesso e o valor acordado da assinatura.
                    </p>
                  </div>
                </div>
              </div>

              {/* Modal Form Body */}
              <form onSubmit={handleSaveClientForm} className="p-6 sm:p-8 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Nome da Loja */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      Nome da Loja *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.storeName}
                      onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                      placeholder="Ex: Boutique Elegance, Empório Natural..."
                      className="w-full px-4 py-2.5 bg-[#0B0F19] border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500 transition-colors"
                      id="input-form-storename"
                    />
                  </div>

                  {/* Nome de Usuário */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      Nome de Usuário (Login) *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        required
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/[^a-z0-9_.-]/g, '') })}
                        placeholder="Ex: boutique_elegance"
                        className="w-full pl-10 pr-4 py-2.5 bg-[#0B0F19] border border-slate-700 rounded-xl text-sm text-white font-mono focus:outline-none focus:border-amber-500 transition-colors"
                        id="input-form-username"
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">Será usado no link da loja: <code>/?loja={formData.username || 'nome'}</code></p>
                  </div>

                  {/* Senha */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                        Senha de Acesso (Máx 8 dígitos) *
                      </label>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, password: generateRandomPassword() })}
                        className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold cursor-pointer"
                      >
                        Gerar Senha
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        required
                        maxLength={8}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="Ex: 12345678"
                        className="w-full pl-10 pr-4 py-2.5 bg-[#0B0F19] border border-slate-700 rounded-xl text-sm text-white font-mono focus:outline-none focus:border-amber-500 transition-colors"
                        id="input-form-password"
                      />
                    </div>
                  </div>

                  {/* Valor do Plano (Editável pelo Gestor) */}
                  <div>
                    <label className="block text-xs font-bold text-amber-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5 text-amber-400" />
                      Valor do Plano Mensal (R$) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      value={formData.planPrice}
                      onChange={(e) => setFormData({ ...formData, planPrice: e.target.value })}
                      placeholder="Ex: 89.90"
                      className="w-full px-4 py-2.5 bg-[#0B0F19] border border-amber-500/40 rounded-xl text-sm font-bold text-amber-300 focus:outline-none focus:border-amber-400 transition-colors"
                      id="input-form-planprice"
                    />
                    <p className="text-[11px] text-slate-500 mt-1">Editável livremente por você para cada cliente.</p>
                  </div>

                  {/* Data de Vencimento */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-amber-400" />
                        Data de Vencimento *
                      </label>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, dueDate: getDefaultDueDate(30) })}
                        className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold cursor-pointer"
                      >
                        +30 Dias
                      </button>
                    </div>
                    <input
                      type="date"
                      required
                      value={formData.dueDate}
                      onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                      className="w-full px-4 py-2.5 bg-[#0B0F19] border border-amber-500/40 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400 transition-colors"
                      id="input-form-duedate"
                    />
                  </div>

                  {/* Tipo de Vitrine */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      Segmento / Modelo da Vitrine
                    </label>
                    <select
                      value={formData.storeType}
                      onChange={(e) => setFormData({ ...formData, storeType: e.target.value as any })}
                      className="w-full px-4 py-2.5 bg-[#0B0F19] border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500 transition-colors"
                      id="select-form-storetype"
                    >
                      <option value="clothing">👗 Vitrine de Moda & Roupas</option>
                      <option value="natural">🌿 Loja Verde - Produtos Naturais</option>
                    </select>
                  </div>

                  {/* WhatsApp do Cliente */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      WhatsApp do Cliente (Opcional)
                    </label>
                    <input
                      type="text"
                      value={formData.phoneWhatsapp}
                      onChange={(e) => setFormData({ ...formData, phoneWhatsapp: e.target.value })}
                      placeholder="Ex: 11999998888 (com DDD)"
                      className="w-full px-4 py-2.5 bg-[#0B0F19] border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500 transition-colors"
                      id="input-form-phone"
                    />
                  </div>

                  {/* Status da Loja */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      Status da Conta
                    </label>
                    <div className="flex items-center space-x-3">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, status: 'active' })}
                        className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                          formData.status === 'active'
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                            : 'bg-[#0B0F19] border-slate-700 text-slate-400'
                        }`}
                      >
                        Ativa (Liberada)
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, status: 'inactive' })}
                        className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                          formData.status === 'inactive'
                            ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                            : 'bg-[#0B0F19] border-slate-700 text-slate-400'
                        }`}
                      >
                        Suspensa / Inativa
                      </button>
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="flex items-center justify-end space-x-3 pt-6 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsAddingOrEditing(false)}
                    className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 rounded-xl text-xs sm:text-sm font-bold shadow-lg shadow-amber-950/40 flex items-center space-x-2 transition-all cursor-pointer"
                    id="btn-form-save-client"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{editingClient ? 'Salvar Alterações' : 'Criar Acesso & Sincronizar'}</span>
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* LUXURY 2-STEP LOGIN DELETION MODAL (Removes generic alert/confirm) */}
      <AnimatePresence>
        {deleteTargetClient && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#05070B]/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-lg bg-gradient-to-b from-[#161B29] to-[#0E121E] border border-rose-500/30 rounded-3xl shadow-2xl shadow-rose-950/50 overflow-hidden"
              id="modal-luxury-delete-login"
            >
              {/* Glowing Top Accent Bar */}
              <div className="h-1.5 w-full bg-gradient-to-r from-rose-600 via-amber-500 to-rose-600" />

              {/* Close Button */}
              <button
                onClick={() => setDeleteTargetClient(null)}
                disabled={isDeleting}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/40 hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="p-6 sm:p-8 space-y-6">
                {/* Header with Luxury Animated Shield */}
                <div className="flex items-start space-x-4">
                  <div className="relative flex-shrink-0">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500/20 to-amber-500/10 border border-rose-500/40 flex items-center justify-center shadow-lg shadow-rose-950/50">
                      <ShieldAlert className="w-7 h-7 text-rose-400" />
                    </div>
                    {/* Animated Pulse Ring */}
                    <span className="absolute -top-1 -right-1 flex h-4 w-4">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-60"></span>
                      <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-500 border-2 border-[#161B29]"></span>
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-rose-500/15 text-rose-300 border border-rose-500/30">
                        {deleteStep === 1 ? 'Etapa 1 de 2: Segurança' : 'Etapa 2 de 2: Confirmação Final'}
                      </span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-extrabold text-white mt-1">
                      {deleteStep === 1 ? 'Excluir Login & Acesso da Loja' : 'Autorizar Revogação Definitiva'}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {deleteStep === 1
                        ? 'Você está prestes a remover as credenciais desta loja.'
                        : 'Esta ação não poderá ser desfeita.'}
                    </p>
                  </div>
                </div>

                {/* Step 1: Security Summary & Details */}
                {deleteStep === 1 && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="space-y-4"
                  >
                    {/* Target Store Summary Box */}
                    <div className="p-4 rounded-2xl bg-[#0B0F19]/80 border border-slate-700/80 space-y-2.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400 font-medium">🏬 Loja:</span>
                        <span className="text-white font-bold text-sm">{deleteTargetClient.storeName}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400 font-medium">👤 Usuário de Acesso:</span>
                        <span className="font-mono text-amber-300 font-bold bg-[#141B2D] px-2 py-0.5 rounded border border-slate-700">
                          {deleteTargetClient.username}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400 font-medium">💵 Valor Mensal:</span>
                        <span className="text-slate-200 font-bold">
                          R$ {(Number(deleteTargetClient.planPrice) || 0).toFixed(2).replace('.', ',')}/mês
                        </span>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-start space-x-3">
                      <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-rose-200/90 leading-relaxed">
                        Ao excluir este login, o lojista perderá imediatamente o acesso ao painel de administração e ao catálogo configurado.
                      </p>
                    </div>

                    <div className="flex items-center justify-end space-x-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setDeleteTargetClient(null)}
                        className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Cancelar
                      </button>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="button"
                        onClick={handleConfirmStep1}
                        className="px-5 py-2.5 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white rounded-xl text-xs sm:text-sm font-bold shadow-lg shadow-rose-950/50 flex items-center space-x-2 transition-all cursor-pointer"
                      >
                        <span>Avançar para Etapa 2</span>
                        <ArrowRight className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Final Verification & Safeguard Typing */}
                {deleteStep === 2 && (
                  <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="space-y-4"
                  >
                    <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/30 space-y-2">
                      <p className="text-xs text-slate-300">
                        Para confirmar a exclusão permanente de{' '}
                        <strong className="text-white font-bold">{deleteTargetClient.storeName}</strong>, digite{' '}
                        <span className="font-mono text-amber-300 font-bold bg-[#0B0F19] px-1.5 py-0.5 rounded border border-amber-500/30">
                          {deleteTargetClient.username}
                        </span>{' '}
                        ou clique no botão de autorização abaixo:
                      </p>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                        Confirmação de Segurança (digite o usuário ou "EXCLUIR"):
                      </label>
                      <input
                        type="text"
                        autoFocus
                        value={deleteConfirmationInput}
                        onChange={(e) => setDeleteConfirmationInput(e.target.value)}
                        placeholder={`Digite "${deleteTargetClient.username}" ou "EXCLUIR"`}
                        className="w-full px-4 py-2.5 bg-[#0B0F19] border border-rose-500/40 rounded-xl text-sm font-mono text-white focus:outline-none focus:border-rose-400 transition-colors"
                        id="input-delete-confirmation"
                      />
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <button
                        type="button"
                        onClick={() => setDeleteStep(1)}
                        disabled={isDeleting}
                        className="px-3.5 py-2 text-slate-400 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
                      >
                        ← Voltar
                      </button>

                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => setDeleteTargetClient(null)}
                          disabled={isDeleting}
                          className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                        >
                          Cancelar
                        </button>

                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          type="button"
                          onClick={handleExecuteDeletion}
                          disabled={
                            isDeleting ||
                            (deleteConfirmationInput.trim().toLowerCase() !== deleteTargetClient.username.toLowerCase() &&
                              deleteConfirmationInput.trim().toUpperCase() !== 'EXCLUIR')
                          }
                          className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-lg flex items-center space-x-2 transition-all cursor-pointer ${
                            deleteConfirmationInput.trim().toLowerCase() === deleteTargetClient.username.toLowerCase() ||
                            deleteConfirmationInput.trim().toUpperCase() === 'EXCLUIR'
                              ? 'bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white shadow-rose-950/60'
                              : 'bg-slate-800/80 text-slate-500 cursor-not-allowed border border-slate-700'
                          }`}
                          id="btn-confirm-final-delete"
                        >
                          {isDeleting ? (
                            <>
                              <RefreshCw className="w-4 h-4 animate-spin text-white" />
                              <span>Excluindo...</span>
                            </>
                          ) : (
                            <>
                              <Trash2 className="w-4 h-4 text-white" />
                              <span>Excluir Login Definitivamente</span>
                            </>
                          )}
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
