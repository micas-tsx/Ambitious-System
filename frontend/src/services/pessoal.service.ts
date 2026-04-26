import { apiFetch } from "@/lib/api";

export const pessoalService = {
  // Finanças
  getContas: () => apiFetch("/pessoal/contas"),
  createConta: (data: { name: string; balance?: number }) => 
    apiFetch("/pessoal/contas", { method: "POST", body: JSON.stringify(data) }),
  deleteConta: (id: string) => 
    apiFetch(`/pessoal/contas/${id}`, { method: "DELETE" }),
  getTransacoes: () => apiFetch("/pessoal/transacoes"),
  deleteTransacao: (id: string) => 
    apiFetch(`/pessoal/transacoes/${id}`, { method: "DELETE" }),
  getCartoes: () => apiFetch("/pessoal/cartoes"),
  deleteCartao: (id: string) => 
    apiFetch(`/pessoal/cartoes/${id}`, { method: "DELETE" }),
  createTransacao: (data: any) => apiFetch("/pessoal/transacoes", { method: "POST", body: JSON.stringify(data) }),

  // Diário (Journal)
  getNotasDiario: () => apiFetch("/pessoal/notas"),
  createNotaDiario: (conteudo: string) => 
    apiFetch("/pessoal/notas", { method: "POST", body: JSON.stringify({ content: conteudo }) }),
  deleteNotaDiario: (id: string) => 
    apiFetch(`/pessoal/notas/${id}`, { method: "DELETE" }),

  // Tasks (Quadro Kanban)
  getTasks: () => apiFetch("/pessoal/tasks"),
  createTask: (data: { title: string; category: string; rating?: number }) => 
    apiFetch("/pessoal/tasks", { method: "POST", body: JSON.stringify(data) }),
  updateTaskStatus: (id: string, status: string) => 
    apiFetch(`/pessoal/tasks/${id}`, { method: "PATCH", body: JSON.stringify({ status }) }),
  updateTask: (id: string, data: any) => 
    apiFetch(`/pessoal/tasks/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteTask: (id: string) => 
    apiFetch(`/pessoal/tasks/${id}`, { method: "DELETE" }),
};
