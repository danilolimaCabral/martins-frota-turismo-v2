/**
 * Dashboard Interativo com Drag-and-Drop
 * Permite aos usuários personalizar widgets do painel
 */

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  GripVertical,
  X,
  Plus,
  RotateCcw,
  Lock,
  Unlock,
} from 'lucide-react';
import { toast } from 'sonner';

export interface DashboardWidget {
  id: string;
  title: string;
  type: 'stats' | 'chart' | 'table' | 'alert' | 'custom';
  position: number;
  size: 'small' | 'medium' | 'large';
  visible: boolean;
  data?: any;
}

interface InteractiveDashboardProps {
  widgets: DashboardWidget[];
  onWidgetsChange: (widgets: DashboardWidget[]) => void;
  isEditing?: boolean;
  onEditingChange?: (isEditing: boolean) => void;
}

export const InteractiveDashboard: React.FC<InteractiveDashboardProps> = ({
  widgets,
  onWidgetsChange,
  isEditing = false,
  onEditingChange,
}) => {
  const [draggedWidget, setDraggedWidget] = useState<string | null>(null);
  const [localWidgets, setLocalWidgets] = useState<DashboardWidget[]>(widgets);

  const handleDragStart = (e: React.DragEvent, widgetId: string) => {
    setDraggedWidget(widgetId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedWidget || draggedWidget === targetId) return;

    const draggedIndex = localWidgets.findIndex((w) => w.id === draggedWidget);
    const targetIndex = localWidgets.findIndex((w) => w.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const newWidgets = [...localWidgets];
    const [draggedWidget_] = newWidgets.splice(draggedIndex, 1);
    newWidgets.splice(targetIndex, 0, draggedWidget_);

    // Atualizar posições
    const updatedWidgets = newWidgets.map((w, index) => ({
      ...w,
      position: index,
    }));

    setLocalWidgets(updatedWidgets);
    onWidgetsChange(updatedWidgets);
    setDraggedWidget(null);
    toast.success('Widget movido com sucesso');
  };

  const handleRemoveWidget = (widgetId: string) => {
    const updatedWidgets = localWidgets.filter((w) => w.id !== widgetId);
    setLocalWidgets(updatedWidgets);
    onWidgetsChange(updatedWidgets);
    toast.success('Widget removido');
  };

  const handleToggleVisibility = (widgetId: string) => {
    const updatedWidgets = localWidgets.map((w) =>
      w.id === widgetId ? { ...w, visible: !w.visible } : w
    );
    setLocalWidgets(updatedWidgets);
    onWidgetsChange(updatedWidgets);
  };

  const handleResetLayout = () => {
    if (confirm('Tem certeza que deseja restaurar o layout padrão?')) {
      localStorage.removeItem('martins_dashboard_layout');
      window.location.reload();
    }
  };

  const handleSaveLayout = () => {
    localStorage.setItem('martins_dashboard_layout', JSON.stringify(localWidgets));
    onEditingChange?.(false);
    toast.success('Layout salvo com sucesso');
  };

  const getWidgetSizeClass = (size: string) => {
    switch (size) {
      case 'small':
        return 'col-span-1';
      case 'large':
        return 'col-span-2 lg:col-span-3';
      default:
        return 'col-span-1 lg:col-span-2';
    }
  };

  const visibleWidgets = localWidgets.filter((w) => w.visible);

  return (
    <div className="space-y-4">
      {/* Controles */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
        <div>
          <h3 className="font-semibold text-slate-900">
            {isEditing ? '✏️ Modo de Edição' : '👁️ Modo de Visualização'}
          </h3>
          <p className="text-sm text-slate-600">
            {isEditing
              ? 'Arraste os widgets para reorganizar. Clique em X para remover.'
              : 'Clique em Editar para personalizar seu painel'}
          </p>
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetLayout}
                className="gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Restaurar
              </Button>
              <Button
                size="sm"
                onClick={handleSaveLayout}
                className="gap-2"
              >
                Salvar Layout
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEditingChange?.(true)}
              className="gap-2"
            >
              ✏️ Editar
            </Button>
          )}
        </div>
      </div>

      {/* Widgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {visibleWidgets.map((widget) => (
          <div
            key={widget.id}
            className={`${getWidgetSizeClass(widget.size)} ${
              isEditing ? 'cursor-move' : ''
            }`}
            draggable={isEditing}
            onDragStart={(e) => handleDragStart(e, widget.id)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, widget.id)}
          >
            <Card
              className={`h-full transition-all ${
                draggedWidget === widget.id
                  ? 'opacity-50 border-blue-500 bg-blue-50'
                  : ''
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {isEditing && (
                      <GripVertical className="w-5 h-5 text-slate-400 cursor-grab active:cursor-grabbing" />
                    )}
                    <CardTitle className="text-base">{widget.title}</CardTitle>
                  </div>
                  {isEditing && (
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleVisibility(widget.id)}
                        className="h-8 w-8 p-0"
                      >
                        {widget.visible ? (
                          <Unlock className="w-4 h-4" />
                        ) : (
                          <Lock className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveWidget(widget.id)}
                        className="h-8 w-8 p-0 text-red-600 hover:bg-red-50"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {/* Conteúdo do widget */}
                <div className="text-slate-600 text-sm">
                  {widget.type === 'stats' && (
                    <div className="text-3xl font-bold text-blue-600">
                      {widget.data?.value || '0'}
                    </div>
                  )}
                  {widget.type === 'chart' && (
                    <div className="h-40 bg-slate-100 rounded flex items-center justify-center text-slate-400">
                      Gráfico
                    </div>
                  )}
                  {widget.type === 'table' && (
                    <div className="space-y-2">
                      <div className="h-4 bg-slate-100 rounded" />
                      <div className="h-4 bg-slate-100 rounded" />
                      <div className="h-4 bg-slate-100 rounded w-3/4" />
                    </div>
                  )}
                  {widget.type === 'alert' && (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded text-yellow-800 text-sm">
                      ⚠️ {widget.data?.message || 'Alerta'}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      {/* Widgets Ocultos */}
      {isEditing && localWidgets.filter((w) => !w.visible).length > 0 && (
        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
          <h4 className="font-semibold text-slate-900 mb-3">Widgets Ocultos</h4>
          <div className="flex flex-wrap gap-2">
            {localWidgets
              .filter((w) => !w.visible)
              .map((widget) => (
                <Button
                  key={widget.id}
                  variant="outline"
                  size="sm"
                  onClick={() => handleToggleVisibility(widget.id)}
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  {widget.title}
                </Button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};
