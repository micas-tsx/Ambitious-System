"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, FileText, Star, Loader2 } from "lucide-react";
import { pessoalService } from "@/services/pessoal.service";

export default function DiarioDashboard() {
  const [notas, setNotas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newNoteContent, setNewNoteContent] = useState("");
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskCategory, setNewTaskCategory] = useState("Pessoal");
  const [savingNote, setSavingNote] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string | null>(null);

  const categorias = ["Saúde", "Estudos", "Pessoal", "Família", "Hobbies", "Trabalho", "Tarefas", "Moradia"];

  const fetchData = async () => {
    try {
      const notasData = await pessoalService.getNotasDiario();
      setNotas(Array.isArray(notasData) ? notasData : []);
    } catch (error) {
      console.error("Erro ao carregar notas:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveNote = async () => {
    if (!newNoteContent.trim()) return;
    setSavingNote(true);
    try {
      await pessoalService.createNotaDiario(newNoteContent);
      setNewNoteContent("");
      await fetchData();
    } catch (error) {
      console.error("Erro ao salvar nota:", error);
    } finally {
      setSavingNote(false);
    }
  };

  const handleCreateTask = async () => {
    if (!newTaskTitle.trim()) return;
    try {
      const lastNoteId = notas.length > 0 ? notas[0].id : undefined;
      await pessoalService.createTask({
        title: newTaskTitle,
        category: newTaskCategory,
        rating: 3,
        journalId: lastNoteId
      });
      setNewTaskTitle("");
      await fetchData();
    } catch (error) {
      console.error("Erro ao criar tarefa:", error);
    }
  };

  const handleToggleTask = async (taskId: string, currentStatus: boolean) => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pessoal/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ isCompleted: !currentStatus }),
      });
      await fetchData();
    } catch (error) {
      console.error("Erro ao atualizar task:", error);
    }
  };

  const handleRatingChange = async (taskId: string, newRating: number) => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pessoal/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ rating: newRating }),
      });
      await fetchData();
    } catch (error) {
      console.error("Erro ao atualizar rating:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  // Pega todas as tasks das notas para exibir no painel lateral
  const allTasks = notas.flatMap(nota => nota.tasks || []);
  const filteredTasks = filterCategory 
    ? allTasks.filter((t: any) => t.category === filterCategory)
    : allTasks;

  return (
    <div className="flex flex-col gap-8">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-1">
            Diário e Tasks
          </h1>
          <p className="text-zinc-400">
            Reflita sobre seu dia e organize suas tarefas mais importantes.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Painel Diário (Journal) */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-500" />
                Meu Diário - Hoje
              </CardTitle>
              <CardDescription className="text-zinc-400">
                Escreva livremente, como foi seu dia? Suas conquistas e pontos a melhorar.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <textarea 
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-zinc-300 min-h-[200px] focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-zinc-600 resize-y"
                placeholder="Hoje eu acabei concluindo..."
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
              />
              <div className="flex justify-end mt-4">
                <Button 
                  onClick={handleSaveNote}
                  disabled={savingNote || !newNoteContent.trim()}
                  className="bg-blue-600 hover:bg-blue-700 text-white border-0"
                >
                  {savingNote ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Salvar Registro
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Histórico Anotações */}
          <h3 className="text-lg font-semibold text-white mt-8 mb-4">Registros Anteriores</h3>
          <div className="space-y-4">
            {notas.length > 0 ? notas.map((nota) => (
              <Card key={nota.id} className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-colors">
                <CardContent className="p-5">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold text-blue-400">
                      {new Date(nota.date).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                  </div>
                  <p className="text-zinc-400 text-sm whitespace-pre-wrap">
                    {nota.content}
                  </p>
                  {nota.tasks?.length > 0 && (
                    <div className="mt-3 flex gap-2 overflow-x-auto">
                      {nota.tasks.map((t: any) => (
                        <span key={t.id} className="text-[10px] bg-zinc-800 px-2 py-1 rounded text-zinc-500 border border-zinc-700">
                          {t.title}
                        </span>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )) : (
              <p className="text-zinc-500 text-center py-8">Nenhum registro encontrado.</p>
            )}
          </div>
        </div>

        {/* Painel de Tasks */}
        <div className="space-y-6">
          <Card className="bg-zinc-900 border-zinc-800 h-full">
            <CardHeader>
              <CardTitle className="text-white">Tasks de Hoje</CardTitle>
              <CardDescription className="text-zinc-400">O que precisa ser feito?</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-6">
                <Input 
                  placeholder="Nova tarefa..." 
                  className="bg-zinc-950 border-zinc-800 text-zinc-300 placeholder:text-zinc-600"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateTask()}
                />
                <Button 
                  size="icon" 
                  className="bg-blue-600 hover:bg-blue-700 text-white shrink-0"
                  onClick={handleCreateTask}
                >
                  <PlusCircle className="w-4 h-4" />
                </Button>
              </div>

              {/* Filtros de Categorias */}
              <div className="flex flex-wrap gap-2 mb-6">
                <span 
                  onClick={() => setFilterCategory(null)}
                  className={`text-[10px] uppercase font-semibold cursor-pointer px-2 py-1 rounded-sm transition-colors ${filterCategory === null ? "bg-blue-600 text-white" : "text-zinc-400 bg-zinc-800 hover:bg-zinc-700"}`}
                >
                  Todas
                </span>
                {categorias.slice(0, 4).map(cat => (
                  <span 
                    key={cat} 
                    onClick={() => setFilterCategory(cat)}
                    className={`text-[10px] uppercase font-semibold cursor-pointer px-2 py-1 rounded-sm transition-colors ${filterCategory === cat ? "bg-blue-600 text-white" : "text-zinc-400 bg-zinc-800 hover:bg-zinc-700"}`}
                  >
                    {cat}
                  </span>
                ))}
              </div>

              {/* Lista de Tasks */}
              <div className="space-y-3">
                {filteredTasks.length > 0 ? filteredTasks.map((task: any) => (
                  <div key={task.id} className="group flex flex-col p-3 rounded-lg border border-zinc-800 bg-zinc-950 hover:border-zinc-700 transition-all">
                    <div className="flex items-start gap-3">
                      <input 
                        type="checkbox" 
                        checked={task.isCompleted}
                        onChange={() => handleToggleTask(task.id, task.isCompleted)}
                        className="mt-1 w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-blue-600 focus:ring-blue-500 focus:ring-offset-zinc-950 flex-shrink-0 cursor-pointer" 
                      />
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${task.isCompleted ? "text-zinc-600 line-through" : "text-zinc-200"}`}>
                          {task.title}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
                            {task.category}
                          </span>
                          <div className="flex gap-0.5" onClick={(e) => e.stopPropagation()}>
                            {Array.from({ length: 5 }).map((_, idx) => (
                              <Star 
                                key={idx} 
                                onClick={() => !task.isCompleted && handleRatingChange(task.id, idx + 1)}
                                className={`w-3 h-3 cursor-pointer transition-colors ${idx < (task.rating || 0) ? "fill-amber-500 text-amber-500" : "fill-zinc-800 text-zinc-800"} ${!task.isCompleted ? "hover:text-amber-500" : ""}`} 
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )) : (
                  <p className="text-zinc-600 text-xs text-center py-4">Sem tarefas no momento.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
