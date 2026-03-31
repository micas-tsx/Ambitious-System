"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, Lightbulb, Search, PenTool, Hash, ArrowRight, Loader2, Trash2 } from "lucide-react";
import { almaService } from "@/services/alma.service";

export default function BrainstormDashboard() {
  const [ideias, setIdeias] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("Todas");

  const fetchData = async () => {
    try {
      const data = await almaService.getBrainstorm();
      setIdeias(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Erro ao carregar brainstorm:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;
    try {
      await almaService.createBrainstorm({ title: newTitle, content: newContent, category: newCategory });
      setNewTitle("");
      setNewContent("");
      setNewCategory("");
      await fetchData();
    } catch (error) {
      console.error("Erro ao salvar ideia:", error);
    }
  };

  const handleDeleteNote = async (id: string) => {
    try {
      await almaService.deleteBrainstorm(id);
      await fetchData();
    } catch (error) {
      console.error("Erro ao deletar ideia:", error);
    }
  };

  const filteredIdeias = ideias.filter(ideia => {
    const matchesSearch = ideia.title.toLowerCase().includes(search.toLowerCase()) || 
                          ideia.content.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = activeFilter === "Todas" || ideia.category === activeFilter;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-yellow-500" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-1">
            Brainstorming
          </h1>
          <p className="text-zinc-400">
            Sua caixa de areia para ideias, projetos futuros e insights aleatórios.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Painel Esquerdo: Área de Captura */}
        <div className="lg:col-span-1 space-y-6">
           <Card className="bg-yellow-500/5 border-yellow-500/20 shadow-lg shadow-yellow-900/5">
              <CardHeader>
                 <CardTitle className="text-yellow-500 flex items-center gap-2">
                    <PenTool className="w-5 h-5" />
                    Nova Ideia
                 </CardTitle>
                 <CardDescription className="text-zinc-400">Tirou algo da cabeça? Anote rápido antes que suma.</CardDescription>
              </CardHeader>
              <CardContent>
                 <form className="space-y-4" onSubmit={handleCreateNote}>
                    <div className="space-y-2">
                       <Input 
                         placeholder="Título ou Resumo Rápido..." 
                         className="bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-600 focus-visible:ring-yellow-500"
                         value={newTitle}
                         onChange={(e) => setNewTitle(e.target.value)}
                       />
                    </div>
                    <div className="space-y-2">
                       <Textarea 
                         placeholder="Descreva sua ideia com mais detalhes..." 
                         className="bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-600 focus-visible:ring-yellow-500 min-h-[120px] resize-none"
                         value={newContent}
                         onChange={(e) => setNewContent(e.target.value)}
                       />
                    </div>
                    <div className="space-y-2">
                       <div className="flex items-center gap-2 bg-zinc-950 border border-zinc-800 p-2 rounded-md focus-within:ring-1 focus-within:ring-yellow-500">
                          <Hash className="w-4 h-4 text-zinc-500" />
                          <input 
                              type="text" 
                              placeholder="Categoria (ex: Projetos, Estudos)..."
                              className="bg-transparent text-sm text-white w-full outline-none placeholder:text-zinc-600"
                              value={newCategory}
                              onChange={(e) => setNewCategory(e.target.value)}
                          />
                       </div>
                    </div>
                    <Button type="submit" className="w-full bg-yellow-600 hover:bg-yellow-700 text-zinc-950 font-bold border-0 shadow-lg mt-2">
                       <PlusCircle className="mr-2 h-4 w-4" /> Salvar Ideia
                    </Button>
                 </form>
              </CardContent>
           </Card>
        </div>

        {/* Painel Direito: Cofre de Ideias */}
        <div className="lg:col-span-2 space-y-6">
           <div className="flex items-center gap-2 bg-zinc-900 p-1.5 rounded-lg w-fit border border-zinc-800 overflow-x-auto max-w-full">
               {["Todas", "Projetos", "Lifestyle", "Estudos"].map((filter, i) => (
                  <button 
                    key={filter} 
                    onClick={() => setActiveFilter(filter)}
                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors shrink-0 ${activeFilter === filter ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-400 hover:text-white"}`}
                  >
                     {filter}
                  </button>
               ))}
           </div>

           <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <Input 
                 placeholder="Pesquisar no cofre de ideias..." 
                 className="pl-9 bg-zinc-950 border-zinc-800 text-white md:max-w-md focus-visible:ring-yellow-500"
                 value={search}
                 onChange={(e) => setSearch(e.target.value)}
              />
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredIdeias.length > 0 ? filteredIdeias.map((ideia, i) => (
                 <Card key={ideia.id} className="bg-zinc-900 border-zinc-800 hover:border-yellow-500/50 transition-colors group relative overflow-hidden">
                    <CardHeader className="p-4 pb-2">
                       <div className="flex justify-between items-start">
                          <div className="flex flex-wrap gap-1.5 mb-2">
                             {ideia.category && (
                                <span className="text-[9px] font-bold uppercase tracking-wider text-yellow-500 bg-yellow-500/10 px-1.5 py-0.5 rounded">
                                   #{ideia.category}
                                </span>
                             )}
                          </div>
                          <span className="text-[10px] text-zinc-600">{new Date(ideia.createdAt).toLocaleDateString()}</span>
                       </div>
                       <CardTitle className="text-white text-base leading-tight group-hover:text-yellow-400 transition-colors">
                          {ideia.title}
                       </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                       <p className="text-xs text-zinc-500 line-clamp-3 mt-2">{ideia.content}</p>
                        {/* TODO: Implementar modal de edição da nota */}
                        <div className="flex justify-between mt-4">
                           <Button 
                             size="sm" 
                             variant="ghost" 
                             onClick={() => handleDeleteNote(ideia.id)}
                             className="h-6 text-xs text-zinc-500 hover:text-red-500 p-0 hover:bg-transparent"
                           >
                              <Trash2 className="w-3 h-3 mr-1" /> Excluir
                           </Button>
                           <Button size="sm" variant="ghost" className="h-6 text-xs text-zinc-500 group-hover:text-white transition-colors p-0 hover:bg-transparent">
                              Expandir Ideia <ArrowRight className="w-3 h-3 ml-1" />
                           </Button>
                        </div>
                    </CardContent>
                 </Card>
              )) : (
                <p className="p-12 text-center text-zinc-600 italic col-span-2">Nenhuma ideia encontrada.</p>
              )}
           </div>
        </div>

      </div>
    </div>
  );
}
