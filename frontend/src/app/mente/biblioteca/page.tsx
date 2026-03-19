"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Book, Search, PlusCircle, MoreVertical, Library as LibraryIcon, Star, Loader2 } from "lucide-react";
import { menteService } from "@/services/mente.service";

export default function BibliotecaDashboard() {
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [newBookTitle, setNewBookTitle] = useState("");
  const [newBookAuthor, setNewBookAuthor] = useState("");

  const fetchData = async () => {
    try {
      const data = await menteService.getLivros();
      setBooks(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Erro ao carregar livros:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateBook = async () => {
    if (!newBookTitle.trim()) return;
    try {
      await menteService.createLivro({
        title: newBookTitle,
        author: newBookAuthor,
        status: "Lendo"
      });
      setNewBookTitle("");
      setNewBookAuthor("");
      await fetchData();
    } catch (error) {
      console.error("Erro ao cadastrar livro:", error);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await menteService.updateLivroStatus(id, status);
      await fetchData();
    } catch (error) {
      console.error("Erro ao atualizar status do livro:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
       case "Lendo": case "READING": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
       case "Finalizado": case "FINISHED": return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
       case "Próxima Leitura": return "bg-amber-500/20 text-amber-400 border-amber-500/30";
       default: return "bg-zinc-800 text-zinc-400 border-zinc-700";
    }
  }

  const filteredBooks = books.filter(b => 
    b.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    b.author?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            Biblioteca
          </h1>
          <p className="text-zinc-400">
            Seu acervo de leitura: gerencie, avalie e organize seus livros.
          </p>
        </div>
        <div className="flex gap-3">
          <div className="flex flex-col md:flex-row gap-2">
            <input 
              className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1 text-sm text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
              placeholder="Título..."
              value={newBookTitle}
              onChange={(e) => setNewBookTitle(e.target.value)}
            />
            <input 
              className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1 text-sm text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
              placeholder="Autor..."
              value={newBookAuthor}
              onChange={(e) => setNewBookAuthor(e.target.value)}
            />
            <Button 
               onClick={handleCreateBook}
               className="bg-purple-600 hover:bg-purple-700 text-white border-0 shadow-lg"
            >
              <PlusCircle className="mr-2 h-4 w-4" /> Cadastrar Livro
            </Button>
          </div>
        </div>
      </div>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-800/50">
          <div className="flex items-center gap-2">
             <LibraryIcon className="w-5 h-5 text-purple-500" />
             <CardTitle className="text-white text-lg">Meu Acervo ({filteredBooks.length} Livros)</CardTitle>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
             <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <Input 
                   placeholder="Buscar título ou autor..." 
                   className="pl-9 bg-zinc-950 border-zinc-800 text-zinc-300"
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                />
             </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredBooks.map((book, i) => (
                 <div key={i} className="group relative flex flex-col bg-zinc-950 rounded-xl border border-zinc-800 overflow-hidden hover:border-purple-500/50 transition-colors">
                    
                    {/* Botão Flutuante de Opções */}
                    <div className="absolute top-2 right-2 flex gap-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleUpdateStatus(book.id, book.status === 'FINISHED' ? 'READING' : 'FINISHED')}
                          className="p-1.5 rounded-md bg-black/50 text-white hover:bg-black/80"
                          title={book.status === 'FINISHED' ? "Marcar como Lendo" : "Finalizar Leitura"}
                        >
                            <MoreVertical className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Placeholder de Capa */}
                    <div className="h-48 w-full relative overflow-hidden bg-zinc-900 flex items-center justify-center">
                       <Book className="w-12 h-12 text-zinc-800" />
                       <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 to-transparent" />
                       
                       <div className="absolute bottom-3 left-3">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded border backdrop-blur-md ${getStatusColor(book.status)}`}>
                             {book.status === 'READING' ? 'Lendo' : book.status === 'FINISHED' ? 'Finalizado' : 'Pendente'}
                          </span>
                       </div>
                    </div>

                    {/* Info */}
                    <div className="p-4 flex-1 flex flex-col">
                       <h3 className="text-white font-semibold line-clamp-1" title={book.title}>{book.title}</h3>
                       <p className="text-zinc-500 text-sm mb-4 line-clamp-1">{book.author || "Autor desconhecido"}</p>
                       
                       <div className="mt-auto">
                            {book.status === "FINISHED" && (
                               <div className="flex gap-1">
                                  {Array.from({ length: 5 }).map((_, idx) => (
                                     <Star key={idx} className={`w-3.5 h-3.5 fill-amber-500 text-amber-500`} />
                                  ))}
                               </div>
                            )}
                       </div>
                    </div>
                 </div>
              ))}
              {filteredBooks.length === 0 && (
                <div className="col-span-4 text-center py-12 text-zinc-600 italic">Nenhum livro cadastrado.</div>
              )}
           </div>
        </CardContent>
      </Card>
      
    </div>
  );
}
