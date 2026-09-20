import { Competencia, Redacao, RedacaoResumo } from "@/types/redacao";

/**
 * Camada de API do frontend.
 * Substitui o lib/storage.ts da Etapa 2.
 *
 * Todas as funções usam { cache: "no-store" } para evitar dados stale.
 */

export async function listarResumos(): Promise<RedacaoResumo[]> {
  const res = await fetch("/api/redacoes", { cache: "no-store" });
  if (!res.ok) {
    throw new Error("Erro ao listar redações.");
  }
  return res.json();
}

export async function buscarPorId(id: string): Promise<Redacao | null> {
  const res = await fetch(`/api/redacoes/${id}`, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error("Erro ao buscar redação.");
  }
  return res.json();
}

export async function criarRedacao(
  dados: Omit<Redacao, "created_at" | "updated_at">
): Promise<Redacao> {
  const res = await fetch("/api/redacoes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dados),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.erro || "Erro ao criar redação.");
  }
  return res.json();
}

export async function atualizarRedacao(
  id: string,
  dados: Partial<Redacao>
): Promise<Redacao> {
  const res = await fetch(`/api/redacoes/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dados),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.erro || "Erro ao atualizar redação.");
  }
  return res.json();
}

export async function excluirRedacao(id: string): Promise<boolean> {
  const res = await fetch(`/api/redacoes/${id}`, {
    method: "DELETE",
  });
  return res.ok;
}

export async function listarCompetencias(id: string): Promise<Competencia[]> {
  const res = await fetch(`/api/redacoes/${id}/competencias`, {
    cache: "no-store",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.erro || "Erro ao carregar competências.");
  }
  return res.json();
}

export async function salvarCompetencias(
  id: string,
  competencias: Omit<Competencia, "id" | "redacao_id">[]
): Promise<Competencia[]> {
  const res = await fetch(`/api/redacoes/${id}/competencias`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ competencias }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.erro || "Erro ao salvar competências.");
  }
  return res.json();
}