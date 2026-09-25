"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import RedacaoEditor from "@/components/RedaçãoEditor";
import CorrecaoCompetencias from "@/components/CorrecaoCompetencias";
import Toast from "@/components/Toast";
import {
  contarCaracteres,
  contarLinhas,
  contarPalavras,
} from "@/lib/calculos";
import { atualizarRedacao, buscarPorId, listarCompetencias } from "@/lib/api";
import { Competencia, LINHAS_MAX } from "@/types/redacao";

function EditorInterno() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [tema, setTema] = useState("");
  const [texto, setTexto] = useState("");
  const [competencias, setCompetencias] = useState<Competencia[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const r = await buscarPorId(id);
        if (!r) {
          setErro("Redação não encontrada.");
          return;
        }
        setTema(r.tema);
        setTexto(r.texto);
        try {
          setCompetencias(await listarCompetencias(id));
        } catch (e) {
          setErro(e instanceof Error ? e.message : "Erro ao carregar competências.");
        }
      } catch (e) {
        setErro(e instanceof Error ? e.message : "Erro ao carregar.");
      } finally {
        setCarregando(false);
      }
    })();
  }, [id]);

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

    const textarea = document.getElementById("redacao-texto");
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

    setSalvando(true);
    try {
      await atualizarRedacao(id, {
        titulo,
        tema: tema.trim(),
        texto,
        quantidade_linhas: linhas,
        quantidade_palavras: palavras,
        quantidade_caracteres: caracteres,
      });
      setToast("Redação atualizada!");
      setTimeout(() => router.push("/"), 800);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro ao salvar.");
    } finally {
      setSalvando(false);
    }
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
          disabled={salvando}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-60"
        >
          {salvando ? "Salvando..." : "Salvar alterações"}
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

      <CorrecaoCompetencias
        redacaoId={id}
        competenciasIniciais={competencias}
        onSalvo={(notaFinal) => setToast(`Correção salva: ${notaFinal} / 1000`)}
      />

      {toast && <Toast mensagem={toast} onFechar={() => setToast(null)} />}
    </main>
  );
}

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