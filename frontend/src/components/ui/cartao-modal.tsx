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
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const accountId = formData.get("accountId") as string;
    const name = formData.get("name") as string;
    const limit = formData.get("limit") as string;
    const invoiceDate = formData.get("invoiceDate") as string;

    if (!accountId || !name || !limit) {
      setError("Preencha todos os campos");
      return;
    }

    setError("");
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
          accountId,
          name,
          limit: parseFloat(limit),
          invoiceDate: parseInt(invoiceDate),
        }),
      });

      if (response.ok) {
        onSuccess();
        onClose();
      } else {
        const data = await response.json();
        setError(data.message || "Erro ao criar cartão");
      }
    } catch (err) {
      setError("Erro ao criar cartão");
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
            type="submit"
            form="cartao-form"
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            Criar
          </Button>
        </>
      }
    >
      <form id="cartao-form" onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-400">Conta Vinculada</label>
          <select 
            name="accountId"
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
            required
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
            name="name"
            placeholder="Ex: Nubank, Itaú Gold"
            className="bg-zinc-950 border-zinc-800 text-white"
            autoFocus
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-400">Limite Total (R$)</label>
          <Input
            name="limit"
            type="number"
            step="0.01"
            min="0"
            placeholder="5.000,00"
            className="bg-zinc-950 border-zinc-800 text-white"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-400">Dia do Vencimento</label>
          <select 
            name="invoiceDate"
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
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