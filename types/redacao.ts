// Tipos básicos do projeto. Vamos expandir nas próximas etapas.

export interface Redacao {
  id: string;
  titulo: string;
  tema: string;
  texto: string;
  data: string; // ISO
  quantidade_linhas: number;
  quantidade_palavras: number;
  quantidade_caracteres: number;
  nota_final: number | null;
  created_at: string;
  updated_at: string;
}

export interface Competencia {
  id?: string;
  redacao_id: string;
  competencia: 1 | 2 | 3 | 4 | 5;
  nota: number; // 0, 40, 80, 120, 160, 200
  observacao: string;
}

export interface RedacaoCompleta extends Redacao {
  competencias: Competencia[];
}

// Constantes do ENEM
export const LINHAS_MAX = 30;
export const ALTURA_LINHA_PX = 32; // altura visual de cada linha (pauta)
export const COMPETENCIAS_NOTAS_VALIDAS = [0, 40, 80, 120, 160, 200];