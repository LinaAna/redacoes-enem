"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { buscarEstatisticas } from "@/lib/api";
import { EstatisticasRedacoes } from "@/types/redacao";

function formatarData(data: string): string {
  return new Date(data).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  });
}

function formatarNota(nota: number | null): string {
  return nota === null ? "—" : Math.round(nota).toString();
}

export default function EvolucaoPage() {
  const [estatisticas, setEstatisticas] = useState<EstatisticasRedacoes | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let ativa = true;
    void buscarEstatisticas()
      .then((resultado) => {
        if (ativa) setEstatisticas(resultado);
      })
      .catch((error: unknown) => {
        if (ativa) {
          setErro(error instanceof Error ? error.message : "Erro ao carregar evolução.");
        }
      })
      .finally(() => {
        if (ativa) setCarregando(false);
      });
    return () => {
      ativa = false;
    };
  }, []);

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link href="/" className="text-sm text-blue-700 hover:underline">
            ← Minhas redações
          </Link>
          <h1 className="mt-2 text-2xl font-semibold text-slate-800">
            Minha evolução
          </h1>
        </div>
      </header>

      {carregando && <p className="text-sm text-slate-500">Carregando estatísticas...</p>}
      {erro && (
        <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {erro}
        </p>
      )}

      {estatisticas && (
        <>
          <section className="grid gap-4 sm:grid-cols-3" aria-label="Resumo das notas">
            <article className="rounded-md border border-slate-200 bg-white p-5">
              <p className="text-sm text-slate-500">Redações salvas</p>
              <p className="mt-2 text-3xl font-semibold text-slate-800">
                {estatisticas.totalRedacoes}
              </p>
            </article>
            <article className="rounded-md border border-slate-200 bg-white p-5">
              <p className="text-sm text-slate-500">Nota média</p>
              <p className="mt-2 text-3xl font-semibold text-blue-700">
                {formatarNota(estatisticas.mediaGeral)}
                <span className="ml-1 text-base font-normal text-slate-500">/ 1000</span>
              </p>
            </article>
            <article className="rounded-md border border-slate-200 bg-white p-5">
              <p className="text-sm text-slate-500">Maior nota</p>
              <p className="mt-2 text-3xl font-semibold text-emerald-700">
                {formatarNota(estatisticas.maiorNota)}
                <span className="ml-1 text-base font-normal text-slate-500">/ 1000</span>
              </p>
            </article>
          </section>

          <section className="mt-8 border-y border-slate-200 py-6">
            <h2 className="mb-4 text-lg font-semibold text-slate-800">Notas ao longo do tempo</h2>
            {estatisticas.historico.some((item) => item.nota !== null) ? (
              <div className="h-72 w-full" role="img" aria-label="Gráfico de notas por data">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={estatisticas.historico
                      .filter((item) => item.nota !== null)
                      .map((item) => ({
                        ...item,
                        dataFormatada: formatarData(item.data),
                      }))}
                    margin={{ top: 8, right: 16, bottom: 8, left: 0 }}
                  >
                    <CartesianGrid stroke="#e2e8f0" vertical={false} />
                    <XAxis dataKey="dataFormatada" tick={{ fill: "#64748b", fontSize: 12 }} />
                    <YAxis domain={[0, 1000]} tick={{ fill: "#64748b", fontSize: 12 }} />
                    <Tooltip
                      formatter={(valor) => [`${valor} pontos`, "Nota"]}
                      labelFormatter={(label) => String(label)}
                    />
                    <Line
                      type="monotone"
                      dataKey="nota"
                      name="Nota"
                      stroke="#2563eb"
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: "#2563eb" }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="py-12 text-center text-sm text-slate-500">
                Salve a correção de uma redação para acompanhar suas notas aqui.
              </p>
            )}
          </section>

          <section className="mt-8">
            <h2 className="mb-4 text-lg font-semibold text-slate-800">
              Médias por competência
            </h2>
            <div className="divide-y divide-slate-200 border-y border-slate-200">
              {estatisticas.mediasCompetencias.map(({ competencia, media }) => (
                <div
                  key={competencia}
                  className="flex items-center justify-between py-3"
                >
                  <span className="text-sm font-medium text-slate-700">
                    Competência {competencia}
                  </span>
                  <span className="text-sm tabular-nums text-slate-600">
                    {formatarNota(media)}{media !== null ? " / 200" : ""}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </main>
  );
}