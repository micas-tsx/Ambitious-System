"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Dumbbell, Timer, Flame, CheckCircle2, Loader2, Target } from "lucide-react";
import { corpoService } from "@/services/corpo.service";

export default function TreinosDashboard() {
  const [routines, setRoutines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeRoutineIndex, setActiveRoutineIndex] = useState(0);
  const [newRoutineName, setNewRoutineName] = useState("");

  const fetchData = async () => {
    try {
      const data = await corpoService.getTreinos();
      setRoutines(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Erro ao carregar treinos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateRoutine = async () => {
    if (!newRoutineName.trim()) return;
    try {
      await corpoService.createTreino({ name: newRoutineName });
      setNewRoutineName("");
      await fetchData();
    } catch (error) {
      console.error("Erro ao criar rotina:", error);
    }
  };

  const handleDeleteRoutine = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta rotina?")) return;
    try {
      await corpoService.deleteTreino(id);
      setActiveRoutineIndex(0);
      await fetchData();
    } catch (error) {
      console.error("Erro ao deletar rotina:", error);
    }
  };

  const [newExercise, setNewExercise] = useState({ name: "", sets: 3, reps: 12, weight: 0 });
  const [showAddExercise, setShowAddExercise] = useState(false);

  const handleAddExercise = async () => {
    if (!activeRoutine || !newExercise.name.trim()) return;
    try {
      await corpoService.addExercicio(activeRoutine.id, newExercise);
      setNewExercise({ name: "", sets: 3, reps: 12, weight: 0 });
      setShowAddExercise(false);
      await fetchData();
    } catch (error) {
      console.error("Erro ao adicionar exercício:", error);
    }
  };

  const handleDeleteExercise = async (id: string) => {
    try {
      await corpoService.deleteExercicio(id);
      await fetchData();
    } catch (error) {
      console.error("Erro ao deletar exercício:", error);
    }
  };

  const activeRoutine = routines[activeRoutineIndex];

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-1">
            Meus Treinos
          </h1>
          <p className="text-zinc-400">
            Acompanhe suas rotinas, intensidade e histórico de exercícios.
          </p>
        </div>
        <div className="flex gap-2">
          <input 
            className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 w-40 md:w-auto"
            placeholder="Nova rotina..."
            value={newRoutineName}
            onChange={(e) => setNewRoutineName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreateRoutine()}
          />
          <Button 
            onClick={handleCreateRoutine}
            className="bg-zinc-800 hover:bg-zinc-700 text-white border-zinc-700"
            size="sm"
          >
            <PlusCircle className="mr-2 h-4 w-4" /> Criar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Painel Central: Treinos */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex gap-2 bg-zinc-900/50 p-1.5 rounded-xl w-fit border border-zinc-800 overflow-x-auto max-w-full">
             {routines.map((rotina, i) => (
                <button 
                  key={rotina.id} 
                  onClick={() => setActiveRoutineIndex(i)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all shrink-0 ${activeRoutineIndex === i ? "bg-emerald-600 text-white shadow-lg" : "text-zinc-400 hover:text-white hover:bg-zinc-800"}`}
                >
                   {rotina.name}
                </button>
             ))}
             {routines.length === 0 && <span className="text-zinc-600 px-4 py-2 text-sm italic">Nenhuma rotina criada</span>}
          </div>

          {activeRoutine ? (
            <Card className="bg-zinc-950 border-zinc-800 overflow-hidden shadow-2xl">
               <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-zinc-800/50 bg-zinc-900/30">
                 <div>
                    <CardTitle className="text-white text-2xl font-bold">{activeRoutine.name}</CardTitle>
                    <CardDescription className="text-zinc-500 font-medium">Dia: {activeRoutine.weekday || "Não definido"}</CardDescription>
                 </div>
                 <div className="flex gap-2">
                   <Button 
                     variant="destructive" 
                     size="sm" 
                     className="bg-red-950/30 text-red-500 border border-red-950 hover:bg-red-950/50"
                     onClick={() => handleDeleteRoutine(activeRoutine.id)}
                   >
                      Excluir
                   </Button>
                    {/* TODO: Implementar modo de treino ativo com timer e controle de séries */}
                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                       Iniciar
                    </Button>
                 </div>
               </CardHeader>
               <CardContent className="pt-6 p-0 md:p-6">
                  {/* Lista de Exercícios */}
                  <div className="divide-y divide-zinc-800">
                     {activeRoutine.exercises?.length > 0 ? activeRoutine.exercises.map((ex: any, idx: number) => (
                         <div key={ex.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-zinc-800/10 transition-colors group">
                             <div className="flex items-start gap-4">
                                 <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 flex items-center justify-center font-bold text-sm shrink-0 mt-0.5 group-hover:border-emerald-500/50 group-hover:text-emerald-500 transition-colors">
                                   {idx + 1}
                                 </div>
                                 <div>
                                    <p className="text-white font-semibold text-lg">{ex.name}</p>
                                    <div className="flex flex-wrap gap-4 mt-2 text-sm text-zinc-500">
                                        <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500"/> {ex.sets} séries</span>
                                        <span className="flex items-center gap-1.5"><Target className="w-3.5 h-3.5 text-blue-500"/> {ex.reps} reps</span>
                                        <span className="flex items-center gap-1.5"><Dumbbell className="w-3.5 h-3.5 text-zinc-500"/> {ex.weight}kg</span>
                                    </div>
                                 </div>
                             </div>
                             <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                               <Button 
                                 variant="ghost" 
                                 size="sm" 
                                 className="h-8 w-8 p-0 text-zinc-500 hover:text-red-500 hover:bg-red-500/10"
                                 onClick={() => handleDeleteExercise(ex.id)}
                               >
                                 <PlusCircle className="w-4 h-4 rotate-45" />
                               </Button>
                             </div>
                         </div>
                     )) : (
                       <div className="p-16 text-center">
                         <Dumbbell className="w-10 h-10 text-zinc-800 mx-auto mb-3 opacity-20" />
                         <p className="text-zinc-600 italic">Nenhum exercício adicionado.</p>
                       </div>
                     )}
                  </div>

                  {/* Formulário de Adição Rápida */}
                  {!showAddExercise ? (
                    <button 
                      onClick={() => setShowAddExercise(true)}
                      className="w-full py-4 mt-2 border-t border-dashed border-zinc-800 text-zinc-500 hover:text-emerald-500 hover:bg-emerald-500/5 transition-all text-sm font-medium flex items-center justify-center gap-2"
                    >
                      <PlusCircle className="w-4 h-4" /> Adicionar Exercício
                    </button>
                  ) : (
                    <div className="p-4 mt-4 bg-zinc-900/50 rounded-xl border border-zinc-800 flex flex-col gap-4 animate-in fade-in slide-in-from-top-2">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="col-span-2">
                          <label className="text-[10px] uppercase font-bold text-zinc-500 mb-1 block ml-1">Exercício</label>
                          <input 
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:ring-1 focus:ring-emerald-500 outline-none"
                            placeholder="Ex: Supino Reto"
                            value={newExercise.name}
                            onChange={e => setNewExercise({...newExercise, name: e.target.value})}
                          />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase font-bold text-zinc-500 mb-1 block ml-1">Séries</label>
                          <input 
                            type="number"
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:ring-1 focus:ring-emerald-500 outline-none"
                            value={newExercise.sets}
                            onChange={e => setNewExercise({...newExercise, sets: parseInt(e.target.value) || 0})}
                          />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase font-bold text-zinc-500 mb-1 block ml-1">Reps</label>
                          <input 
                            type="number"
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:ring-1 focus:ring-emerald-500 outline-none"
                            value={newExercise.reps}
                            onChange={e => setNewExercise({...newExercise, reps: parseInt(e.target.value) || 0})}
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => setShowAddExercise(false)}>Cancelar</Button>
                        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={handleAddExercise}>Salvar</Button>
                      </div>
                    </div>
                  )}
               </CardContent>
            </Card>
          ) : (
            <div className="p-20 text-center border-2 border-dashed border-zinc-800 rounded-3xl bg-zinc-900/20">
              <PlusCircle className="w-12 h-12 text-zinc-800 mx-auto mb-4" />
              <h3 className="text-white font-bold text-xl mb-1">Crie sua primeira rotina</h3>
              <p className="text-zinc-500 text-sm">Organize seus treinos por dia ou grupo muscular.</p>
            </div>
          )}
        </div>

        {/* Resumo Semanal */}
        <div className="space-y-6">
          <Card className="bg-zinc-900 border-zinc-800">
             <CardHeader>
                <CardTitle className="text-white">Resumo da Semana</CardTitle>
                <CardDescription className="text-zinc-400">Progresso dos seus treinos semanais.</CardDescription>
             </CardHeader>
             <CardContent>
                <div className="flex justify-between items-center bg-zinc-950 border border-zinc-800 rounded-lg p-3">
                   {["S", "T", "Q", "Q", "S", "S", "D"].map((day, i) => {
                      return (
                         <div key={i} className="flex flex-col items-center gap-1.5">
                            <span className="text-[10px] font-bold text-zinc-500">{day}</span>
                            <div className="w-8 h-8 rounded-full flex items-center justify-center border-2 border-zinc-800 text-zinc-700">
                               <Dumbbell className="w-4 h-4 opacity-50" />
                            </div>
                         </div>
                      );
                   })}
                </div>

                        {/* TODO: Calcular volume total da semana baseado nos exercícios realizados */}
                        <div className="mt-6 flex flex-col gap-3">
                   <div className="flex justify-between items-center p-3 rounded-md bg-zinc-950 border border-zinc-800">
                      <div className="flex items-center gap-2">
                         <Flame className="w-4 h-4 text-orange-500" />
                         <span className="text-sm font-medium text-zinc-300">Volume Total</span>
                      </div>
                      <span className="text-white font-bold">-- kg</span>
                   </div>
                </div>
             </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
