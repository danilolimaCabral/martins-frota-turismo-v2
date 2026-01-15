import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Trash2, GripVertical } from "lucide-react";

interface Endereco {
  nomeUsuario: string;
  endereco: string;
}

interface DraggableEnderecoListProps {
  enderecos: Endereco[];
  onEnderecoRemove: (index: number) => void;
  onEnderecoReorder: (enderecos: Endereco[]) => void;
}

function SortableEnderecoItem({
  id,
  index,
  endereco,
  onRemove,
}: {
  id: string;
  index: number;
  endereco: Endereco;
  onRemove: (index: number) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center justify-between bg-muted p-3 rounded-lg border border-border hover:border-primary/50 transition-colors"
    >
      <div className="flex items-center gap-3 flex-1">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors"
          title="Arraste para reordenar"
        >
          <GripVertical className="h-5 w-5" />
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{endereco.nomeUsuario || `Endereço ${index + 1}`}</p>
          <p className="text-xs text-muted-foreground truncate">{endereco.endereco}</p>
        </div>
      </div>
      <Button
        type="button"
        onClick={() => onRemove(index)}
        variant="ghost"
        size="sm"
        className="ml-2"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}

export function DraggableEnderecoList({
  enderecos,
  onEnderecoRemove,
  onEnderecoReorder,
}: DraggableEnderecoListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      distance: 8,
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = enderecos.findIndex((_, i) => `endereco-${i}` === active.id);
      const newIndex = enderecos.findIndex((_, i) => `endereco-${i}` === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const newEnderecos = arrayMove(enderecos, oldIndex, newIndex);
        onEnderecoReorder(newEnderecos);
      }
    }
  };

  if (enderecos.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 space-y-2">
      <p className="text-sm font-medium">Endereços adicionados ({enderecos.length}):</p>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={enderecos.map((_, i) => `endereco-${i}`)}
          strategy={verticalListSortingStrategy}
        >
          <div className="max-h-48 overflow-y-auto space-y-2 pr-2">
            {enderecos.map((endereco, idx) => (
              <SortableEnderecoItem
                key={`endereco-${idx}`}
                id={`endereco-${idx}`}
                index={idx}
                endereco={endereco}
                onRemove={onEnderecoRemove}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
