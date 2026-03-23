"use client";

import { useState } from "react";
import { Modal } from "./modal";
import { Button } from "./button";
import { Input } from "./input";
import { Loader2 } from "lucide-react";

interface TransacaoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  type: "INCOME" | "EXPENSE";
  contas: Array<{ id: string; name: string }>;
}

const categoriasDespesa = [
  "Moradia", "Assinatura", "Gasto Pessoal", "Comida", "Saúde", 
  "Trabalho", "Educação", "Utilidades", "Fitness", "Viagem"
];

const categoriasReceita = ["Salário", "Freelance", "Investimento", "Venda", "Presente", "Outros"];

export function TransacaoModal({ isOpen, onClose, onSuccess, type, contas }: TransacaoModalProps) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    accountId: "",
    amount: "",
    category: type === "EXPENSE" ? categoriasDespesa[0] : categoriasReceita[0],
    description: "",
  });

  const categorias = type === "EXPENSE" ? categoriasDespesa : categoriasReceita;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.accountId || !form.amount) return;

    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pessoal/transacoes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          accountId: form.accountId,
          amount: parseFloat(form.amount),
          type,
          category: form.category,
          description: form.description || null,
        }),
      });

      if (response.ok) {
        setForm({ accountId: "", amount: "", category: categorias[0], description: "" });
        onSuccess();
        onClose();
      }
    } catch (error) {
      console.error("Erro ao criar transação:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={type === "INCOME" ? "Nova Receita" : "Nova Despesa"}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button 
            onClick={handleSubmit} 
            disabled={loading || !form.accountId || !form.amount}
            className={type === "INCOME" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-red-600 hover:bg-red-700"}
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            {type === "INCOME" ? "Registrar Receita" : "Registrar Despesa"}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-400">Conta</label>
          <select 
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white text-sm focus:ring-1 focus:ring-blue-500 outline-none"
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
          <label className="text-sm font-medium text-zinc-400">Valor (R$)</label>
          <Input
            type="number"
            step="0.01"
            min="0"
            placeholder="0,00"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            className="bg-zinc-950 border-zinc-800 text-white"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-400">Categoria</label>
          <select 
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white text-sm focus:ring-1 focus:ring-blue-500 outline-none"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          >
            {categorias.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-400">Descrição (opcional)</label>
          <Input
            placeholder="Ex: Almoço no restaurante"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="bg-zinc-950 border-zinc-800 text-white"
          />
        </div>
      </form>
    </Modal>
  );
}
