"use client";

import { useState } from "react";
import {
  COMPETENCIAS_NOTAS_VALIDAS,
  Competencia,
} from "@/types/redacao";
import { salvarCompetencias } from "@/lib/api";

interface CorrecaoCompetenciasProps {
  redacaoId: string;
  competenciasIniciais: Competencia[];
  onSalvo: (notaFinal: number) => void;
}

const competenciaIds = [1, 2, 3, 4, 5] as const;
type CompetenciaId = (typeof competenciaIds)[number];
type CompetenciaForm = Record<CompetenciaId, { nota: number; observacao: string }>;

function criarFormulario(competencias: Competencia[]): CompetenciaForm {
  return competenciaIds.reduce<CompetenciaForm>((formulario, competencia) => {
    const existente = competencias.find(
      (item) => item.competencia === competencia
    );
    formulario[competencia] = {
      nota: existente?.nota ?? 0,
      observacao: existente?.observacao ?? "",
    };
    return formulario;
  }, {} as CompetenciaForm);
}

export default function CorrecaoCompetencias({
  redacaoId,
  competenciasIniciais,
  onSalvo,
}: CorrecaoCompetenciasProps) {
  const [formulario, setFormulario] = useState(() =>
    criarFormulario(competenciasIniciais)
  );
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);

  const notaFinal = competenciaIds.reduce(
    (total, competencia) => total + formulario[competencia].nota,
    0
  );

  const atualizarNota = (competencia: CompetenciaId, nota: number) => {
    setSucesso(false);
    setFormulario((atual) => ({
      ...atual,
      [competencia]: { ...atual[competencia], nota },
    }));
  };

  const atualizarObservacao = (
    competencia: CompetenciaId,
    observacao: string
  ) => {
    setSucesso(false);
    setFormulario((atual) => ({
      ...atual,
      [competencia]: { ...atual[competencia], observacao },
    }));
  };

  const salvar = async () => {
    setErro(null);
    setSucesso(false);
    setSalvando(true);

    try {
      await salvarCompetencias(
        redacaoId,
        competenciaIds.map((competencia) => ({
          competencia,
          nota: formulario[competencia].nota,
          observacao: formulario[competencia].observacao,
        }))
      );
      onSalvo(notaFinal);
      setSucesso(true);
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Erro ao salvar correção.");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <section className="mt-6 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">Correção</h2>
          <p className="text-sm text-slate-500">
            Avalie cada competência e registre observações para esta redação.
          </p>
        </div>
        <div className="rounded-md bg-blue-50 px-4 py-2 text-center">
          <span className="block text-xs font-medium uppercase tracking-wide text-blue-700">
            Nota final
          </span>
          <strong className="text-2xl text-blue-800">{notaFinal} / 1000</strong>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {competenciaIds.map((competencia) => (
          <div
            key={competencia}
            className="rounded-md border border-slate-200 bg-slate-50 p-4"
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <label
                htmlFor={`competencia-${competencia}`}
                className="font-medium text-slate-800"
              >
                Competência {competencia}
              </label>
              <select
                id={`competencia-${competencia}`}
                value={formulario[competencia].nota}
                onChange={(event) =>
                  atualizarNota(competencia, Number(event.target.value))
                }
                className="rounded-md border border-slate-300 bg-white px-2 py-1 text-sm text-slate-800 outline-none focus:border-blue-500"
              >
                {COMPETENCIAS_NOTAS_VALIDAS.map((nota) => (
                  <option key={nota} value={nota}>
                    {nota} pontos
                  </option>
                ))}
              </select>
            </div>
            <label
              htmlFor={`observacao-${competencia}`}
              className="mb-1 block text-xs font-medium text-slate-600"
            >
              Observação
            </label>
            <textarea
              id={`observacao-${competencia}`}
              value={formulario[competencia].observacao}
              onChange={(event) =>
                atualizarObservacao(competencia, event.target.value)
              }
              rows={3}
              placeholder="Registre os pontos observados..."
              className="w-full resize-y rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-blue-500"
            />
          </div>
        ))}
      </div>

      {erro && (
        <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {erro}
        </p>
      )}
      {sucesso && (
        <p className="mt-4 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700" role="status">
          Correção salva com sucesso.
        </p>
      )}

      <button
        type="button"
        onClick={salvar}
        disabled={salvando}
        className="mt-5 rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {salvando ? "Salvando correção..." : "Salvar correção"}
      </button>
    </section>
  );
}
