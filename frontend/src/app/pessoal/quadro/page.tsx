"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Loader2, GripVertical, X, Pencil, Trash2, Star } from "lucide-react";
import { pessoalService } from "@/services/pessoal.service";
import { Modal } from "@/components/ui/modal";
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
  DragOverEvent,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const columns = [
  { title: "A Fazer", id: "TODO", color: "text-zinc-400", bgColor: "bg-zinc-800/30" },
  { title: "Em Progresso", id: "DOING", color: "text-blue-400", bgColor: "bg-blue-900/20" },
  { title: "Concluído", id: "DONE", color: "text-emerald-400", bgColor: "bg-emerald-900/20" },
];

const categories = ["Pessoal", "Trabalho", "Estudos", "Saúde", "Família", "Hobbies", "Moradia"];

interface Task {
  id: string;
  title: string;
  category: string;
  rating: number;
  status: string;
  date: string;
}

function TaskCard({ task, onDelete, onEdit }: { task: Task; onDelete: () => void; onEdit: () => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const categoryColors: Record<string, string> = {
    Pessoal: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    Trabalho: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    Estudos: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    Saúde: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    Família: "bg-pink-500/20 text-pink-400 border-pink-500/30",
    Hobbies: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
    Moradia: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  };

  return (
    <Card 
      ref={setNodeRef} 
      style={style}
      className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-colors group"
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div 
            {...attributes} 
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-zinc-600 hover:text-zinc-400 mt-1"
          >
            <GripVertical className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{task.title}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className={`text-[10px] px-2 py-0.5 rounded border ${categoryColors[task.category] || "bg-zinc-800 text-zinc-400 border-zinc-700"}`}>
                {task.category}
              </span>
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <Star 
                    key={idx} 
                    className={`w-3 h-3 ${idx < (task.rating || 0) ? "fill-amber-500 text-amber-500" : "text-zinc-800"}`} 
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              onClick={() => onEdit(task)}
              className="p-1 text-zinc-600 hover:text-blue-500 rounded transition-colors"
              title="Editar"
            >
              <Pencil className="w-3 h-3" />
            </button>
            <button 
              onClick={() => onDelete(task.id)}
              className="p-1 text-zinc-600 hover:text-red-500 rounded transition-colors"
              title="Excluir"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function Column({ 
  column, 
  tasks, 
  onDelete, 
  onEdit 
}: { 
  column: any; 
  tasks: Task[]; 
  onDelete: (id: string) => void; 
  onEdit: (task: Task) => void;
}) {
  const { setNodeRef } = useDroppable({ id: column.id });

  return (
    <div className="w-80 flex flex-col gap-4">
      <div className={`flex items-center justify-between px-3 py-2 rounded-lg ${column.bgColor}`}>
        <h3 className={`font-semibold ${column.color}`}>
          {column.title}
        </h3>
        <span className="text-zinc-600 text-sm font-medium">{tasks.length}</span>
      </div>
      
      <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
        <div 
          ref={setNodeRef}
          data-column-id={column.id}
          className="flex-1 bg-zinc-900/30 rounded-xl p-3 border border-zinc-800/50 flex flex-col gap-3 min-h-[400px]"
        >
          {tasks.map((task) => (
            <TaskCard 
              key={task.id} 
              task={task} 
              onDelete={onDelete} 
              onEdit={onEdit}
            />
          ))}

          {tasks.length === 0 && (
            <div className="flex-1 flex items-center justify-center border-2 border-dashed border-zinc-800/50 rounded-lg">
              <p className="text-zinc-700 text-xs italic">Arraste tasks aqui</p>
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}

export default function QuadroTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formCategory, setFormCategory] = useState("Pessoal");
  const [formRating, setFormRating] = useState(3);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const fetchData = async () => {
    try {
      const data = await pessoalService.getTasks();
      setTasks(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Erro ao carregar tasks:", error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateTask = async () => {
    if (!formTitle.trim()) return;
    try {
      await pessoalService.createTask({ 
        title: formTitle, 
        category: formCategory,
        rating: formRating
      });
      setFormTitle("");
      setFormCategory("Pessoal");
      setFormRating(3);
      setShowAddModal(false);
      await fetchData();
    } catch (error) {
      console.error("Erro ao criar task:", error);
    }
  };

  const handleUpdateTask = async () => {
    if (!formTitle.trim() || !taskToEdit) return;
    try {
      await pessoalService.updateTask(taskToEdit.id, { 
        title: formTitle, 
        category: formCategory,
        rating: formRating 
      });
      setFormTitle("");
      setFormCategory("Pessoal");
      setFormRating(3);
      setTaskToEdit(null);
      setShowEditModal(false);
      await fetchData();
    } catch (error) {
      console.error("Erro ao atualizar task:", error);
    }
  };

  const handleDeleteTask = async () => {
    if (!taskToDelete) return;
    try {
      await pessoalService.deleteTask(taskToDelete.id);
      setTaskToDelete(null);
      setShowDeleteModal(false);
      await fetchData();
    } catch (error) {
      console.error("Erro ao deletar task:", error);
    }
  };

  const handleOpenEditModal = (task: Task) => {
    setTaskToEdit(task);
    setFormTitle(task.title);
    setFormCategory(task.category);
    setFormRating(task.rating);
    setShowEditModal(true);
  };

  const handleOpenDeleteModal = (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (task) {
      setTaskToDelete(task);
      setShowDeleteModal(true);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;
    if (!over) return;

    const activeId = event.active.id as string;
    const overId = over.id as string;
    
    const activeTask = tasks.find(t => t.id === activeId);
    if (!activeTask) return;

    const column = columns.find(c => c.id === overId);
    if (column && activeTask.status !== column.id) {
      handleUpdateStatus(activeId, column.id);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;
    
    const activeTask = tasks.find(t => t.id === activeId);
    if (!activeTask) return;

    const column = columns.find(c => c.id === overId);
    if (column && activeTask.status !== column.id) {
      handleUpdateStatus(activeId, column.id);
    } else {
      const overTask = tasks.find(t => t.id === overId);
      if (overTask && activeTask.status !== overTask.status) {
        handleUpdateStatus(activeId, overTask.status);
      }
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await pessoalService.updateTaskStatus(id, newStatus);
      await fetchData();
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
    }
  };

  const activeTask = activeId ? tasks.find(t => t.id === activeId) : null;

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-1">
            Quadro de Tasks
          </h1>
          <p className="text-zinc-400">
            Organize suas tarefas no estilo Kanban.
          </p>
        </div>
        <Button 
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white border-0 shadow-lg"
        >
          <PlusCircle className="mr-2 h-4 w-4" /> Nova Task
        </Button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex-1 overflow-x-auto">
          <div className="flex gap-6 h-full min-w-max pb-4">
            {columns.map(col => {
              const columnTasks = tasks.filter(t => t.status === col.id);
              return (
                <Column 
                  key={col.id} 
                  column={col} 
                  tasks={columnTasks}
                  onDelete={handleOpenDeleteModal}
                  onEdit={handleOpenEditModal}
                />
              );
            })}
          </div>
        </div>

        <DragOverlay>
          {activeTask ? (
            <Card className="bg-zinc-800 border-blue-500 shadow-xl w-72">
              <CardContent className="p-4">
                <p className="text-sm font-medium text-white">{activeTask.title}</p>
              </CardContent>
            </Card>
          ) : null}
        </DragOverlay>
      </DndContext>

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Nova Task">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Título</label>
            <input
              type="text"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateTask()}
              placeholder="Digite a tarefa..."
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Categoria</label>
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setFormCategory(cat)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                    formCategory === cat 
                      ? "bg-blue-600 border-blue-600 text-white" 
                      : "bg-zinc-900 border-zinc-700 text-zinc-400 hover:border-zinc-600"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Prioridade</label>
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setFormRating(idx + 1)}
                  className="p-1 hover:scale-110 transition-transform"
                >
                  <Star 
                    className={`w-5 h-5 ${idx < formRating ? "fill-amber-500 text-amber-500" : "text-zinc-700 hover:text-amber-500"}`} 
                  />
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2 justify-end pt-4">
            <Button 
              variant="ghost" 
              onClick={() => setShowAddModal(false)}
              className="text-zinc-400 hover:text-white"
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleCreateTask}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Criar Task
            </Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Editar Task">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Título</label>
            <input
              type="text"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleUpdateTask()}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Categoria</label>
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setFormCategory(cat)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                    formCategory === cat 
                      ? "bg-blue-600 border-blue-600 text-white" 
                      : "bg-zinc-900 border-zinc-700 text-zinc-400 hover:border-zinc-600"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Prioridade</label>
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setFormRating(idx + 1)}
                  className="p-1 hover:scale-110 transition-transform"
                >
                  <Star 
                    className={`w-5 h-5 ${idx < formRating ? "fill-amber-500 text-amber-500" : "text-zinc-700 hover:text-amber-500"}`} 
                  />
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2 justify-end pt-4">
            <Button 
              variant="ghost" 
              onClick={() => setShowEditModal(false)}
              className="text-zinc-400 hover:text-white"
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleUpdateTask}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Salvar
            </Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Excluir Task">
        <div className="space-y-4">
          <p className="text-zinc-300">
            Tem certeza que deseja excluir a task <strong className="text-white">"{taskToDelete?.title}"</strong>?
          </p>
          <div className="flex gap-2 justify-end">
            <Button 
              variant="ghost" 
              onClick={() => setShowDeleteModal(false)}
              className="text-zinc-400 hover:text-white"
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleDeleteTask}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Excluir
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}