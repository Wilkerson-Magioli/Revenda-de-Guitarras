import type { GuitarraType } from "./GuitarraType"

export type PropostaType = {
  id: number
  clienteId: string
  guitarraId: number
  guitarra: GuitarraType
  descricao: string
  resposta: string | null
  createdAt: string
  updatedAt: string | null
}