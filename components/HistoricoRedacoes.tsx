"use client";

import Link from "next/link";
import { RedacaoResumo } from "@/types/redacao";

interface HistoricoRedacoesProps {
  redacoes: RedacaoResumo[];
  onExcluir: (id: string) => void;
}

function formatarData(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function HistoricoRedacoes({
  redacoes,
  onExcluir,
}: HistoricoRedacoesProps) {
  if (redacoes.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center">
        <p className="text-slate-500">
          Você ainda não tem redações salvas.
        </p>
        <p className="mt-1 text-xs text-slate-400">
          Clique em Nova redação para começar.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      {/* Cabeçalho da tabela (escondido no mobile) */}
      <div className="hidden grid-cols-12 gap-4 border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 md:grid">
        <div className="col-span-5">Título</div>
        <div className="col-span-2">Data</div>
        <div className="col-span-2 text-right">Linhas</div>
        <div className="col-span-1 text-right">Nota</div>
        <div className="col-span-2 text-right">Ações</div>
      </div>

      {/* Lista */}
      <ul className="divide-y divide-slate-100">
        {redacoes.map((r) => (
          <li
            key={r.id}
            className="grid grid-cols-1 gap-2 px-4 py-4 md:grid-cols-12 md:items-center md:gap-4"
          >
            {/* Título + tema */}
            <div className="md:col-span-5">
              <Link
                href={`/redacoes/${r.id}`}
                className="block font-medium text-slate-800 hover:text-blue-600"
              >
                {r.titulo || "(sem título)"}
              </Link>
              <p className="mt-0.5 truncate text-xs text-slate-500">
                {r.tema || "(sem tema)"}
              </p>
            </div>

            {/* Data */}
            <div className="text-sm text-slate-600 md:col-span-2">
              <span className="md:hidden text-xs font-semibold uppercase text-slate-400">
                Data:{" "}
              </span>
              {formatarData(r.data)}
            </div>

            {/* Linhas */}
            <div className="text-sm text-slate-600 md:col-span-2 md:text-right">
              <span className="md:hidden text-xs font-semibold uppercase text-slate-400">
                Linhas:{" "}
              </span>
              {r.quantidade_linhas}
            </div>

            {/* Nota */}
            <div className="text-sm font-medium text-slate-700 md:col-span-1 md:text-right">
              <span className="md:hidden text-xs font-semibold uppercase text-slate-400">
                Nota:{" "}
              </span>
              {r.nota_final !== null ? r.nota_final : "—"}
            </div>

            {/* Ações */}
            <div className="flex gap-2 md:col-span-2 md:justify-end">
              <Link
                href={`/redacoes/${r.id}`}
                className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Editar
              </Link>
              <button
                onClick={() => onExcluir(r.id)}
                className="rounded-md border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50"
              >
                Excluir
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}