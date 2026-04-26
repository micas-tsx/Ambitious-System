"use client";

import { useState } from "react";
import { Modal } from "./modal";
import { Button } from "./button";
import { Input } from "./input";
import { Loader2, CreditCard, Wallet } from "lucide-react";

interface TransacaoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  type: "INCOME" | "EXPENSE";
  contas: Array<{ id: string; name: string }>;
  cartoes?: Array<{ id: string; name: string }>;
}

const categoriasDespesa = [
  "Moradia", "Assinatura", "Gasto Pessoal", "Comida", "Saúde", 
  "Trabalho", "Educação", "Utilidades", "Fitness", "Viagem"
];

const categoriasReceita = ["Salário", "Freelance", "Investimento", "Venda", "Presente", "Outros"];

export function TransacaoModal({ isOpen, onClose, onSuccess, type, contas, cartoes = [] }: TransacaoModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"account" | "card">("account");
  const [form, setForm] = useState({
    accountId: "",
    cardId: "",
    amount: "",
    category: type === "EXPENSE" ? categoriasDespesa[0] : categoriasReceita[0],
    description: "",
  });

  const categorias = type === "EXPENSE" ? categoriasDespesa : categoriasReceita;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.amount || parseFloat(form.amount) <= 0) {
      setError("Informe um valor válido");
      return;
    }

    if (!form.accountId) {
      setError("Selecione uma conta");
      return;
    }

    if (type === "EXPENSE" && paymentMethod === "card" && !form.cardId) {
      setError("Selecione um cartão");
      return;
    }

    const token = localStorage.getItem("token");
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pessoal/transacoes`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          accountId: form.accountId,
          ...(paymentMethod === "card" && form.cardId ? { cardId: form.cardId } : {}),
          amount: parseFloat(form.amount),
          type,
          category: form.category,
          description: form.description || null,
        }),
      });

      if (response.ok) {
        setForm({ accountId: "", cardId: "", amount: "", category: categorias[0], description: "" });
        setPaymentMethod("account");
        onSuccess();
        onClose();
      } else {
        const data = await response.json();
        setError(data.message || "Erro ao criar transação");
      }
    } catch (err) {
      setError("Erro ao criar transação");
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
            disabled={loading || !form.amount}
            className={type === "INCOME" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-red-600 hover:bg-red-700"}
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            {type === "INCOME" ? "Registrar Receita" : "Registrar Despesa"}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            {error}
          </div>
        )}

        {type === "EXPENSE" && cartoes.length > 0 && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-400">Forma de Pagamento</label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => { setPaymentMethod("account"); setForm(f => ({ ...f, cardId: "" })); }}
                className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border transition-colors ${
                  paymentMethod === "account" 
                    ? "bg-blue-600/20 border-blue-600/50 text-blue-400" 
                    : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                }`}
              >
                <Wallet className="w-4 h-4" />
                <span className="text-sm font-medium">Débito</span>
              </button>
              <button
                type="button"
                onClick={() => { setPaymentMethod("card"); setForm(f => ({ ...f, accountId: contas[0]?.id || "" })); }}
                className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border transition-colors ${
                  paymentMethod === "card" 
                    ? "bg-indigo-600/20 border-indigo-600/50 text-indigo-400" 
                    : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span className="text-sm font-medium">Crédito</span>
              </button>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-400">
            {type === "INCOME" ? "Conta" : paymentMethod === "card" ? "Conta Vinculada" : "Conta"}
          </label>
          <select 
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white text-sm focus:ring-1 focus:ring-blue-500 outline-none"
            value={form.accountId}
            onChange={(e) => setForm({ ...form, accountId: e.target.value })}
            required={paymentMethod === "account"}
            disabled={paymentMethod === "card"}
          >
            <option value="">Selecione uma conta...</option>
            {contas.map(conta => (
              <option key={conta.id} value={conta.id}>{conta.name}</option>
            ))}
          </select>
        </div>

        {type === "EXPENSE" && paymentMethod === "card" && cartoes.length > 0 && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-400">Cartão de Crédito</label>
            <select 
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
              value={form.cardId}
              onChange={(e) => setForm({ ...form, cardId: e.target.value })}
              required
            >
              <option value="">Selecione um cartão...</option>
              {cartoes.map(cartao => (
                <option key={cartao.id} value={cartao.id}>{cartao.name}</option>
              ))}
            </select>
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-400">Valor (R$)</label>
          <Input
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0,00"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit(e)}
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
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit(e)}
            className="bg-zinc-950 border-zinc-800 text-white"
          />
        </div>
      </form>
    </Modal>
  );
}