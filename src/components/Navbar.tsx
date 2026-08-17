import React, { useState } from 'react';
import { StoreSettings } from '../types';
import {
  ShoppingBag,
  Search,
  Instagram,
  Phone,
  LayoutDashboard,
  Store,
  Share2,
  CheckCircle2,
  X,
} from 'lucide-react';
import { formatPhone, cleanPhoneForWhatsapp } from '../lib/formatters';

interface NavbarProps {
  settings: StoreSettings;
  activeView: 'store' | 'admin' | 'super_admin';
  onToggleView: (view: 'store' | 'admin' | 'super_admin') => void;
  cartCount: number;
  onOpenCart: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  categories: string[];
  onOpenStoreSetup: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  settings,
  activeView,
  onToggleView,
  cartCount,
  onOpenCart,
  searchQuery,
  onSearchChange,
  selectedCategory,
  onSelectCategory,
  categories,
  onOpenStoreSetup,
}) => {
  const [showSearch, setShowSearch] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-brand-bg/98 backdrop-blur-md border-b border-brand-bg-alt transition-all">
      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Left: Brand Identity */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                onSelectCategory('all');
                onToggleView('store');
              }}
              className="flex items-center space-x-3 text-left group cursor-pointer"
              id="brand-logo-button"
            >
              {settings.logoUrl ? (
                <img
                  src={settings.logoUrl}
                  alt={settings.storeName}
                  className="w-10 h-10 rounded-full object-cover border border-brand-border-dark shadow-2xs group-hover:scale-105 transition-transform"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-brand-secondary text-brand-primary flex items-center justify-center font-serif-luxury font-bold text-lg shadow-2xs">
                  {settings.storeName ? settings.storeName.charAt(0) : 'A'}
                </div>
              )}

              <div>
                <span className="font-serif-luxury text-lg sm:text-xl font-bold tracking-tight text-stone-900 group-hover:text-brand-primary-dark transition-colors block">
                  {settings.storeName}
                </span>
              </div>
            </button>
          </div>

          {/* Right Controls: Search, Cart, Admin toggle */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Search Toggle */}
            <button
              onClick={() => setShowSearch(!showSearch)}
              className={`p-2 rounded-xl transition-colors cursor-pointer ${
                showSearch
                  ? 'bg-stone-900 text-white'
                  : 'text-stone-700 hover:text-stone-900 hover:bg-brand-bg-alt'
              }`}
              title="Buscar no catálogo"
              id="btn-toggle-search"
            >
              <Search className="w-4.5 h-4.5" />
            </button>

            {/* Shopping Bag (Vitrine Mode) */}
            {activeView === 'store' && (
              <button
                type="button"
                onClick={onOpenCart}
                className="relative p-2 bg-stone-900 text-white hover:bg-stone-800 rounded-xl transition-all shadow-sm flex items-center justify-center cursor-pointer"
                id="btn-open-bag"
                title="Sacola de Compras"
              >
                <ShoppingBag className="w-4.5 h-4.5 text-brand-primary" />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-brand-primary-dark text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-xs">
                    {cartCount}
                  </span>
                )}
              </button>
            )}

            {/* Mode Switch (Vitrine vs Admin Panel) */}
            <div>
              {activeView === 'admin' ? (
                <button
                  type="button"
                  onClick={() => onToggleView('store')}
                  className="flex items-center space-x-1.5 px-3.5 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
                  id="btn-nav-store"
                >
                  <Store className="w-3.5 h-3.5 text-brand-primary" />
                  <span>Ver Vitrine</span>
                </button>
              ) : activeView === 'store' ? (
                <button
                  type="button"
                  onClick={() => onToggleView('admin')}
                  className="p-2 text-stone-700 hover:text-stone-900 hover:bg-brand-bg-alt rounded-xl transition-colors cursor-pointer"
                  id="btn-nav-admin"
                  title="Painel do Lojista"
                >
                  <LayoutDashboard className="w-4.5 h-4.5" />
                </button>
              ) : null}
            </div>
          </div>
        </div>

        {/* Expandable Search Input */}
        {showSearch && (
          <div className="pb-3 pt-1">
            <div className="relative max-w-xl mx-auto">
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={settings.storeType === "natural" ? "Pesquisar por chás, ervas, suplementos..." : "Pesquisar por modelo, tecido, cor, tamanho..."}
                className="w-full pl-10 pr-9 py-2 bg-white border border-brand-border-dark rounded-xl text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-brand-primary-dark/30 focus:border-brand-primary-dark shadow-2xs"
                id="input-navbar-search"
              />
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-2.5" />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-2 text-stone-400 hover:text-stone-700"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Categories Bar in Store Mode */}
        {activeView === 'store' && (
          <div className="flex items-center space-x-1.5 overflow-x-auto py-2 scrollbar-none border-t border-brand-bg-alt/70">
            <button
              onClick={() => onSelectCategory('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-stone-900 text-white shadow-2xs'
                  : 'bg-white/80 hover:bg-white text-stone-700 border border-brand-border'
              }`}
            >
              Todas as Peças
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => onSelectCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-stone-900 text-white shadow-2xs'
                    : 'bg-white/80 hover:bg-white text-stone-700 border border-brand-border'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>
    </header>
  );
};
