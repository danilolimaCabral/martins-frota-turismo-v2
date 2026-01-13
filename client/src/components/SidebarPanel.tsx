/**
 * Componente de Painel Lateral Melhorado
 * Com menus colapsáveis, ícones e design moderno
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, X } from 'lucide-react';

export interface SidebarSection {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  content: React.ReactNode;
  defaultExpanded?: boolean;
}

interface SidebarPanelProps {
  sections: SidebarSection[];
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

export const SidebarPanel: React.FC<SidebarPanelProps> = ({
  sections,
  title,
  icon: Icon,
  isOpen,
  onClose,
  className = '',
}) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(
    sections.reduce(
      (acc, section) => ({
        ...acc,
        [section.id]: section.defaultExpanded !== false,
      }),
      {}
    )
  );

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  if (!isOpen) return null;

  return (
    <div
      className={`bg-slate-800/50 border border-white/10 rounded-lg overflow-hidden flex flex-col min-h-0 ${className}`}
    >
      {/* Header */}
      <div className="p-4 md:p-6 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-slate-700/50 to-slate-800/50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <Icon className="w-5 h-5 text-blue-400" />
          </div>
          <h2 className="text-lg font-bold text-white">{title}</h2>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="lg:hidden h-8 w-8 text-white/60 hover:text-white"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Seções */}
      <div className="flex-1 overflow-y-auto">
        {sections.map((section, index) => {
          const SectionIcon = section.icon;
          const isExpanded = expandedSections[section.id];

          return (
            <div
              key={section.id}
              className={`border-b border-white/10 ${index === sections.length - 1 ? 'border-b-0' : ''}`}
            >
              {/* Header da Seção */}
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full p-4 md:p-6 flex items-center justify-between hover:bg-slate-700/30 transition-colors duration-200"
              >
                <div className="flex items-center gap-3">
                  <SectionIcon className="w-4 h-4 text-indigo-400" />
                  <span className="font-semibold text-white text-base md:text-lg">
                    {section.title}
                  </span>
                </div>
                <div className="text-white/40 transition-transform duration-200">
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </div>
              </button>

              {/* Conteúdo da Seção */}
              {isExpanded && (
                <div className="px-4 md:px-6 pb-4 md:pb-6 space-y-3 animate-in fade-in duration-200">
                  {section.content}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

/**
 * Componente para exibir estatísticas em grid
 */
export const StatGrid: React.FC<{
  stats: Array<{
    label: string;
    value: number | string;
    color: 'blue' | 'green' | 'orange' | 'red' | 'purple';
    icon?: React.ComponentType<{ className?: string }>;
  }>;
}> = ({ stats }) => {
  const colorMap = {
    blue: 'bg-blue-500/20 border-blue-500/30 text-blue-400',
    green: 'bg-green-500/20 border-green-500/30 text-green-400',
    orange: 'bg-orange-500/20 border-orange-500/30 text-orange-400',
    red: 'bg-red-500/20 border-red-500/30 text-red-400',
    purple: 'bg-purple-500/20 border-purple-500/30 text-purple-400',
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      {stats.map((stat, index) => {
        const StatIcon = stat.icon;
        return (
          <div
            key={index}
            className={`border p-3 md:p-4 rounded-lg text-center hover:opacity-80 transition-opacity ${colorMap[stat.color]}`}
          >
            {StatIcon && <StatIcon className="w-5 h-5 mx-auto mb-2" />}
            <p className="text-white/60 text-sm md:text-base">{stat.label}</p>
            <p className="text-2xl md:text-3xl font-bold mt-1">{stat.value}</p>
          </div>
        );
      })}
    </div>
  );
};

/**
 * Componente para exibir filtros
 */
export const FilterGroup: React.FC<{
  filters: Array<{
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: Array<{ value: string; label: string }>;
  }>;
}> = ({ filters }) => {
  return (
    <div className="space-y-4">
      {filters.map((filter, index) => (
        <div key={index}>
          <label className="text-white/60 text-sm md:text-base font-semibold block mb-2">
            {filter.label}
          </label>
          <select
            value={filter.value}
            onChange={(e) => filter.onChange(e.target.value)}
            className="w-full bg-slate-700 text-white text-sm md:text-base rounded-lg px-3 py-2 border border-white/10 hover:border-white/20 transition-colors focus:border-blue-500 focus:outline-none"
          >
            {filter.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      ))}
    </div>
  );
};

/**
 * Componente para exibir lista de itens
 */
export const ItemList: React.FC<{
  items: Array<{
    id: string;
    title: string;
    subtitle?: string;
    badge?: { label: string; color: string };
    icon?: React.ComponentType<{ className?: string }>;
    onClick?: () => void;
    isSelected?: boolean;
  }>;
  emptyMessage?: string;
}> = ({ items, emptyMessage = 'Nenhum item encontrado' }) => {
  if (items.length === 0) {
    return (
      <div className="text-center py-6 text-white/40">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {items.map((item) => {
        const ItemIcon = item.icon;
        return (
          <button
            key={item.id}
            onClick={item.onClick}
            className={`w-full text-left p-3 md:p-4 rounded-lg border transition-all ${
              item.isSelected
                ? 'bg-indigo-500/30 border-indigo-500/50'
                : 'bg-slate-700/20 border-white/10 hover:border-white/20 hover:bg-slate-700/30'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2 flex-1 min-w-0">
                {ItemIcon && <ItemIcon className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />}
                <div className="min-w-0 flex-1">
                  <p className="text-white font-semibold text-sm md:text-base truncate">
                    {item.title}
                  </p>
                  {item.subtitle && (
                    <p className="text-white/60 text-xs md:text-sm truncate">{item.subtitle}</p>
                  )}
                </div>
              </div>
              {item.badge && (
                <span
                  className={`text-xs md:text-sm font-bold px-2 py-1 rounded flex-shrink-0 ${item.badge.color}`}
                >
                  {item.badge.label}
                </span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
};
