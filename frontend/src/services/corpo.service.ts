import { apiFetch } from "@/lib/api";

export const corpoService = {
  // Avaliações
  getAvaliacoes: () => apiFetch("/corpo/avaliacoes"),
  createAvaliacao: (data: any) => 
    apiFetch("/corpo/avaliacoes", { method: "POST", body: JSON.stringify(data) }),
  deleteAvaliacao: (id: string) => 
    apiFetch(`/corpo/avaliacoes/${id}`, { method: "DELETE" }),

  // Treinos
  getTreinos: () => apiFetch("/corpo/treinos"),
  createTreino: (data: any) => 
    apiFetch("/corpo/treinos", { method: "POST", body: JSON.stringify(data) }),
  updateTreino: (id: string, data: any) => 
    apiFetch(`/corpo/treinos/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteTreino: (id: string) => 
    apiFetch(`/corpo/treinos/${id}`, { method: "DELETE" }),

  // Exercícios
  addExercicio: (treinoId: string, data: any) => 
    apiFetch(`/corpo/treinos/${treinoId}/exercicios`, { method: "POST", body: JSON.stringify(data) }),
  updateExercicio: (id: string, data: any) => 
    apiFetch(`/corpo/exercicios/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteExercicio: (id: string) => 
    apiFetch(`/corpo/exercicios/${id}`, { method: "DELETE" }),

  // Dieta
  getRefeicoes: () => apiFetch("/corpo/refeicoes"),
  createRefeicao: (data: any) => 
    apiFetch("/corpo/refeicoes", { method: "POST", body: JSON.stringify(data) }),
  deleteRefeicao: (id: string) => 
    apiFetch(`/corpo/refeicoes/${id}`, { method: "DELETE" }),
  
  // Itens de Refeição
  addItemRefeicao: (refeicaoId: string, data: any) => 
    apiFetch(`/corpo/refeicoes/${refeicaoId}/itens`, { method: "POST", body: JSON.stringify(data) }),
  updateItemRefeicao: (id: string, data: any) => 
    apiFetch(`/corpo/refeicoes/itens/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteItemRefeicao: (id: string) => 
    apiFetch(`/corpo/refeicoes/itens/${id}`, { method: "DELETE" }),

  // Biblioteca de Alimentos
  getAlimentos: () => apiFetch("/corpo/alimentos"),
  createAlimento: (data: any) => 
    apiFetch("/corpo/alimentos", { method: "POST", body: JSON.stringify(data) }),

  // Hidratação
  getHidratação: () => apiFetch("/corpo/hidratacao"),
  addHidratação: (amount: number) => 
    apiFetch("/corpo/hidratacao", { method: "POST", body: JSON.stringify({ amount }) }),
};
