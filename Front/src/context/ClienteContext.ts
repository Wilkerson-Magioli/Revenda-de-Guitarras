import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Cliente = {
  id: number;
  nome: string;
  email: string;
  telefone?: string | null;
};

type AuthState = {
  cliente: Cliente;
  token: string;
  setAuth: (c: Cliente, t: string) => void;
  clearAuth: () => void;
};

export const useClienteStore = create<AuthState>()(
  persist(
    (set) => ({
      cliente: { id: 0, nome: "", email: "" },
      token: "",
      setAuth: (cliente, token) => {
        // salva no estado e também deixa disponível para o api.ts
        localStorage.setItem("token", token);
        set({ cliente, token });
      },
      clearAuth: () => {
        localStorage.removeItem("token");
        set({ cliente: { id: 0, nome: "", email: "" }, token: "" });
      },
    }),
    { name: "revenda-guitarras-auth" } // chave no localStorage
  )
);
