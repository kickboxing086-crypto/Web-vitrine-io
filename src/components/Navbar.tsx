import React, { useState } from 'react';
import { motion } from 'motion/react';
import { StoreSettings } from '../types';
import {
  ShoppingBag,
  Search,
  LayoutDashboard,
  Store,
  X,
  Clock,
  Crown,
} from 'lucide-react';
import { checkStoreHoursStatus } from '../lib/themeUtils';
import { PWAInstallButton } from './PWAInstallButton';

interface NavbarProps {
  settings: StoreSettings;
  activeView: 'store' | 'admin' | 'super_admin' | 'landing';
  onToggleView: (view: 'store' | 'admin' | 'super_admin' | 'landing') => void;
  cartCount: number;
  onOpenCart: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  categories: string[];
  onOpenStoreSetup: () => void;
  onOpenStoreHours?: () => void;
  onOpenLandingHero?: () => void;
  isOfficialStore?: boolean;
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
  onOpenStoreHours,
  onOpenLandingHero,
  isOfficialStore = false,
}) => {
  const [showSearch, setShowSearch] = useState(false);
  const hoursStatus = checkStoreHoursStatus(settings);

  return (
    <header className="sticky top-0 z-40 bg-[#0D0D0F]/95 backdrop-blur-md border-b border-[#27272A] transition-all">
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
                  className="w-10 h-10 rounded-full object-cover border border-[#D4AF37]/40 shadow-sm group-hover:scale-105 transition-transform"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-[#16161A] text-[#D4AF37] border border-[#D4AF37]/30 flex items-center justify-center font-serif-luxury font-bold text-lg shadow-sm">
                  {settings.storeName ? settings.storeName.charAt(0) : 'V'}
                </div>
              )}

              <div>
                <span className="font-serif-luxury text-lg sm:text-xl font-bold tracking-tight text-white group-hover:text-[#D4AF37] transition-colors block">
                  {settings.storeName || 'Web Vitrine'}
                </span>
              </div>
            </button>
          </div>

          {/* Right Controls: Store Hours, Search, Bag, System Landing, Admin toggle */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Install Button */}
            <PWAInstallButton variant="gold" showText={true} label="Instalar" className="inline-flex px-3 py-1.5 text-xs font-bold" />

            {/* Store Hours Highlighted Clock Button */}
            {onOpenStoreHours && activeView === 'store' && (
              <button
                type="button"
                onClick={onOpenStoreHours}
                className={`flex items-center space-x-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl text-xs font-medium border transition-colors cursor-pointer shadow-xs ${
                  hoursStatus.isBreakNow
                    ? 'bg-amber-950/30 text-amber-300 border-amber-800/60 hover:bg-amber-950/50'
                    : hoursStatus.isOpenNow
                    ? 'bg-emerald-950/30 text-emerald-300 border-emerald-800/60 hover:bg-emerald-950/50'
                    : 'bg-stone-900 text-stone-400 border-stone-800 hover:bg-stone-800'
                }`}
                title="Ver horários de funcionamento"
                id="btn-navbar-store-hours"
              >
                <div className="relative">
                  <Clock className="w-3.5 h-3.5" />
                  <span className={`absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full ${
                    hoursStatus.isBreakNow
                      ? 'bg-amber-400'
                      : hoursStatus.isOpenNow
                      ? 'bg-emerald-400'
                      : 'bg-stone-500'
                  }`} />
                </div>
                <span className="hidden sm:inline">
                  {hoursStatus.isBreakNow ? 'Em Intervalo' : hoursStatus.isOpenNow ? 'Aberto' : 'Horários'}
                </span>
              </button>
            )}

            {/* Presentation / Landing Button */}
            {onOpenLandingHero && activeView === 'store' && !isOfficialStore && (
              <button
                type="button"
                onClick={onOpenLandingHero}
                className="inline-flex items-center space-x-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 bg-[#16161A] hover:bg-stone-900 text-[#D4AF37] rounded-xl text-xs font-semibold border border-[#D4AF37]/30 shadow-xs transition-colors cursor-pointer"
                id="btn-navbar-landing"
                title="Conheça a plataforma Web Vitrine"
              >
                <Crown className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span className="hidden sm:inline">Plataforma</span>
              </button>
            )}

            {/* Search Toggle */}
            <button
              onClick={() => setShowSearch(!showSearch)}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                showSearch
                  ? 'bg-[#D4AF37] text-stone-950 border-[#D4AF37]'
                  : 'bg-[#16161A] text-stone-300 hover:text-white border-[#27272A] hover:border-stone-600'
              }`}
              title="Buscar no catálogo"
              id="btn-toggle-search"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Shopping Bag (Vitrine Mode) */}
            {activeView === 'store' && (
              <button
                type="button"
                onClick={onOpenCart}
                className="relative p-2 bg-[#16161A] text-white hover:bg-stone-900 border border-[#27272A] hover:border-[#D4AF37]/60 rounded-xl transition-all shadow-sm flex items-center justify-center cursor-pointer"
                id="btn-open-bag"
                title="Sacola de Compras"
              >
                <ShoppingBag className="w-4.5 h-4.5 text-[#D4AF37]" />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#D4AF37] text-stone-950 text-[10px] font-extrabold rounded-full flex items-center justify-center shadow-md">
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
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#D4AF37] hover:bg-[#C5A059] text-stone-950 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                  id="btn-nav-store"
                >
                  <Store className="w-3.5 h-3.5" />
                  <span>Ver Vitrine</span>
                </button>
              ) : activeView === 'store' ? (
                <button
                  type="button"
                  onClick={() => onToggleView('admin')}
                  className="p-2 text-stone-400 hover:text-white bg-[#16161A] border border-[#27272A] hover:border-stone-600 rounded-xl transition-colors cursor-pointer"
                  id="btn-nav-admin"
                  title="Painel do Lojista"
                >
                  <LayoutDashboard className="w-4 h-4" />
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
                placeholder="Pesquisar por modelo, cor, tamanho..."
                className="w-full pl-10 pr-9 py-2 bg-[#16161A] border border-[#27272A] rounded-xl text-xs text-white placeholder:text-stone-500 focus:outline-none focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
                id="input-navbar-search"
              />
              <Search className="w-4 h-4 text-stone-500 absolute left-3.5 top-2.5" />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-2 text-stone-500 hover:text-stone-300"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Categories Bar in Store Mode */}
        {activeView === 'store' && (
          <div className="flex items-center space-x-1.5 overflow-x-auto py-2.5 scrollbar-none border-t border-[#27272A]">
            <button
              type="button"
              onClick={() => onSelectCategory('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-[#D4AF37] text-stone-950 font-bold shadow-sm'
                  : 'bg-[#16161A] text-stone-300 hover:text-white border border-[#27272A] hover:border-stone-600'
              }`}
            >
              Todas as Peças
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => onSelectCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#D4AF37] text-stone-950 font-bold shadow-sm'
                    : 'bg-[#16161A] text-stone-300 hover:text-white border border-[#27272A] hover:border-stone-600'
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
