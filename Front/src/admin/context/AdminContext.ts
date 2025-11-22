// src/admin/context/AdminContext.ts
import { create } from "zustand";

type Admin = { id: number; nome: string; email: string; nivel?: number };

type Store = {
  admin: Admin | null;
  token: string | null;
  logaAdmin: (admin: Admin, token: string) => void;
  deslogaAdmin: () => void;
};

const TOKEN_KEY = "admin_token";
const ADMIN_INFO_KEY = "admin_info";

export const useAdminStore = create<Store>((set) => ({
  admin: (() => {
    try {
      const raw = localStorage.getItem(ADMIN_INFO_KEY);
      return raw ? (JSON.parse(raw) as Admin) : null;
    } catch {
      return null;
    }
  })(),
  token: localStorage.getItem(TOKEN_KEY),

  logaAdmin: (admin, token) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(ADMIN_INFO_KEY, JSON.stringify(admin));
    set({ admin, token });
  },

  deslogaAdmin: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ADMIN_INFO_KEY);
    set({ admin: null, token: null });
  },
}));

export const ADMIN_LOCALSTORAGE_KEYS = { TOKEN_KEY, ADMIN_INFO_KEY };
