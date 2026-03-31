"use client";

import { useState } from "react";
import { Modal } from "./modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

interface ContaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ContaModal({ isOpen, onClose, onSuccess }: ContaModalProps) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    balance: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) return;

    const token = localStorage.getItem("token");
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pessoal/contas`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          name: form.name,
          balance: form.balance ? parseFloat(form.balance) : 0,
        }),
      });

      if (response.ok) {
        setForm({ name: "", balance: "" });
        onSuccess();
        onClose();
      }
    } catch (error) {
      console.error("Erro ao criar conta:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Nova Conta Bancária"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button 
            onClick={handleSubmit} 
            disabled={loading || !form.name}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            Criar Conta
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-400">Nome da Conta</label>
          <Input
            placeholder="Ex: Conta Corrente, Poupança"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="bg-zinc-950 border-zinc-800 text-white"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-400">Saldo Inicial (R$)</label>
          <Input
            type="number"
            step="0.01"
            min="0"
            placeholder="0,00"
            value={form.balance}
            onChange={(e) => setForm({ ...form, balance: e.target.value })}
            className="bg-zinc-950 border-zinc-800 text-white"
          />
          <p className="text-xs text-zinc-500">Deixe em branco ou 0 para começar com saldo zero.</p>
        </div>
      </form>
    </Modal>
  );
}
