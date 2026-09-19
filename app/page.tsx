"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { RedacaoResumo } from "@/types/redacao";
import { excluirRedacao, listarResumos } from "@/lib/storage";
import HistoricoRedacoes from "@/components/HistoricoRedacoes";
import ModalConfirmacao from "@/components/ModalConfirmacao";
import Toast from "@/components/Toast";

export default function Home() {
  const [redacoes, setRedacoes] = useState<RedacaoResumo[]>([]);
  const [idExcluir, setIdExcluir] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Carrega a lista ao montar
  const carregar = useCallback(() => {
    setRedacoes(listarResumos());
  }, []);

  useEffect(() => {
    const t = setTimeout(carregar, 0);
    return () => clearTimeout(t);
  }, [carregar]);

  const confirmarExclusao = () => {
    if (!idExcluir) return;
    excluirRedacao(idExcluir);
    setIdExcluir(null);
    setToast("Redação excluída.");
    carregar();
  };

  const redacaoSelecionada = redacoes.find((r) => r.id === idExcluir);

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <header className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">
            Minhas Redações
          </h1>
          <p className="text-sm text-slate-500">
            Treine redações do ENEM e acompanhe sua evolução.
          </p>
        </div>
        <Link
          href="/redacoes/nova"
          className="inline-flex items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700"
        >
          + Nova redação
        </Link>
      </header>

      <HistoricoRedacoes
        redacoes={redacoes}
        onExcluir={(id) => setIdExcluir(id)}
      />

      {/* Modal de confirmação */}
      <ModalConfirmacao
        aberto={idExcluir !== null}
        titulo="Excluir redação"
        mensagem={`Tem certeza que deseja excluir "${
          redacaoSelecionada?.titulo || "esta redação"
        }"? Esta ação não pode ser desfeita.`}
        textoConfirmar="Excluir"
        onConfirmar={confirmarExclusao}
        onCancelar={() => setIdExcluir(null)}
      />

      {/* Toast */}
      {toast && <Toast mensagem={toast} onFechar={() => setToast(null)} />}
    </main>
  );
}