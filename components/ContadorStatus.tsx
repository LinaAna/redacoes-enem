"use client";

import { LINHAS_MAX } from "@/types/redacao";

interface ContadorStatusProps {
  linhas: number;
  palavras: number;
  caracteres: number;
}

/**
 * Mostra o status atual da redação: linhas, palavras e caracteres.
 * Muda de cor quando está próximo do limite de linhas.
 */
export default function ContadorStatus({
  linhas,
  palavras,
  caracteres,
}: ContadorStatusProps) {
  const percentual = (linhas / LINHAS_MAX) * 100;

  // Cor dinâmica conforme aproxima do limite
  let cor = "text-slate-600";
  if (percentual >= 100) cor = "text-red-600 font-semibold";
  else if (percentual >= 85) cor = "text-orange-600 font-medium";
  else if (percentual >= 70) cor = "text-amber-600";

  return (
    <div className="flex flex-wrap gap-6 rounded-lg border border-slate-200 bg-white px-5 py-3 text-sm shadow-sm">
      <div className={cor}>
        <span className="font-medium">Linhas:</span>{" "}
        <span className="tabular-nums">
          {linhas} / {LINHAS_MAX}
        </span>
      </div>
      <div className="text-slate-600">
        <span className="font-medium">Palavras:</span>{" "}
        <span className="tabular-nums">{palavras}</span>
      </div>
      <div className="text-slate-600">
        <span className="font-medium">Caracteres:</span>{" "}
        <span className="tabular-nums">{caracteres.toLocaleString("pt-BR")}</span>
      </div>
    </div>
  );
}