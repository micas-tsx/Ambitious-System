"use client";

import { useState } from "react";
import { Modal } from "./modal";
import { Button } from "./button";
import { Input } from "./input";
import { Loader2 } from "lucide-react";

interface AulaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  notebookId: string;
  notebookName: string;
  lesson?: { id: string; name: string; status: string };
}

const statusOptions = [
  { value: "NOT_STARTED", label: "Não Iniciado" },
  { value: "DOING", label: "Em Andamento" },
  { value: "COMPLETED", label: "Concluído" },
  { value: "IN_REVIEW", label: "Em Revisão" },
];

export function AulaModal({ isOpen, onClose, onSuccess, notebookId, notebookName, lesson }: AulaModalProps) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: lesson?.name || "",
    status: lesson?.status || "NOT_STARTED",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    setLoading(true);
    try {
      const url = lesson 
        ? `${process.env.NEXT_PUBLIC_API_URL}/mente/aulas/${lesson.id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/mente/aulas`;
      
      const response = await fetch(url, {
        method: lesson ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          notebookId: lesson?.id ? undefined : notebookId,
          name: form.name,
          status: form.status,
        }),
      });

      if (response.ok) {
        setForm({ name: "", status: "NOT_STARTED" });
        onSuccess();
        onClose();
      }
    } catch (error) {
      console.error("Erro ao salvar aula:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={lesson ? "Editar Aula" : `Nova Aula - ${notebookName}`}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button 
            onClick={handleSubmit} 
            disabled={loading || !form.name.trim()}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            {lesson ? "Salvar" : "Criar Aula"}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-400">Nome da Aula</label>
          <Input
            placeholder="Ex: Capítulo 1 - Introdução"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="bg-zinc-950 border-zinc-800 text-white"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-400">Status</label>
          <select 
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white text-sm focus:ring-1 focus:ring-purple-500 outline-none"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
          >
            {statusOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </form>
    </Modal>
  );
}
