import { apiFetch } from "@/lib/api";

export const menteService = {
  // Cadernos e Aulas
  getCadernos: () => apiFetch("/mente/cadernos"),
  createCaderno: (title: string) => 
    apiFetch("/mente/cadernos", { method: "POST", body: JSON.stringify({ title }) }),
  deleteCaderno: (id: string) => apiFetch(`/mente/cadernos/${id}`, { method: "DELETE" }),
  getAulas: () => apiFetch(`/mente/cadernos`), // O backend já traz aulas no include de cadernos
  createAula: (data: any) => apiFetch("/mente/aulas", { method: "POST", body: JSON.stringify(data) }),
  updateAula: (id: string, data: any) => 
    apiFetch(`/mente/aulas/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteAula: (id: string) => apiFetch(`/mente/aulas/${id}`, { method: "DELETE" }),

  // Biblioteca
  getLivros: () => apiFetch("/mente/livros"),
  createLivro: (data: any) => apiFetch("/mente/livros", { method: "POST", body: JSON.stringify(data) }),
  updateLivro: (id: string, data: any) => 
    apiFetch(`/mente/livros/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteLivro: (id: string) => apiFetch(`/mente/livros/${id}`, { method: "DELETE" }),
};
