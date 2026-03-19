import { apiFetch } from "@/lib/api";

export const almaService = {
  // Hobbies
  getHobbies: () => apiFetch("/alma/hobbies"),
  createHobby: (data: any) => 
    apiFetch("/alma/hobbies", { method: "POST", body: JSON.stringify(data) }),
  deleteHobby: (id: string) => 
    apiFetch(`/alma/hobbies/${id}`, { method: "DELETE" }),

  // Brainstorm / Notas
  getBrainstorm: () => apiFetch("/alma/brainstorm"),
  createBrainstorm: (data: any) => 
    apiFetch("/alma/brainstorm", { method: "POST", body: JSON.stringify(data) }),
  deleteBrainstorm: (id: string) => 
    apiFetch(`/alma/brainstorm/${id}`, { method: "DELETE" }),
};
