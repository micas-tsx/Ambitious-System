import { apiFetch } from "@/lib/api";

export const pessoalService = {
  // Finanças
  getContas: () => apiFetch("/pessoal/contas"),
  getTransacoes: () => apiFetch("/pessoal/transacoes"),
  getCartoes: () => apiFetch("/pessoal/cartoes"),
  createTransacao: (data: any) => apiFetch("/pessoal/transacoes", { method: "POST", body: JSON.stringify(data) }),

  // Diário
  getNotasDiario: () => apiFetch("/pessoal/notas"),
  createNotaDiario: (conteudo: string) => 
    apiFetch("/pessoal/notas", { method: "POST", body: JSON.stringify({ content: conteudo }) }),
  createTask: (data: any) => apiFetch("/pessoal/tasks", { method: "POST", body: JSON.stringify(data) }),

  // Metas
  getMetas: () => apiFetch("/pessoal/metas"),
  createMeta: (titulo: string, status: string = "TODO") => 
    apiFetch("/pessoal/metas", { method: "POST", body: JSON.stringify({ title: titulo, status }) }),
  updateMetaStatus: (id: string, status: string) => 
    apiFetch(`/pessoal/metas/${id}`, { method: "PATCH", body: JSON.stringify({ status }) }),
};
