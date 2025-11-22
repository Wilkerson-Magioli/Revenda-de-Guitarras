// src/utils/GuitarraType.ts
export type Marca = { id: number; nome: string };

export type GuitarraType = {
  id: number;
  modelo: string;
  preco: number | string;
  foto: string;
  acessorio?: string | null;
  destaque?: boolean;
  marcaId?: number;
  marca?: Marca | null;
};
