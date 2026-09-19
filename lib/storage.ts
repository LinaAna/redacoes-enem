import { Redacao, RedacaoResumo } from "@/types/redacao";

const STORAGE_KEY = "redacoes_enem";

/**
 * Lê todas as redações do localStorage.
 * Retorna array vazio se não houver nada salvo.
 */
function lerTodas(): Redacao[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Redacao[];
  } catch {
    return [];
  }
}

/** Salva o array completo no localStorage. */
function salvarTodas(redacoes: Redacao[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(redacoes));
}

/** Lista redações em formato "resumo" (sem o texto), ordenadas por data desc. */
export function listarResumos(): RedacaoResumo[] {
  return lerTodas()
    .map((r) => ({
      id: r.id,
      titulo: r.titulo,
      tema: r.tema,
      data: r.data,
      quantidade_linhas: r.quantidade_linhas,
      quantidade_palavras: r.quantidade_palavras,
      nota_final: r.nota_final,
    }))
    .sort((a, b) => (a.data < b.data ? 1 : -1));
}

/** Busca uma redação completa pelo ID. */
export function buscarPorId(id: string): Redacao | null {
  const todas = lerTodas();
  return todas.find((r) => r.id === id) ?? null;
}

/** Cria uma nova redação. */
export function criarRedacao(dados: Omit<Redacao, "created_at" | "updated_at">): Redacao {
  const agora = new Date().toISOString();
  const nova: Redacao = {
    ...dados,
    created_at: agora,
    updated_at: agora,
  };
  const todas = lerTodas();
  todas.push(nova);
  salvarTodas(todas);
  return nova;
}

/** Atualiza uma redação existente. */
export function atualizarRedacao(id: string, dados: Partial<Redacao>): Redacao | null {
  const todas = lerTodas();
  const idx = todas.findIndex((r) => r.id === id);
  if (idx === -1) return null;

  const atualizada: Redacao = {
    ...todas[idx],
    ...dados,
    updated_at: new Date().toISOString(),
  };
  todas[idx] = atualizada;
  salvarTodas(todas);
  return atualizada;
}

/** Exclui uma redação pelo ID. */
export function excluirRedacao(id: string): boolean {
  const todas = lerTodas();
  const filtradas = todas.filter((r) => r.id !== id);
  if (filtradas.length === todas.length) return false;
  salvarTodas(filtradas);
  return true;
}