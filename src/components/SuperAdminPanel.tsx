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
  ChevronDown,
  ExternalLink,
  ShieldCheck,
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
  const [isStoreTypeOpen, setIsStoreTypeOpen] = useState(false);

  // Form State for Adding / Editing
  const [formData, setFormData] = useState<{
    id?: string;
    storeName: string;
    username: string;
    password: string;
    planPrice: number | string;
    dueDate: string;
    
    phoneWhatsapp: string;
    notes: string;
    status: 'active' | 'inactive';
  }>({
    storeName: '',
    username: '',
    password: '',
    planPrice: 29.99,
    dueDate: getDefaultDueDate(30),
    
    phoneWhatsapp: '',
    notes: '',
    status: 'active',
  });

  const [renewTargetClient, setRenewTargetClient] = useState<StoreClient | null>(null);

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
  const getDueStatus = (dueDateStr?: string, client?: any) => {
    const isLifetime = (client && Number(client.planPrice) === 250) || (dueDateStr && (dueDateStr.startsWith('2126') || dueDateStr.startsWith('2099') || dueDateStr.startsWith('212')));
    
    if (isLifetime) {
      return {
        days: 99999,
        status: 'ok',
        label: 'Conta Vitalícia',
        color: 'text-amber-600 bg-amber-500/10 border-amber-200',
        badge: 'Conta Vitalícia',
        isLifetime: true
      };
    }

    if (!dueDateStr) return { days: 999, status: 'ok', label: 'Sem vencimento', color: 'text-stone-500 bg-white border-stone-200' };
    
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const due = new Date(dueDateStr + 'T00:00:00');
      if (isNaN(due.getTime())) {
        return { days: 999, status: 'ok', label: 'Sem vencimento', color: 'text-stone-500 bg-white border-stone-200' };
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
          color: 'text-stone-900 bg-stone-100 border-stone-300',
          badge: 'Vence em Breve',
        };
      } else {
        return {
          days: diffDays,
          status: 'ok',
          label: `Em dia (${diffDays} dias)`,
          color: 'text-emerald-600 bg-emerald-500/10 border-emerald-200',
          badge: 'Ativa & Em Dia',
        };
      }
    } catch {
      return { days: 999, status: 'ok', label: 'Sem vencimento', color: 'text-stone-500 bg-white border-stone-200' };
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

      const dueInfo = getDueStatus(c.dueDate, c);
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

      const dueInfo = getDueStatus(client.dueDate, client);

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
      planPrice: 29.99,
      dueDate: getDefaultDueDate(30),
      
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
      planPrice: client.planPrice !== undefined ? client.planPrice : 29.99,
      dueDate: client.dueDate || getDefaultDueDate(30),
      
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
      storeSlug: cleanUsername,
      password: formData.password.trim(),
      planPrice: isNaN(priceNum) ? 29.99 : priceNum,
      dueDate: formData.dueDate || getDefaultDueDate(30),
      storeType: 'clothing',
      
      phoneWhatsapp: formData.phoneWhatsapp.trim(),
      notes: formData.notes.trim(),
      status: formData.status,
      createdAt: editingClient?.createdAt || new Date().toISOString(),
      lastRenewedAt: editingClient?.lastRenewedAt || new Date().toISOString(),
    };

    try {
      await saveClient(clientToSave);
      showToast(editingClient ? 'Loja atualizada com sucesso!' : 'Nova loja criada com sucesso no sistema!', 'success');
      setIsAddingOrEditing(false);
      setEditingClient(null);
    } catch (err) {
      console.error('Error saving client:', err);
      showToast('Erro ao salvar loja. Tente novamente.', 'error');
    }
  };

  const confirmRenewClient = async () => {
    if (!renewTargetClient) return;
    setRenewingId(renewTargetClient.id);
    try {
      const currentDue = renewTargetClient.dueDate ? new Date(renewTargetClient.dueDate + 'T00:00:00') : new Date();
      const today = new Date();
      
      const baseDate = isNaN(currentDue.getTime()) || currentDue < today ? today : currentDue;
      const nextDue = new Date(baseDate);
      nextDue.setDate(nextDue.getDate() + 30);
      const nextDueDateStr = nextDue.toISOString().split('T')[0];

      const updated: StoreClient = {
        ...renewTargetClient,
        dueDate: nextDueDateStr,
        status: 'active',
        lastRenewedAt: new Date().toISOString(),
      };

      await saveClient(updated);
      showToast(`Plano de "${renewTargetClient.storeName}" renovado por +30 dias!`, 'success');
    } catch (err) {
      console.error('Error renewing client:', err);
      showToast('Erro ao renovar plano.', 'error');
    } finally {
      setTimeout(() => setRenewingId(null), 400);
      setRenewTargetClient(null);
    }
  };

  const handleQuickRenew = async (client: StoreClient) => {
    setRenewTargetClient(client);
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
    const slug = client.storeSlug || client.username;
    const storeLink = `${window.location.origin}/?loja=${slug}`;
    const adminLink = `${window.location.origin}/?loja=${slug}&admin=1`;
    const msg = `👑 *ACESSO À SUA WEB VITRINE*\n\nOlá! Aqui estão as credenciais exclusivas da sua loja:\n\n🏬 *Loja:* ${client.storeName}\n👤 *Usuário:* ${client.username}\n🔑 *Senha:* ${client.password}\n\n🌐 *Link da sua Vitrine:* ${storeLink}\n⚙️ *Painel de Gestão da Loja:* ${adminLink}\n📅 *Vencimento do Plano:* ${formatDateBr(client.dueDate)}\n💵 *Valor:* R$ ${(Number(client.planPrice) || 0).toFixed(2).replace('.', ',')}/mês\n\nQualquer dúvida, estamos à disposição na Gestão Web Vitrine! ✨`;
    
    copyToClipboard(msg, `msg-${client.id}`);
  };

  const handleSendWhatsappReminder = (client: StoreClient) => {
    const dueInfo = getDueStatus(client.dueDate);
    const priceFormatted = `R$ ${(Number(client.planPrice) || 0).toFixed(2).replace('.', ',')}`;
    const slug = client.storeSlug || client.username;
    const storeLink = `${window.location.origin}/?loja=${slug}`;
    
    let msg = '';
    if (dueInfo.status === 'overdue') {
      msg = `Olá! Notamos que a assinatura da sua Web Vitrine (*${client.storeName}*) venceu em *${formatDateBr(client.dueDate)}*. O valor da renovação é de *${priceFormatted}*.\n\n🌐 Sua Vitrine: ${storeLink}\n\nGostaria de renovar agora para manter o catálogo 100% online?`;
    } else {
      msg = `Olá! Aqui é da Gestão Web Vitrine. Segue o acesso da sua loja:\n\n🏬 *Loja:* ${client.storeName}\n👤 *Usuário:* ${client.username}\n🔑 *Senha:* ${client.password}\n🌐 *Link da Vitrine:* ${storeLink}\n📅 *Vencimento:* ${formatDateBr(client.dueDate)} (*${priceFormatted}*)`;
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
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans selection:bg-stone-900 selection:text-white">
      {/* Toast Notification */}
      <AnimatePresence>
        {feedbackToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 right-6 z-50 flex items-center space-x-3 px-5 py-3 rounded-2xl bg-white border border-stone-200 shadow-2xl shadow-stone-950/80 backdrop-blur-md"
          >
            {feedbackToast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
            {feedbackToast.type === 'info' && <CheckCircle2 className="w-5 h-5 text-stone-900" />}
            {feedbackToast.type === 'error' && <AlertTriangle className="w-5 h-5 text-rose-400" />}
            <span className="text-xs sm:text-sm font-semibold text-stone-900">{feedbackToast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Subtle Luxury Ambient Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] rounded-full bg-stone-200 blur-[120px]" />
        <div className="absolute top-[30%] right-[10%] w-[600px] h-[600px] rounded-full bg-indigo-500/5 blur-[140px]" />
      </div>

      {/* Top Navbar */}
      <header className="relative z-20 bg-stone-50/90 backdrop-blur-md border-b border-stone-200 sticky top-0 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Brand Logo & Identification */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-stone-900 text-white p-0.5 shadow-lg shadow-stone-200">
                  <div className="w-full h-full bg-stone-50 rounded-[14px] flex items-center justify-center">
                    <Crown className="w-6 h-6 text-stone-900" />
                  </div>
                </div>
                <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white"></span>
                </span>
              </div>

              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="font-bold text-lg text-stone-900 tracking-wide flex items-center gap-1.5 flex-wrap">
                    Webgestor Vitrine
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-stone-100 text-stone-900 border border-stone-300">
                      Master SaaS
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" /> Criptografia AES-256 Ativa
                    </span>
                  </h1>
                </div>
                <p className="text-xs text-stone-500 font-medium">
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
                className="flex items-center space-x-2 px-4 sm:px-5 py-2.5 bg-gradient-to-r   hover: hover: text-white font-bold rounded-xl text-xs sm:text-sm shadow-lg shadow-stone-200 transition-all cursor-pointer"
                id="btn-gestor-new-store"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Cadastrar Nova Loja</span>
                <span className="sm:hidden">Nova Loja</span>
              </motion.button>

              <button
                onClick={onLogout}
                className="flex items-center space-x-2 px-3.5 py-2.5 bg-stone-150 hover:bg-stone-200 text-stone-700 hover:text-stone-900 rounded-xl text-xs font-semibold border border-stone-200 transition-colors cursor-pointer"
                id="btn-gestor-logout"
              >
                <LogOut className="w-4 h-4 text-stone-500" />
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
            className="p-4 sm:p-5 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm"
          >
            <div className="flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center flex-shrink-0 border border-amber-200">
                <AlertTriangle className="w-5 h-5 text-amber-850" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-stone-900">
                  Atenção de Renovação Inteligente
                </h4>
                <p className="text-xs text-stone-650">
                  Você tem{' '}
                  {metrics.overdueCount > 0 && (
                    <span className="text-rose-600 font-bold">
                      {metrics.overdueCount} {metrics.overdueCount === 1 ? 'loja vencida' : 'lojas vencidas'} (R$ {metrics.overdueValue.toFixed(2).replace('.', ',')})
                    </span>
                  )}
                  {metrics.overdueCount > 0 && metrics.expiringSoonCount > 0 && ' e '}
                  {metrics.expiringSoonCount > 0 && (
                    <span className="text-stone-900 font-bold">
                      {metrics.expiringSoonCount} a vencer nos próximos 5 dias (R$ {metrics.expiringSoonValue.toFixed(2).replace('.', ',')})
                    </span>
                  )}.
                </p>
              </div>
            </div>

            <button
              onClick={() => setStatusFilter(metrics.overdueCount > 0 ? 'overdue' : 'expiring_soon')}
              className="px-4 py-2 bg-white hover:bg-stone-50 text-stone-900 border border-stone-200 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer whitespace-nowrap"
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
            className="p-5 sm:p-6 rounded-3xl bg-white border border-stone-200 shadow-xl relative overflow-hidden group hover:border-stone-200 transition-all"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-stone-200 rounded-bl-full pointer-events-none" />
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                Faturamento Mensal (MRR)
              </span>
              <div className="w-9 h-9 rounded-xl bg-stone-100 text-stone-900 flex items-center justify-center">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
              R$ {metrics.mrr.toFixed(2).replace('.', ',')}
              <span className="text-xs font-semibold text-stone-500">/mês</span>
            </div>
            <div className="mt-2 flex items-center text-xs text-stone-900/90 font-medium">
              <TrendingUp className="w-3.5 h-3.5 mr-1" />
              <span>Projeção anual: R$ {metrics.annualProjected.toFixed(2).replace('.', ',')}</span>
            </div>
          </motion.div>

          {/* Card 2: Lojas Ativas & Em Dia */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05 }}
            className="p-5 sm:p-6 rounded-3xl bg-white border border-emerald-500/20 shadow-xl relative overflow-hidden group hover:border-emerald-500/40 transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                Lojas Em Dia
              </span>
              <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
              {metrics.activeInGoodStanding}{' '}
              <span className="text-xs font-semibold text-stone-500">de {metrics.totalClients} lojas</span>
            </div>
            <div className="mt-2 flex items-center text-xs text-emerald-600 font-medium">
              <Zap className="w-3.5 h-3.5 mr-1" />
              <span>{metrics.paymentHealth}% de adimplência na carteira</span>
            </div>
          </motion.div>

          {/* Card 3: A Vencer em Breve */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="p-5 sm:p-6 rounded-3xl bg-white border border-stone-200 shadow-xl relative overflow-hidden group hover:border-stone-200 transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                A Vencer (Próx. 5 Dias)
              </span>
              <div className="w-9 h-9 rounded-xl bg-stone-100 text-stone-900 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
              {metrics.expiringSoonCount}
              <span className="text-xs font-semibold text-stone-500 ml-1.5">
                (R$ {metrics.expiringSoonValue.toFixed(2).replace('.', ',')})
              </span>
            </div>
            <div className="mt-2 flex items-center text-xs text-stone-500">
              <Calendar className="w-3.5 h-3.5 mr-1 text-stone-900" />
              <span>Renovações da semana</span>
            </div>
          </motion.div>

          {/* Card 4: Faltam Renovar / Vencidas */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
            className="p-5 sm:p-6 rounded-3xl bg-white border border-rose-500/20 shadow-xl relative overflow-hidden group hover:border-rose-500/40 transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                Faltam Renovar (Vencidas)
              </span>
              <div className="w-9 h-9 rounded-xl bg-rose-500/15 text-rose-400 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-rose-400 tracking-tight">
              {metrics.overdueCount}
              <span className="text-xs font-semibold text-stone-500 ml-1.5">
                (R$ {metrics.overdueValue.toFixed(2).replace('.', ',')})
              </span>
            </div>
            <div className="mt-2 flex items-center text-xs text-rose-300 font-medium">
              <span>{metrics.overdueCount > 0 ? 'Pendente de contato/cobrança' : 'Nenhuma loja em atraso'}</span>
            </div>
          </motion.div>
        </div>

        {/* Section Header & Filters Bar */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-stone-200 shadow-xl space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-stone-900 flex items-center gap-2">
                <Store className="w-5 h-5 text-stone-900" />
                Carteira de Lojas, Acessos & Logins
              </h2>
              <p className="text-xs text-stone-500">
                Gerencie credenciais, valores de mensalidade, status e exclusão com segurança em 2 etapas.
              </p>
            </div>

            {/* Real-time Search Box */}
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-stone-500 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por loja, usuário..."
                className="w-full pl-10 pr-4 py-2 bg-white border border-stone-200/80 rounded-xl text-xs sm:text-sm text-stone-900 focus:outline-none focus:border-stone-900 transition-colors"
                id="input-gestor-search"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-stone-500 hover:text-stone-900"
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
              { id: 'active', label: `Em Dia (${metrics.activeInGoodStanding})`, icon: CheckCircle2, color: 'text-emerald-600' },
              { id: 'expiring_soon', label: `Vencem em Breve (${metrics.expiringSoonCount})`, icon: Clock, color: 'text-stone-900' },
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
                      ? 'bg-stone-900 text-white shadow-md shadow-stone-200'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200 border border-stone-200'
                  }`}
                >
                  {tab.icon && <tab.icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : tab.color}`} />}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Clients Table / Cards List */}
        <div className="bg-white rounded-3xl border border-stone-200 shadow-2xl overflow-hidden">
          {filteredClients.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-stone-100 text-stone-900 flex items-center justify-center mx-auto border border-stone-200">
                <Store className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-stone-900">Nenhuma loja encontrada</h3>
              <p className="text-xs text-stone-500 max-w-md mx-auto">
                Não localizamos nenhuma loja com os filtros aplicados. Cadastre uma nova loja ou altere os termos da busca.
              </p>
              <button
                onClick={handleOpenAddModal}
                className="mt-3 px-4 py-2 bg-stone-900 text-white hover:bg-stone-900 text-white font-bold rounded-xl text-xs shadow-lg transition-all cursor-pointer"
              >
                Cadastrar Primeira Loja
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/80 border-b border-stone-200 text-[11px] font-extrabold uppercase tracking-wider text-stone-500">
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
                    const dueInfo = getDueStatus(client.dueDate, client);
                    const isPassVisible = !!visiblePasswords[client.id];
                    const priceFormatted = `R$ ${(Number(client.planPrice) || 0).toFixed(2).replace('.', ',')}`;

                    return (
                      <tr
                        key={client.id}
                        className={`hover:bg-stone-100 transition-colors ${
                          dueInfo.status === 'overdue' ? 'bg-rose-950/10' : ''
                        }`}
                      >
                        {/* Store Info */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-bold text-stone-900 text-sm flex items-center gap-1.5">
                            {client.storeName}
                            
                          </div>
                          <div className="text-[11px] text-stone-500 mt-0.5 flex items-center gap-2">
                            <span>Link: <code className="text-stone-900/80">/?loja={client.storeSlug || client.username}</code></span>
                          </div>
                        </td>

                        {/* Login & Password (Credentials) */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-1.5 font-mono text-xs">
                              <span className="text-stone-500">Usuário:</span>
                              <span className="text-stone-900 font-bold bg-white px-2 py-0.5 rounded border border-stone-200">
                                {client.username}
                              </span>
                            </div>
                            <div className="flex items-center space-x-1.5 font-mono text-xs">
                              <span className="text-stone-500">Senha:</span>
                              <span className="text-emerald-700 font-bold bg-white px-2 py-0.5 rounded border border-stone-200">
                                {isPassVisible ? client.password : '••••••••'}
                              </span>
                              <button
                                type="button"
                                onClick={() => togglePasswordVisibility(client.id)}
                                className="p-1 text-stone-500 hover:text-stone-900 transition-colors"
                                title={isPassVisible ? 'Ocultar Senha' : 'Ver Senha'}
                              >
                                {isPassVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </div>
                        </td>

                        {/* Plan Price */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-extrabold text-stone-900 text-sm">
                            {priceFormatted}
                          </div>
                          <span className="text-[10px] text-stone-500 uppercase tracking-wider">
                            {Number(client.planPrice) === 250 ? 'vitalício' : 'mensal'}
                          </span>
                        </td>

                        {/* Due Date & Remaining Days Badge */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          {dueInfo.isLifetime ? (
                            <div className="flex flex-col">
                              <div className="font-bold text-amber-600 text-xs flex items-center gap-1.5">
                                <Crown className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                                <span>Conta Vitalícia</span>
                              </div>
                              <div className="mt-1">
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border text-amber-600 bg-amber-500/10 border-amber-200">
                                  Acesso Permanente
                                </span>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="font-semibold text-stone-900 text-xs flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 text-stone-500" />
                                <span>{formatDateBr(client.dueDate)}</span>
                              </div>
                              <div className="mt-1">
                                <span
                                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${dueInfo.color}`}
                                >
                                  {dueInfo.label}
                                </span>
                              </div>
                            </>
                          )}
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          {client.status === 'inactive' ? (
                            <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white text-stone-500 border border-stone-200">
                              Suspensa
                            </span>
                          ) : dueInfo.status === 'overdue' ? (
                            <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse">
                              Pendente Renovação
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-100 text-emerald-600 border border-emerald-200">
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
                              className="px-2.5 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-700 border border-emerald-500/40 rounded-xl text-xs font-bold transition-all flex items-center space-x-1 cursor-pointer"
                              title="Renovar Plano (+30 Dias)"
                            >
                              <RefreshCw className={`w-3.5 h-3.5 ${renewingId === client.id ? 'animate-spin' : ''}`} />
                              <span className="hidden sm:inline">Renovar (+30d)</span>
                            </motion.button>

                            {/* Copy Full Credentials Message */}
                            <button
                              onClick={() => handleCopyFullAccessMessage(client)}
                              className="p-2 bg-stone-100 hover:bg-stone-200 text-stone-600 hover:text-stone-900 rounded-xl border border-stone-200 transition-colors cursor-pointer"
                              title="Copiar Convite / Acesso Completo"
                            >
                              {copiedId === `msg-${client.id}` ? (
                                <Check className="w-4 h-4 text-emerald-600" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </button>

                            {/* Send Whatsapp Reminder / Acesso */}
                            <button
                              onClick={() => handleSendWhatsappReminder(client)}
                              className="p-2 bg-emerald-500/10 hover:bg-emerald-100 text-emerald-600 rounded-xl border border-emerald-200 transition-colors cursor-pointer"
                              title="Enviar Acesso ou Lembrete pelo WhatsApp"
                            >
                              <MessageCircle className="w-4 h-4" />
                            </button>

                            {/* Direct Open Store Showcase */}
                            <a
                              href={`/?loja=${client.storeSlug || client.username}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 bg-stone-100 hover:bg-emerald-100 text-stone-600 hover:text-emerald-600 rounded-xl border border-stone-200 hover:border-emerald-500/40 transition-colors inline-flex items-center"
                              title="Abrir Vitrine em Nova Aba"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>

                            {/* Edit Client */}
                            <button
                              onClick={() => handleOpenEditModal(client)}
                              className="p-2 bg-stone-100 hover:bg-stone-200 text-stone-600 hover:text-stone-900 rounded-xl border border-stone-200 transition-colors cursor-pointer"
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
              className="relative w-full max-w-2xl bg-white border border-stone-300 rounded-3xl shadow-2xl overflow-hidden my-8"
              id="modal-gestor-client-form"
            >
              {/* Modal Header */}
              <div className="bg-stone-50 p-6 border-b border-stone-200 relative">
                <button
                  onClick={() => setIsAddingOrEditing(false)}
                  className="absolute top-5 right-5 p-2 text-stone-400 hover:text-stone-900 rounded-full bg-stone-100 hover:bg-stone-200 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-2xl bg-white text-stone-900 flex items-center justify-center border border-stone-200 shadow-xs">
                    <Store className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-stone-900">
                      {editingClient ? 'Editar Loja & Plano Financeiro' : 'Cadastrar Nova Loja na Gestão'}
                    </h3>
                    <p className="text-xs text-stone-500">
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
                    <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-1.5">
                      Nome da Loja *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.storeName}
                      onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                      placeholder="Ex: Boutique Elegance, Empório Natural..."
                      className="w-full px-4 py-2.5 bg-stone-50 hover:bg-stone-100/50 focus:bg-white border border-stone-200 rounded-xl text-sm text-stone-900 focus:outline-none focus:border-stone-900 transition-all"
                      id="input-form-storename"
                    />
                  </div>

                  {/* Nome de Usuário */}
                  <div>
                    <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-1.5">
                      Nome de Usuário (Login) *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        required
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/[^a-z0-9_.-]/g, '') })}
                        placeholder="Ex: boutique_elegance"
                        className="w-full pl-10 pr-4 py-2.5 bg-stone-50 hover:bg-stone-100/50 focus:bg-white border border-stone-200 rounded-xl text-sm text-stone-900 font-mono focus:outline-none focus:border-stone-900 transition-all"
                        id="input-form-username"
                      />
                    </div>
                    <p className="text-[11px] text-stone-400 mt-1">Será usado no link da loja: <code>/?loja={formData.username || 'nome'}</code></p>
                  </div>

                  {/* Senha */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider">
                        Senha de Acesso (Máx 8 dígitos) *
                      </label>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, password: generateRandomPassword() })}
                        className="text-[11px] text-stone-900 hover:text-stone-900 font-semibold cursor-pointer"
                      >
                        Gerar Senha
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        required
                        maxLength={8}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="Ex: 12345678"
                        className="w-full pl-10 pr-4 py-2.5 bg-stone-50 hover:bg-stone-100/50 focus:bg-white border border-stone-200 rounded-xl text-sm text-stone-900 font-mono focus:outline-none focus:border-stone-900 transition-all"
                        id="input-form-password"
                      />
                    </div>
                  </div>

                  {/* Plano Contratado (Com Animação Interativa de Alto Padrão) */}
                  <div className="sm:col-span-2 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                        <Crown className="w-3.5 h-3.5 text-stone-900" />
                        Plano Contratado & Duração *
                      </label>
                      <span className="text-[11px] text-stone-500 font-medium">
                        Toque para selecionar o ciclo
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        {
                          price: 29.99,
                          title: 'Mensal',
                          period: '30 dias',
                          days: 30,
                          badge: null,
                        },
                        {
                          price: 49.99,
                          title: 'Trimestral',
                          period: '90 dias',
                          days: 90,
                          badge: 'Mais Escolhido',
                        },
                        {
                          price: 119.99,
                          title: 'Semestral',
                          period: '180 dias',
                          days: 180,
                          badge: 'Alta Economia',
                        },
                        {
                          price: 250.00,
                          title: 'Vitalício',
                          period: 'Acesso Vitalício',
                          days: 36500,
                          badge: 'Único / Vitalício',
                        },
                      ].map((plan) => {
                        const isSelected = Number(formData.planPrice) === plan.price;
                        return (
                          <motion.button
                            key={plan.price}
                            type="button"
                            whileHover={{ scale: 1.03, y: -2 }}
                            whileTap={{ scale: 0.96 }}
                            transition={{ type: 'spring', stiffness: 450, damping: 20 }}
                            onClick={() => {
                              setFormData({
                                ...formData,
                                planPrice: plan.price,
                                dueDate: getDefaultDueDate(plan.days),
                              });
                            }}
                            className={`relative p-3 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer overflow-hidden select-none min-h-[96px] ${
                              isSelected
                                ? 'bg-stone-900 border-stone-900 shadow-xl text-white'
                                : 'bg-stone-50 hover:bg-stone-100 border-stone-200/80 hover:border-stone-300 text-stone-900'
                            }`}
                            id={`btn-plan-select-${plan.price}`}
                          >
                            {/* Top Badge */}
                            {plan.badge && (
                              <span className={`self-start px-1.5 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wider mb-1 shadow-2xs relative z-10 ${isSelected ? 'bg-white text-stone-900' : 'bg-stone-900 text-white'}`}>
                                {plan.badge}
                              </span>
                            )}

                            <div className="flex items-center justify-between w-full mb-1 relative z-10">
                              <span className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-stone-900'}`}>
                                {plan.title}
                              </span>
                              <div
                                className={`w-4 h-4 rounded-full flex items-center justify-center border transition-all ${
                                  isSelected
                                    ? 'bg-white text-stone-900 border-white scale-110'
                                    : 'border-stone-300 bg-transparent'
                                }`}
                              >
                                {isSelected && (
                                  <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                                  >
                                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                                  </motion.div>
                                )}
                              </div>
                            </div>

                            <div className="my-0.5 relative z-10">
                              <span className={`text-sm sm:text-base font-black tracking-tight ${isSelected ? 'text-white' : 'text-stone-900'}`}>
                                R$ {plan.price.toFixed(2).replace('.', ',')}
                              </span>
                            </div>

                            <span className={`text-[10px] font-medium relative z-10 ${isSelected ? 'text-stone-300' : 'text-stone-500'}`}>
                              {plan.period}
                            </span>
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Data de Vencimento */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-stone-900" />
                        Data de Vencimento *
                      </label>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, dueDate: getDefaultDueDate(30) })}
                        className="text-[11px] text-stone-900 hover:text-stone-900 font-semibold cursor-pointer"
                      >
                        +30 Dias
                      </button>
                    </div>
                    <input
                      type="date"
                      required
                      value={formData.dueDate}
                      onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                      className="w-full px-4 py-2.5 bg-stone-50 hover:bg-stone-100/50 focus:bg-white border border-stone-200 rounded-xl text-sm text-stone-900 focus:outline-none focus:border-stone-900 transition-all"
                      id="input-form-duedate"
                    />
                  </div>

                  {/* WhatsApp do Cliente */}
                  <div>
                    <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-1.5">
                      WhatsApp do Cliente (Opcional)
                    </label>
                    <input
                      type="text"
                      value={formData.phoneWhatsapp}
                      onChange={(e) => setFormData({ ...formData, phoneWhatsapp: e.target.value })}
                      placeholder="Ex: 11999998888 (com DDD)"
                      className="w-full px-4 py-2.5 bg-stone-50 hover:bg-stone-100/50 focus:bg-white border border-stone-200 rounded-xl text-sm text-stone-900 focus:outline-none focus:border-stone-900 transition-all"
                      id="input-form-phone"
                    />
                  </div>

                  {/* Status da Loja */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-1.5">
                      Status da Conta
                    </label>
                    <div className="flex items-center space-x-3">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, status: 'active' })}
                        className={`flex-1 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                          formData.status === 'active'
                            ? 'bg-stone-900 border-stone-900 text-white shadow-md'
                            : 'bg-white border-stone-200 text-stone-500 hover:bg-stone-50'
                        }`}
                      >
                        Ativa (Liberada)
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, status: 'inactive' })}
                        className={`flex-1 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                          formData.status === 'inactive'
                            ? 'bg-rose-50 border-rose-200 text-rose-700 shadow-sm font-extrabold'
                            : 'bg-white border-stone-200 text-stone-500 hover:bg-stone-50'
                        }`}
                      >
                        Suspensa / Inativa
                      </button>
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="flex items-center justify-end space-x-3 pt-6 border-t border-stone-200">
                  <button
                    type="button"
                    onClick={() => setIsAddingOrEditing(false)}
                    className="px-5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="px-6 py-2.5 bg-stone-900 hover:bg-stone-850 text-white rounded-xl text-xs sm:text-sm font-bold shadow-lg shadow-stone-200 flex items-center space-x-2 transition-all cursor-pointer"
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

      {/* LUXURY 2-STEP RENEWAL MODAL */}
      <AnimatePresence>
        {renewTargetClient && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: -20 }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="w-full max-w-md bg-white border border-stone-200 rounded-3xl overflow-hidden shadow-2xl"
              id="modal-luxury-renew-login"
            >
              <div className="p-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shadow-inner">
                    <RefreshCw className="w-8 h-8" />
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-bold text-stone-900 mb-1.5 font-serif-luxury">
                      Confirmar Renovação
                    </h3>
                    <p className="text-sm text-stone-600 leading-relaxed max-w-sm mx-auto">
                      Deseja renovar manualmente a loja <strong className="text-emerald-600">{renewTargetClient.storeName}</strong> por mais <strong className="text-stone-900 font-bold">30 dias</strong>?
                    </p>
                  </div>
                  
                  <div className="w-full mt-4 flex gap-3">
                    <button
                      onClick={() => setRenewTargetClient(null)}
                      className="flex-1 py-3 px-4 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-sm font-bold border border-stone-200 transition-colors cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={confirmRenewClient}
                      className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-lg shadow-emerald-650/15 transition-colors flex items-center justify-center space-x-2 cursor-pointer"
                    >
                      <Check className="w-4 h-4 text-white" />
                      <span>Confirmar (+30d)</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* LUXURY 2-STEP LOGIN DELETION MODAL (Removes generic alert/confirm) */}
      <AnimatePresence>
        {deleteTargetClient && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-lg bg-white border border-stone-200 rounded-3xl shadow-2xl overflow-hidden"
              id="modal-luxury-delete-login"
            >
              {/* Glowing Top Accent Bar */}
              <div className="h-1.5 w-full bg-rose-600" />

              {/* Close Button */}
              <button
                onClick={() => setDeleteTargetClient(null)}
                disabled={isDeleting}
                className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-900 rounded-full bg-stone-100 hover:bg-stone-200 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="p-6 sm:p-8 space-y-6">
                {/* Header with Luxury Animated Shield */}
                <div className="flex items-start space-x-4">
                  <div className="relative flex-shrink-0">
                    <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center shadow-md">
                      <ShieldAlert className="w-7 h-7 text-rose-500" />
                    </div>
                    {/* Animated Pulse Ring */}
                    <span className="absolute -top-1 -right-1 flex h-4 w-4">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-60"></span>
                      <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-500 border-2 border-white"></span>
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-rose-50 text-rose-600 border border-rose-100">
                        {deleteStep === 1 ? 'Etapa 1 de 2: Segurança' : 'Etapa 2 de 2: Confirmação Final'}
                      </span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-extrabold text-stone-900 mt-1">
                      {deleteStep === 1 ? 'Excluir Login & Acesso da Loja' : 'Autorizar Revogação Definitiva'}
                    </h3>
                    <p className="text-xs text-stone-500 mt-0.5">
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
                    <div className="p-4 rounded-2xl bg-white/80 border border-stone-200/80 space-y-2.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-stone-500 font-medium">🏬 Loja:</span>
                        <span className="text-stone-900 font-bold text-sm">{deleteTargetClient.storeName}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-stone-500 font-medium">👤 Usuário de Acesso:</span>
                        <span className="font-mono text-stone-900 font-bold bg-white px-2 py-0.5 rounded border border-stone-200">
                          {deleteTargetClient.username}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-stone-500 font-medium">💵 Valor Mensal:</span>
                        <span className="text-stone-900 font-bold">
                          R$ {(Number(deleteTargetClient.planPrice) || 0).toFixed(2).replace('.', ',')}/mês
                        </span>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-100 flex items-start space-x-3">
                      <AlertTriangle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-rose-700 leading-relaxed">
                        Ao excluir este login, o lojista perderá imediatamente o acesso ao painel de administração e ao catálogo configurado.
                      </p>
                    </div>

                    <div className="flex items-center justify-end space-x-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setDeleteTargetClient(null)}
                        className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold border border-stone-200 transition-colors cursor-pointer"
                      >
                        Cancelar
                      </button>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="button"
                        onClick={handleConfirmStep1}
                        className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-lg shadow-rose-100 flex items-center space-x-2 transition-all cursor-pointer"
                      >
                        <span>Avançar para Etapa 2</span>
                        <ArrowRight className="w-4 h-4 text-white" />
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
                    <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 space-y-2">
                      <p className="text-xs text-stone-700">
                        Para confirmar a exclusão permanente de{' '}
                        <strong className="text-stone-900 font-bold">{deleteTargetClient.storeName}</strong>, digite{' '}
                        <span className="font-mono text-stone-900 font-bold bg-white px-1.5 py-0.5 rounded border border-stone-300">
                          {deleteTargetClient.username}
                        </span>{' '}
                        ou clique no botão de autorização abaixo:
                      </p>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-1.5">
                        Confirmação de Segurança (digite o usuário ou "EXCLUIR"):
                      </label>
                      <input
                        type="text"
                        autoFocus
                        value={deleteConfirmationInput}
                        onChange={(e) => setDeleteConfirmationInput(e.target.value)}
                        placeholder={`Digite "${deleteTargetClient.username}" ou "EXCLUIR"`}
                        className="w-full px-4 py-2.5 bg-white border border-stone-200 rounded-xl text-sm font-mono text-stone-900 focus:outline-none focus:border-stone-400 transition-colors"
                        id="input-delete-confirmation"
                      />
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <button
                        type="button"
                        onClick={() => setDeleteStep(1)}
                        disabled={isDeleting}
                        className="px-3.5 py-2 text-stone-500 hover:text-stone-900 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        ← Voltar
                      </button>

                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => setDeleteTargetClient(null)}
                          disabled={isDeleting}
                          className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold border border-stone-200 transition-colors cursor-pointer"
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
                              ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-100'
                              : 'bg-stone-50 text-stone-400 cursor-not-allowed border border-stone-200'
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
