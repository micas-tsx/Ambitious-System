"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, FileText, Loader2, Trash2, BookOpen } from "lucide-react";
import { pessoalService } from "@/services/pessoal.service";
import { Modal } from "@/components/ui/modal";

export default function DiarioDashboard() {
  const [notas, setNotas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newNoteContent, setNewNoteContent] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [notaToDelete, setNotaToDelete] = useState<any>(null);

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

  const handleDeleteNota = async () => {
    if (!notaToDelete) return;
    try {
      await pessoalService.deleteNotaDiario(notaToDelete.id);
      setNotaToDelete(null);
      setShowDeleteModal(false);
      await fetchData();
    } catch (error) {
      console.error("Erro ao deletar nota:", error);
    }
  };

  const openDeleteModal = (nota: any) => {
    setNotaToDelete(nota);
    setShowDeleteModal(true);
  };

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-1">
            Diário
          </h1>
          <p className="text-zinc-400">
            Registre seus pensamentos e reflita sobre seu dia.
          </p>
        </div>
      </div>

      {/* Entrada do Diário */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-500" />
            Novo Registro
          </CardTitle>
          <CardDescription className="text-zinc-400">
            Escreva livremente sobre seu dia. Suas conquistas, aprendizados e reflexões.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <textarea 
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-zinc-300 min-h-[180px] focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-zinc-600 resize-y font-mono text-sm"
            placeholder="Hoje eu estava refletindo sobre..."
            value={newNoteContent}
            onChange={(e) => setNewNoteContent(e.target.value)}
          />
          <div className="flex justify-end mt-4">
            <Button 
              onClick={handleSaveNote}
              disabled={savingNote || !newNoteContent.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white border-0"
            >
              {savingNote ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <FileText className="w-4 h-4 mr-2" />}
              Salvar Registro
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Histórico */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-zinc-500" />
          Registros Anteriores
          <span className="text-zinc-500 text-sm font-normal">({notas.length})</span>
        </h2>
        
        {notas.length > 0 ? (
          <div className="space-y-4">
            {notas.map((nota) => (
              <Card key={nota.id} className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-colors group">
                <CardContent className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-blue-400">
                        {new Date(nota.date).toLocaleDateString('pt-BR', { 
                          weekday: 'long', 
                          day: 'numeric', 
                          month: 'long', 
                          year: 'numeric' 
                        })}
                      </span>
                    </div>
                    <button 
                      onClick={() => openDeleteModal(nota)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-zinc-600 hover:text-red-500 rounded transition-all"
                      title="Excluir registro"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-zinc-400 text-sm whitespace-pre-wrap leading-relaxed">
                    {nota.content}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <FileText className="w-12 h-12 text-zinc-700 mb-4" />
            <p className="text-zinc-500 text-sm">Nenhum registro encontrado.</p>
            <p className="text-zinc-600 text-xs mt-1">Comece a escrever acima para criar seu primeiro registro.</p>
          </div>
        )}
      </div>

      {/* Modal de Confirmação de Exclusão */}
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Excluir Registro">
        <div className="space-y-4">
          <p className="text-zinc-300">
            Tem certeza que deseja excluir este registro de <strong className="text-white">{notaToDelete?.date ? new Date(notaToDelete.date).toLocaleDateString('pt-BR') : ''}</strong>?
          </p>
          <p className="text-zinc-500 text-sm">Esta ação não pode ser desfeita.</p>
          <div className="flex gap-2 justify-end pt-4">
            <Button 
              variant="ghost" 
              onClick={() => setShowDeleteModal(false)}
              className="text-zinc-400 hover:text-white"
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleDeleteNota}
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