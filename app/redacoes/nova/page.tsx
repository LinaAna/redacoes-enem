"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import RedacaoEditor from "@/components/RedaçãoEditor";
import Toast from "@/components/Toast";
import { contarCaracteres, contarLinhas, contarPalavras } from "@/lib/calculos";
import { criarRedacao } from "@/lib/api";
import { LINHAS_MAX } from "@/types/redacao";

export default function NovaRedacaoPage() {
  const router = useRouter();
  const [tema, setTema] = useState("");
  const [texto, setTexto] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const salvar = async () => {
    setErro(null);
    if (!tema.trim()) {
      setErro("Informe o tema da redação.");
      return;
    }
    if (!texto.trim()) {
      setErro("Escreva pelo menos um pouco da redação.");
      return;
    }

    const textarea = document.getElementById("redacao-texto");
    const mirror = document.createElement("div");
    mirror.style.position = "absolute";
    mirror.style.visibility = "hidden";
    mirror.style.whiteSpace = "pre-wrap";
    mirror.style.wordWrap = "break-word";
    mirror.style.fontFamily =
      'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
    mirror.style.fontSize = "16px";
    mirror.style.lineHeight = "32px";
    mirror.style.padding = "0";

    if (textarea instanceof HTMLTextAreaElement) {
      const estilo = getComputedStyle(textarea);
      const paddingH =
        parseFloat(estilo.paddingLeft) + parseFloat(estilo.paddingRight);
      const borderH =
        parseFloat(estilo.borderLeftWidth) + parseFloat(estilo.borderRightWidth);
      mirror.style.width = `${textarea.clientWidth - paddingH - borderH}px`;
    } else {
      mirror.style.width = "700px";
    }

    document.body.appendChild(mirror);
    const linhas = contarLinhas(texto, mirror);
    document.body.removeChild(mirror);
    if (linhas > LINHAS_MAX) {
      setErro(`Sua redação tem ${linhas} linhas. Reduza para no máximo ${LINHAS_MAX}.`);
      return;
    }

    const tituloTema = tema.trim();
    const titulo = tituloTema.length > 60 ? `${tituloTema.slice(0, 57)}...` : tituloTema;
    setSalvando(true);
    try {
      const redacao = await criarRedacao({
        id: crypto.randomUUID(),
        titulo,
        tema: tituloTema,
        texto,
        data: new Date().toISOString(),
        quantidade_linhas: linhas,
        quantidade_palavras: contarPalavras(texto),
        quantidade_caracteres: contarCaracteres(texto),
        nota_final: null,
      });
      setToast("Redação criada.");
      router.push(`/redacoes/${redacao.id}`);
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Erro ao salvar redação.");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <header className="mb-6 flex items-center justify-between gap-4">
        <Link href="/" className="text-sm text-slate-600 hover:text-slate-900">
          ← Voltar
        </Link>
        <h1 className="text-xl font-semibold text-slate-800">Nova redação</h1>
        <button
          type="button"
          onClick={salvar}
          disabled={salvando}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-60"
        >
          {salvando ? "Salvando..." : "Salvar redação"}
        </button>
      </header>

      {erro && (
        <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {erro}
        </p>
      )}

      <RedacaoEditor tema={tema} setTema={setTema} texto={texto} setTexto={setTexto} />
      {toast && <Toast mensagem={toast} onFechar={() => setToast(null)} />}
    </main>
  );
}