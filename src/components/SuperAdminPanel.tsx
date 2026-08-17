import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Plus, Trash2, Store, LogOut, CheckCircle2 } from 'lucide-react';
import { StoreClient } from '../types';
import { getClients, saveClient, deleteClient } from '../lib/firestoreService';

interface SuperAdminPanelProps {
  onLogout: () => void;
}

export function SuperAdminPanel({ onLogout }: SuperAdminPanelProps) {
  const [clients, setClients] = useState<StoreClient[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newClient, setNewClient] = useState<Partial<StoreClient>>({
    storeType: 'clothing',
    status: 'active'
  });

  useEffect(() => {
    const unsubscribe = getClients((data) => {
      setClients(data);
    });
    return () => unsubscribe();
  }, []);

  const handleSaveClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClient.storeName || !newClient.username || !newClient.password) return;

    const clientToSave: StoreClient = {
      id: newClient.id || `client-${Date.now()}`,
      storeName: newClient.storeName,
      username: newClient.username,
      password: newClient.password,
      storeType: newClient.storeType as 'clothing' | 'natural',
      status: 'active',
      createdAt: newClient.createdAt || new Date().toISOString(),
    };

    await saveClient(clientToSave);
    setIsAdding(false);
    setNewClient({ storeType: 'clothing', status: 'active' });
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja remover este cliente? O acesso será revogado.')) {
      await deleteClient(id);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F2F5] text-slate-900 font-sans">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-slate-900 text-white flex items-center justify-center rounded-lg shadow-md">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h1 className="font-bold text-lg text-slate-900 leading-tight">Painel SaaS (Super Admin)</h1>
                <p className="text-xs text-slate-500">Gestão de Lojas e Clientes</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center space-x-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-semibold transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Lojas Cadastradas</h2>
            <p className="text-sm text-slate-500">Crie os acessos para os seus clientes (Vitrine de Roupas ou Produtos Naturais).</p>
          </div>
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center justify-center space-x-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-md transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Loja / Cliente</span>
          </button>
        </div>

        {isAdding && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-2xl shadow-sm border border-indigo-100"
          >
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center space-x-2">
              <Store className="w-5 h-5 text-indigo-500" />
              <span>Cadastrar Novo Cliente</span>
            </h3>
            <form onSubmit={handleSaveClient} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nome da Loja</label>
                <input
                  type="text"
                  required
                  value={newClient.storeName || ''}
                  onChange={(e) => setNewClient({ ...newClient, storeName: e.target.value })}
                  placeholder="Ex: Minha Loja"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Usuário de Login</label>
                <input
                  type="text"
                  required
                  value={newClient.username || ''}
                  onChange={(e) => setNewClient({ ...newClient, username: e.target.value })}
                  placeholder="Ex: loja123"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Senha (Máx 8 dígitos)</label>
                <input
                  type="text"
                  required
                  maxLength={8}
                  value={newClient.password || ''}
                  onChange={(e) => setNewClient({ ...newClient, password: e.target.value })}
                  placeholder="Ex: 12345678"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tipo de Sistema</label>
                <select
                  value={newClient.storeType}
                  onChange={(e) => setNewClient({ ...newClient, storeType: e.target.value as 'clothing' | 'natural' })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/50"
                >
                  <option value="clothing">Vitrine - Loja de Roupas</option>
                  <option value="natural">Loja Verde (Estilo Shopee) - Produtos Naturais</option>
                </select>
              </div>
              <div className="md:col-span-2 lg:col-span-4 flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-semibold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-bold shadow-md transition-colors flex items-center space-x-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Gerar Acesso</span>
                </button>
              </div>
            </form>
          </motion.div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {clients.length === 0 ? (
            <div className="p-10 text-center">
              <Store className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-700">Nenhuma loja cadastrada</h3>
              <p className="text-slate-500 text-sm">Crie o primeiro acesso para o seu cliente clicando no botão acima.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">Loja</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">Acesso (Login/Senha)</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">Tipo</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-slate-600 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {clients.map((client) => (
                    <tr key={client.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-bold text-slate-800">{client.storeName}</div>
                        <div className="text-xs text-slate-500">ID: {client.id}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-mono bg-slate-100 px-2 py-1 rounded inline-block mb-1">
                          User: <span className="text-indigo-600 font-bold">{client.username}</span>
                        </div>
                        <br />
                        <div className="text-sm font-mono bg-slate-100 px-2 py-1 rounded inline-block">
                          Pass: <span className="text-emerald-600 font-bold">{client.password}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {client.storeType === 'clothing' ? (
                          <span className="px-2.5 py-1 bg-stone-100 text-stone-800 rounded-lg text-xs font-semibold">
                            👗 Vitrine de Roupas
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-lg text-xs font-semibold">
                            🛒 Loja Verde (Estilo Shopee)
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="flex items-center space-x-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                          <span className="text-xs font-semibold text-slate-700">Ativo</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button
                          onClick={() => handleDelete(client.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Remover Cliente"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
