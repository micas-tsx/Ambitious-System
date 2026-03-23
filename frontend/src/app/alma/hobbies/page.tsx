"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Gamepad2, Play, Pause, Headphones, Trophy, Clapperboard, MonitorPlay, Loader2, Trash2 } from "lucide-react";
import { almaService } from "@/services/alma.service";

export default function HobbiesDashboard() {
  const [hobbies, setHobbies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newHobbyName, setNewHobbyName] = useState("");
  const [newHobbyCategory, setNewHobbyCategory] = useState("Games");

  const fetchData = async () => {
    try {
      const data = await almaService.getHobbies();
      setHobbies(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Erro ao carregar hobbies:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateHobby = async () => {
    if (!newHobbyName.trim()) return;
    try {
      await almaService.createHobby(newHobbyName, newHobbyCategory);
      setNewHobbyName("");
      await fetchData();
    } catch (error) {
      console.error("Erro ao criar hobby:", error);
    }
  };

  const handleDeleteHobby = async (id: string) => {
    try {
      await almaService.deleteHobby(id);
      await fetchData();
    } catch (error) {
      console.error("Erro ao deletar hobby:", error);
    }
  };

  const getIcon = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'games': return Gamepad2;
      case 'séries':
      case 'série': return MonitorPlay;
      case 'música': return Headphones;
      case 'filmes':
      case 'filme': return Clapperboard;
      default: return Trophy;
    }
  };

  const getColor = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'games': return "text-green-500";
      case 'séries':
      case 'série': return "text-red-500";
      case 'música': return "text-yellow-500";
      case 'filmes':
      case 'filme': return "text-orange-500";
      default: return "text-blue-500";
    }
  };

  const getBg = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'games': return "bg-green-500/10";
      case 'séries':
      case 'série': return "bg-red-500/10";
      case 'música': return "bg-yellow-500/10";
      case 'filmes':
      case 'filme': return "bg-orange-500/10";
      default: return "bg-blue-500/10";
    }
  };

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
            Hobbies & Lazer
          </h1>
          <p className="text-zinc-400">
            Acompanhe seus jogos, séries, filmes e novos aprendizados.
          </p>
        </div>
        <div className="flex gap-3">
          <div className="flex gap-2">
            <input 
              className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1 text-sm text-white w-40"
              placeholder="Nome do hobby..."
              value={newHobbyName}
              onChange={(e) => setNewHobbyName(e.target.value)}
            />
            <select 
              className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1 text-sm text-white"
              value={newHobbyCategory}
              onChange={(e) => setNewHobbyCategory(e.target.value)}
            >
              <option value="Games">Games</option>
              <option value="Séries">Séries</option>
              <option value="Filmes">Filmes</option>
              <option value="Música">Música</option>
              <option value="Outros">Outros</option>
            </select>
            <Button 
               onClick={handleCreateHobby}
               className="bg-yellow-600 hover:bg-yellow-700 text-zinc-950 font-medium"
            >
              <PlusCircle className="mr-2 h-4 w-4" /> Cadastrar
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         {/* Estatísticas Rápidas */}
         <Card className="bg-zinc-900 border-zinc-800">
             <CardContent className="pt-6 flex flex-col items-center justify-center text-center">
                 <div className="w-12 h-12 bg-yellow-500/10 rounded-full flex items-center justify-center mb-4">
                     <Trophy className="w-6 h-6 text-yellow-500" />
                 </div>
                 <h2 className="text-2xl font-bold text-white mb-1">{hobbies.length}</h2>
                 <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Atividades Totais</p>
             </CardContent>
         </Card>
      </div>

      <Card className="bg-zinc-900 border-zinc-800">
         <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
               <Gamepad2 className="w-5 h-5 text-yellow-500" />
               Meus Hobbies
            </CardTitle>
            <CardDescription className="text-zinc-400">Suas atividades registradas.</CardDescription>
         </CardHeader>
         <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {hobbies.length > 0 ? hobbies.map((hobby, i) => {
                  const Icon = getIcon(hobby.category);
                  const color = getColor(hobby.category);
                  const bg = getBg(hobby.category);
                  
                  return (
                    <div key={hobby.id} className="flex flex-col sm:flex-row gap-4 p-4 rounded-xl border border-zinc-800/50 hover:bg-zinc-800/30 transition-colors group relative">
                        <div className={`w-12 h-12 rounded-lg ${bg} flex items-center justify-center shrink-0`}>
                            <Icon className={`w-6 h-6 ${color}`} />
                        </div>
                        <div className="flex-1 space-y-3">
                             {/* TODO: Adicionar opção de editar hobby */}
                             <div className="flex justify-between items-start">
                                <div>
                                   <h3 className="text-white font-medium">{hobby.name}</h3>
                                   <p className="text-xs text-zinc-500">{hobby.category}</p>
                                </div>
                                <Button 
                                   size="icon" 
                                   variant="ghost" 
                                   onClick={() => handleDeleteHobby(hobby.id)}
                                   className="h-8 w-8 text-zinc-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                   <Trash2 className="w-4 h-4" />
                                </Button>
                             </div>
                        </div>
                    </div>
                  );
               }) : (
                 <p className="p-12 text-center text-zinc-600 italic col-span-2">Nenhum hobby cadastrado ainda.</p>
               )}
            </div>
         </CardContent>
      </Card>
    </div>
  );
}
