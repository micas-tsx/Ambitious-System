"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, Search, BookOpen, Clock, CheckCircle2, Circle, Loader2 } from "lucide-react";
import { menteService } from "@/services/mente.service";

export default function EstudosDashboard() {
  const [cadernos, setCadernos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newNotebookTitle, setNewNotebookTitle] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchData = async () => {
    try {
      const data = await menteService.getCadernos();
      setCadernos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Erro ao carregar cadernos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateNotebook = async () => {
    if (!newNotebookTitle.trim()) return;
    try {
      await menteService.createCaderno(newNotebookTitle);
      setNewNotebookTitle("");
      await fetchData();
    } catch (error) {
      console.error("Erro ao criar caderno:", error);
    }
  };

  const filteredCadernos = cadernos.filter(c => 
    c.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calcula lições para revisar (hoje ou atrasado)
  const allLessons = cadernos.flatMap(c => c.lessons.map((l: any) => ({ ...l, notebookTitle: c.title })));
  const reviewQueue = allLessons.filter(l => l.nextReview && new Date(l.nextReview) <= new Date());

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-1">
            Estudos e Revisões
          </h1>
          <p className="text-zinc-400">
            Gerencie seus cadernos, aulas e fluxo de repetição espaçada.
          </p>
        </div>
        <div className="flex gap-3">
          <div className="flex gap-2">
            <input 
              className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1 text-sm text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
              placeholder="Novo título..."
              value={newNotebookTitle}
              onChange={(e) => setNewNotebookTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateNotebook()}
            />
            <Button 
               onClick={handleCreateNotebook}
               className="bg-purple-600 hover:bg-purple-700 text-white border-0 shadow-lg"
            >
              <PlusCircle className="mr-2 h-4 w-4" /> Novo Caderno
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Painel Central: Cadernos e Resumo */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-2 mb-2">
             <Search className="w-5 h-5 text-zinc-500" />
             <Input 
                 placeholder="Buscar cadernos..." 
                 className="bg-zinc-900 border-zinc-800 text-zinc-300 w-full md:max-w-xs"
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
             />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredCadernos.length > 0 ? filteredCadernos.map((caderno) => {
              const totalLessons = caderno.lessons?.length || 0;
              const completedLessons = caderno.lessons?.filter((l: any) => l.status === "COMPLETED").length || 0;
              const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

              return (
                <Card key={caderno.id} className="bg-zinc-900 border-zinc-800 hover:border-purple-500/50 transition-colors cursor-pointer group">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                       <CardTitle className="text-white text-lg group-hover:text-purple-400 transition-colors">{caderno.title}</CardTitle>
                       <BookOpen className="w-5 h-5 text-zinc-600 group-hover:text-purple-500 transition-colors" />
                    </div>
                    <CardDescription className="text-zinc-500">{totalLessons} Aulas</CardDescription>
                  </CardHeader>
                  <CardContent>
                     <div className="space-y-2 mt-2">
                        <div className="flex justify-between text-xs text-zinc-400">
                           <span>Progresso</span>
                           <span className="text-purple-500 font-medium">{progress}%</span>
                        </div>
                        <div className="w-full bg-zinc-800 rounded-full h-1.5">
                          <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: `${progress}%` }}></div>
                        </div>
                     </div>
                  </CardContent>
                </Card>
              );
            }) : (
              <p className="text-zinc-600 text-sm italic col-span-2 text-center py-8">Nenhum caderno encontrado.</p>
            )}
          </div>

          {/* Fila de Estudos Simples */}
          <h3 className="text-lg font-semibold text-white mt-8 mb-4">Aulas Recentes</h3>
          <Card className="bg-zinc-900 border-zinc-800">
             <CardContent className="p-0">
                <div className="divide-y divide-zinc-800">
                   {allLessons.slice(0, 5).map((item, i) => (
                      <div key={i} className="p-4 flex items-center justify-between hover:bg-zinc-800/30 transition-colors">
                          <div className="flex items-center gap-4">
                             <Circle className={`w-5 h-5 ${item.status === 'COMPLETED' ? 'text-emerald-500 fill-emerald-500/20' : 'text-zinc-600'} cursor-pointer transition-colors`} />
                             <div>
                                <p className="text-white font-medium text-sm">{item.name}</p>
                                <p className="text-zinc-500 text-xs mt-0.5">{item.notebookTitle}</p>
                             </div>
                          </div>
                      </div>
                   ))}
                   {allLessons.length === 0 && (
                     <div className="p-8 text-center text-zinc-600 text-sm">Sem aulas cadastradas ainda.</div>
                   )}
                </div>
             </CardContent>
          </Card>
        </div>

        {/* Painel Lateral: Revisões Espaçadas */}
        <div className="space-y-6">
          <Card className="bg-purple-900/10 border-purple-500/20 shadow-lg shadow-purple-900/5 h-full relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl -mr-10 -mt-10" />
            <CardHeader className="relative z-10">
              <CardTitle className="text-purple-400 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                Fila de Revisão
              </CardTitle>
              <CardDescription className="text-zinc-400">Spaced Repetition: aulas prontas para rever.</CardDescription>
            </CardHeader>
            <CardContent className="relative z-10">
               <div className="space-y-3 mt-4">
                  {reviewQueue.length > 0 ? reviewQueue.map((rev, i) => (
                     <div key={i} className={`p-3 rounded-lg border border-purple-500/30 bg-purple-500/5 transition-all cursor-pointer hover:border-purple-500`}>
                        <div className="flex justify-between items-start mb-2">
                           <span className={`text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-sm bg-purple-500/20 text-purple-400`}>
                              Revisar agora
                           </span>
                           <span className="text-xs text-zinc-500">{rev.notebookTitle}</span>
                        </div>
                        <p className="text-sm font-medium text-white">{rev.name}</p>
                     </div>
                  )) : (
                    <p className="text-zinc-600 text-xs text-center py-6">Tudo em dia por aqui!</p>
                  )}
               </div>
               <Button className="w-full mt-6 bg-purple-600 hover:bg-purple-700 text-white" disabled={reviewQueue.length === 0}>
                 Iniciar Sessão de Revisão
               </Button>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
