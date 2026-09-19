"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import RedacaoEditor from "@/components/RedacaoEditor";
import Toast from "@/components/Toast";
import {
  contarCaracteres,
  contarLinhas,
  contarPalavras,
} from "@/lib/calculos";
import { atualizarRedacao, buscarPorId } from "@/lib/storage";
import { LINHAS_MAX } from "@/types/redacao";

function EditorInterno() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [tema, setTema] = useState("");
  const [texto, setTexto] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  // Carrega a redação ao montar
  useEffect(() => {
    const t = setTimeout(() => {
      const r = buscarPorId(id);
      if (!r) {
        setCarregando(false);
        setErro("Redação não encontrada.");
        return;
      }
      setTema(r.tema);
      setTexto(r.texto);
      setCarregando(false);
    }, 0);

    return () => clearTimeout(t);
  }, [id]);

  const salvar = () => {
    setErro(null);

    if (!tema.trim()) {
      setErro("Informe o tema da redação.");
      return;
    }
    if (!texto.trim()) {
      setErro("Escreva pelo menos um pouco da redação.");
      return;
    }

    // Mede linhas usando mirror temporário
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

    const textarea = document.querySelector("textarea");
    if (textarea) {
      const estilo = getComputedStyle(textarea);
      const paddingH =
        parseFloat(estilo.paddingLeft) + parseFloat(estilo.paddingRight);
      const borderH =
        parseFloat(estilo.borderLeftWidth) +
        parseFloat(estilo.borderRightWidth);
      mirror.style.width = `${textarea.clientWidth - paddingH - borderH}px`;
    } else {
      mirror.style.width = "700px";
    }

    document.body.appendChild(mirror);
    const linhas = contarLinhas(texto, mirror);
    document.body.removeChild(mirror);

    if (linhas > LINHAS_MAX) {
      setErro(
        `Sua redação tem ${linhas} linhas. Reduza para no máximo ${LINHAS_MAX}.`
      );
      return;
    }

    const palavras = contarPalavras(texto);
    const caracteres = contarCaracteres(texto);

    const titulo =
      tema.trim().length > 60 ? tema.trim().slice(0, 57) + "..." : tema.trim();

    atualizarRedacao(id, {
      titulo,
      tema: tema.trim(),
      texto,
      quantidade_linhas: linhas,
      quantidade_palavras: palavras,
      quantidade_caracteres: caracteres,
    });

    setToast("Redação atualizada!");
    setTimeout(() => router.push("/"), 800);
  };

  if (carregando) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-8 text-slate-500">
        Carregando...
      </main>
    );
  }

  if (erro && !tema && !texto) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-8">
        <p className="text-red-600">{erro}</p>
        <Link href="/" className="mt-4 text-sm text-blue-600 hover:underline">
          ← Voltar para a lista
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <header className="mb-6 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900"
        >
          ← Voltar
        </Link>
        <h1 className="text-xl font-semibold text-slate-800">
          Editar redação
        </h1>
        <button
          onClick={salvar}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700"
        >
          Salvar alterações
        </button>
      </header>

      {erro && (
        <div className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {erro}
        </div>
      )}

      <RedacaoEditor
        tema={tema}
        setTema={setTema}
        texto={texto}
        setTexto={setTexto}
      />

      {toast && <Toast mensagem={toast} onFechar={() => setToast(null)} />}
    </main>
  );
}

// useSearchParams exige Suspense boundary no Next.js
export default function EditarRedacaoPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-4xl px-4 py-8 text-slate-500">
          Carregando...
        </main>
      }
    >
      <EditorInterno />
    </Suspense>
  );
}