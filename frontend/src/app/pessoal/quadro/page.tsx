"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Loader2 } from "lucide-react";
import { pessoalService } from "@/services/pessoal.service";

export default function QuadroMetas() {
  const [metas, setMetas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMetaTitle, setNewMetaTitle] = useState("");

  const columns = [
    { title: "A Fazer (To Do)", id: "todo", color: "text-zinc-400", dbStatus: "TODO" },
    { title: "Em Progresso (Doing)", id: "doing", color: "text-blue-400", dbStatus: "DOING" },
    { title: "Concluído (Done)", id: "done", color: "text-emerald-400", dbStatus: "DONE" },
  ];

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

      <div className="flex-1 overflow-x-auto">
        <div className="flex gap-6 h-full min-w-max pb-4">
          
          {columns.map(col => {
            const columnMetas = metas.filter(m => m.status === col.dbStatus);
            return (
              <div key={col.id} className="w-80 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h3 className={`font-semibold ${col.color}`}>{col.title} <span className="text-zinc-600 text-sm ml-2">{columnMetas.length}</span></h3>
                </div>
                
                <div className="flex-1 bg-zinc-900/50 rounded-xl p-3 border border-zinc-800/50 flex flex-col gap-3 min-h-[300px]">
                  {columnMetas.map((meta) => (
                    <Card key={meta.id} className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-colors group">
                      <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-sm font-medium text-white">{meta.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-2">
                        <div className="flex justify-between items-center gap-2 mt-2">
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {columns.filter(c => c.dbStatus !== meta.status).map(targetCol => (
                              <button
                                key={targetCol.id}
                                onClick={() => handleUpdateStatus(meta.id, targetCol.dbStatus)}
                                className={`text-[10px] px-1.5 py-0.5 rounded border border-zinc-700 hover:bg-zinc-800 ${targetCol.color}`}
                              >
                                Mover para {targetCol.id}
                              </button>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {columnMetas.length === 0 && (
                    <div className="flex-1 flex items-center justify-center border-2 border-dashed border-zinc-800/50 rounded-lg">
                      <p className="text-zinc-700 text-xs italic">Vazio</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

        </div>
      </div>
    </div>
  );
}
