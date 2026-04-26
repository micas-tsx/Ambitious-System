"use client";

import { useState } from "react";
import { Modal } from "./modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, RotateCw } from "lucide-react";

interface ContaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onCreateAnother?: () => void;
}

export function ContaModal({ isOpen, onClose, onSuccess, onCreateAnother }: ContaModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const name = formData.get("name") as string;
    const balance = formData.get("balance") as string;

    if (!name) {
      setError("Informe o nome da conta");
      return;
    }

    setError("");
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
          name,
          balance: balance ? parseFloat(balance) : 0,
        }),
      });

      if (response.ok) {
        onSuccess();
        if (onCreateAnother) {
          onCreateAnother();
          (e.target as HTMLFormElement).reset();
        } else {
          onClose();
        }
      } else {
        const data = await response.json();
        setError(data.message || "Erro ao criar conta");
      }
    } catch (err) {
      setError("Erro ao criar conta");
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
            type="submit"
            form="conta-form"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            Criar
          </Button>
        </>
      }
    >
      <form id="conta-form" onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-400">Nome da Conta</label>
          <Input
            name="name"
            placeholder="Ex: Conta Corrente, Poupança"
            className="bg-zinc-950 border-zinc-800 text-white"
            autoFocus
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-400">Saldo Inicial (R$)</label>
          <Input
            name="balance"
            type="number"
            step="0.01"
            min="0"
            placeholder="0,00"
            className="bg-zinc-950 border-zinc-800 text-white"
          />
          <p className="text-xs text-zinc-500">Deixe em branco ou 0 para começar com saldo zero.</p>
        </div>
      </form>
    </Modal>
  );
}