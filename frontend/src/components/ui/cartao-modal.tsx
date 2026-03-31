"use client";

import { useState } from "react";
import { Modal } from "./modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

interface CartaoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  contas: Array<{ id: string; name: string }>;
}

export function CartaoModal({ isOpen, onClose, onSuccess, contas }: CartaoModalProps) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    accountId: "",
    name: "",
    limit: "",
    invoiceDate: "10",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.accountId || !form.name || !form.limit) return;

    const token = localStorage.getItem("token");
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pessoal/cartoes`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          accountId: form.accountId,
          name: form.name,
          limit: parseFloat(form.limit),
          invoiceDate: parseInt(form.invoiceDate),
        }),
      });

      if (response.ok) {
        setForm({ accountId: "", name: "", limit: "", invoiceDate: "10" });
        onSuccess();
        onClose();
      }
    } catch (error) {
      console.error("Erro ao criar cartão:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Novo Cartão de Crédito"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button 
            onClick={handleSubmit} 
            disabled={loading || !form.accountId || !form.name || !form.limit}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            Criar Cartão
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-400">Conta Vinculada</label>
          <select 
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
            value={form.accountId}
            onChange={(e) => setForm({ ...form, accountId: e.target.value })}
          >
            <option value="">Selecione uma conta...</option>
            {contas.map(conta => (
              <option key={conta.id} value={conta.id}>{conta.name}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-400">Nome do Cartão</label>
          <Input
            placeholder="Ex: Nubank, Itaú Gold"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="bg-zinc-950 border-zinc-800 text-white"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-400">Limite Total (R$)</label>
          <Input
            type="number"
            step="0.01"
            min="0"
            placeholder="5.000,00"
            value={form.limit}
            onChange={(e) => setForm({ ...form, limit: e.target.value })}
            className="bg-zinc-950 border-zinc-800 text-white"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-400">Dia do Vencimento</label>
          <select 
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
            value={form.invoiceDate}
            onChange={(e) => setForm({ ...form, invoiceDate: e.target.value })}
          >
            {Array.from({ length: 28 }, (_, i) => i + 1).map(day => (
              <option key={day} value={day}>{day}</option>
            ))}
          </select>
        </div>
      </form>
    </Modal>
  );
}
