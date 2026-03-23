"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Loader2, GripVertical } from "lucide-react";
import { pessoalService } from "@/services/pessoal.service";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const columns = [
  { title: "A Fazer (To Do)", id: "todo", color: "text-zinc-400", dbStatus: "TODO" },
  { title: "Em Progresso (Doing)", id: "doing", color: "text-blue-400", dbStatus: "DOING" },
  { title: "Concluído (Done)", id: "done", color: "text-emerald-400", dbStatus: "DONE" },
];

function MetaCard({ meta, onDelete }: { meta: any; onDelete: () => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: meta.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card 
      ref={setNodeRef} 
      style={style}
      className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-colors group"
    >
      <CardContent className="p-3">
        <div className="flex items-start gap-2">
          <div 
            {...attributes} 
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-zinc-600 hover:text-zinc-400 mt-1"
          >
            <GripVertical className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-white">{meta.title}</p>
          </div>
          <button 
            onClick={onDelete}
            className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-500 text-xs transition-opacity"
          >
            ×
          </button>
        </div>
      </CardContent>
    </Card>
  );
}

function Column({ column, metas, onDelete }: { column: any; metas: any[]; onDelete: (id: string) => void }) {
  return (
    <div className="w-80 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className={`font-semibold ${column.color}`}>
          {column.title} <span className="text-zinc-600 text-sm ml-2">{metas.length}</span>
        </h3>
      </div>
      
      <SortableContext items={metas.map(m => m.id)} strategy={verticalListSortingStrategy}>
        <div className="flex-1 bg-zinc-900/50 rounded-xl p-3 border border-zinc-800/50 flex flex-col gap-3 min-h-[300px]">
          {metas.map((meta) => (
            <MetaCard 
              key={meta.id} 
              meta={meta} 
              onDelete={() => onDelete(meta.id)} 
            />
          ))}

          {metas.length === 0 && (
            <div className="flex-1 flex items-center justify-center border-2 border-dashed border-zinc-800/50 rounded-lg">
              <p className="text-zinc-700 text-xs italic">Arraste metas aqui</p>
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}

export default function QuadroMetas() {
  const [metas, setMetas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMetaTitle, setNewMetaTitle] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const fetchData = async () => {
    try {
      const data = await pessoalService.getMetas();
      setMetas(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Erro ao carregar metas:", error);
      setMetas([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateMeta = async () => {
    if (!newMetaTitle.trim()) return;
    try {
      await pessoalService.createMeta(newMetaTitle, "TODO");
      setNewMetaTitle("");
      await fetchData();
    } catch (error) {
      console.error("Erro ao criar meta:", error);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await pessoalService.updateMetaStatus(id, newStatus);
      await fetchData();
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
    }
  };

  const handleDeleteMeta = async (id: string) => {
    if (!confirm("Excluir esta meta?")) return;
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pessoal/metas/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      await fetchData();
    } catch (error) {
      console.error("Erro ao deletar meta:", error);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeMeta = metas.find(m => m.id === active.id);
    if (!activeMeta) return;

    const overId = over.id as string;
    const overMeta = metas.find(m => m.id === overId);
    
    let targetColumn: string | null = null;
    
    if (overMeta) {
      targetColumn = overMeta.status;
    } else {
      const column = columns.find(c => c.id === overId);
      if (column) {
        targetColumn = column.dbStatus;
      }
    }

    if (targetColumn && targetColumn !== activeMeta.status) {
      handleUpdateStatus(activeMeta.id, targetColumn);
    }
  };

  const activeMeta = activeId ? metas.find(m => m.id === activeId) : null;

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-1">
            Quadro de Metas
          </h1>
          <p className="text-zinc-400">
            Acompanhe seus projetos e objetivos no estilo Kanban.
          </p>
        </div>
        <div className="flex gap-3">
          <div className="flex gap-2">
            <input 
              className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Nova meta..."
              value={newMetaTitle}
              onChange={(e) => setNewMetaTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateMeta()}
            />
            <Button 
              onClick={handleCreateMeta}
              className="bg-blue-600 hover:bg-blue-700 text-white border-0 shadow-lg"
            >
              <PlusCircle className="mr-2 h-4 w-4" /> Adicionar
            </Button>
          </div>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex-1 overflow-x-auto">
          <div className="flex gap-6 h-full min-w-max pb-4">
            {columns.map(col => {
              const columnMetas = metas.filter(m => m.status === col.dbStatus);
              return (
                <Column 
                  key={col.id} 
                  column={col} 
                  metas={columnMetas}
                  onDelete={handleDeleteMeta}
                />
              );
            })}
          </div>
        </div>

        <DragOverlay>
          {activeMeta ? (
            <Card className="bg-zinc-800 border-blue-500 shadow-xl">
              <CardContent className="p-3">
                <p className="text-sm font-medium text-white">{activeMeta.title}</p>
              </CardContent>
            </Card>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
