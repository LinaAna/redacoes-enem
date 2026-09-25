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

// Versão "leve" para exibir na lista (sem o texto completo)
export interface RedacaoResumo {
  id: string;
  titulo: string;
  tema: string;
  data: string;
  quantidade_linhas: number;
  quantidade_palavras: number;
  nota_final: number | null;
}

export interface Competencia {
  id?: string;
  redacao_id: string;
  competencia: 1 | 2 | 3 | 4 | 5;
  nota: number;
  observacao: string;
}

export interface RedacaoCompleta extends Redacao {
  competencias: Competencia[];
}

export interface EstatisticasRedacoes {
  totalRedacoes: number;
  mediaGeral: number | null;
  maiorNota: number | null;
  mediasCompetencias: { competencia: number; media: number | null }[];
  historico: {
    id: string;
    titulo: string;
    data: string;
    nota: number | null;
  }[];
}

export const LINHAS_MAX = 30;
export const ALTURA_LINHA_PX = 32;
export const COMPETENCIAS_NOTAS_VALIDAS = [0, 40, 80, 120, 160, 200];