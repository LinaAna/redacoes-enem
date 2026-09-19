"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  contarCaracteres,
  contarLinhas,
  contarPalavras,
} from "@/lib/calculos";
import { ALTURA_LINHA_PX, LINHAS_MAX } from "@/types/redacao";
import ContadorStatus from "./ContadorStatus";

interface RedacaoEditorProps {
  tema?: string;
  textoInicial?: string;
}

/**
 * Editor que simula a folha de redação do ENEM.
 *
 * Estratégia de contagem de linhas:
 * - Existe um <div> "espelho" invisível com as mesmas propriedades CSS
 *   do textarea (fonte, tamanho, line-height, padding, largura).
 * - A cada mudança no texto, jogamos o conteúdo no espelho e medimos
 *   scrollHeight / lineHeight → temos as linhas visuais reais.
 * - Se passar de 30 linhas, reverter para o texto anterior.
 */
export default function RedacaoEditor({
  tema = "",
  textoInicial = "",
}: RedacaoEditorProps) {
  const [texto, setTexto] = useState(textoInicial);
  const [linhas, setLinhas] = useState(0);
  const [mensagemLimite, setMensagemLimite] = useState("");

  // Refs para o textarea e para o espelho
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const mirrorRef = useRef<HTMLDivElement>(null);

  // Guardamos o último texto válido (dentro do limite) para reverter se precisar
  const ultimoTextoValidoRef = useRef(textoInicial);

  /**
   * Recalcula linhas, palavras e caracteres.
   * Usamos useCallback para evitar recriar a função a cada render.
   */
  const recalcular = useCallback(() => {
    if (!mirrorRef.current) return;

    const novasLinhas = contarLinhas(texto, mirrorRef.current);
    const palavras = contarPalavras(texto);
    const caracteres = contarCaracteres(texto);

    // Se ultrapassou o limite, reverter para o último texto válido
    if (novasLinhas > LINHAS_MAX) {
      setTexto(ultimoTextoValidoRef.current);
      setMensagemLimite("Limite de 30 linhas atingido.");
      // Limpa a mensagem após 2,5s
      setTimeout(() => setMensagemLimite(""), 2500);
      return;
    }

    setMensagemLimite("");
    setLinhas(novasLinhas);
    ultimoTextoValidoRef.current = texto;

    // Atualizamos palavras/caracteres via estado derivado (useMemo abaixo)
    // mas precisamos forçar um re-render com as linhas:
    // (as outras métricas são calculadas no useMemo)
    void palavras;
    void caracteres;
  }, [texto]);

  useEffect(() => {
    recalcular();
  }, [recalcular]);

  // Sincroniza a largura do espelho com a do textarea (importante em resize)
  useEffect(() => {
    const textarea = textareaRef.current;
    const mirror = mirrorRef.current;
    if (!textarea || !mirror) return;

    const sincronizarLargura = () => {
      // Descontamos padding e border para ter a largura interna real
      const estilo = getComputedStyle(textarea);
      const paddingH =
        parseFloat(estilo.paddingLeft) + parseFloat(estilo.paddingRight);
      const borderH =
        parseFloat(estilo.borderLeftWidth) +
        parseFloat(estilo.borderRightWidth);
      mirror.style.width = `${textarea.clientWidth - paddingH - borderH}px`;
      recalcular();
    };

    const ro = new ResizeObserver(sincronizarLargura);
    ro.observe(textarea);
    sincronizarLargura();

    return () => ro.disconnect();
  }, [recalcular]);

  // Métricas derivadas (recalculadas automaticamente quando 'texto' muda)
  const palavras = useMemo(() => contarPalavras(texto), [texto]);
  const caracteres = useMemo(() => contarCaracteres(texto), [texto]);

  // Linhas do rascunho (30 linhas visuais na folha)
  const linhasRascunho = Array.from({ length: LINHAS_MAX }, (_, i) => i + 1);

  return (
    <div className="flex flex-col gap-4">
      {/* Tema */}
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <label className="mb-1 block text-sm font-medium text-slate-700">
          Tema da redação
        </label>
        <input
          type="text"
          value={tema}
          readOnly
          placeholder="Definir desafios da educação brasileira no século XXI"
          className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-slate-800 outline-none focus:border-blue-400"
        />
      </div>

      {/* Folha de redação */}
      <div className="relative rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="relative overflow-hidden rounded-md border border-slate-300 bg-white">
          {/* Linhas de fundo (pauta) */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage: `repeating-linear-gradient(
                to bottom,
                transparent 0px,
                transparent ${ALTURA_LINHA_PX - 1}px,
                #cbd5e1 ${ALTURA_LINHA_PX - 1}px,
                #cbd5e1 ${ALTURA_LINHA_PX}px
              )`,
            }}
            aria-hidden
          />

          {/* Números das linhas */}
          <div
            className="pointer-events-none absolute left-0 top-0 flex flex-col select-none"
            style={{ lineHeight: `${ALTURA_LINHA_PX}px` }}
            aria-hidden
          >
            {linhasRascunho.map((n) => (
              <div
                key={n}
                className="px-2 text-right text-xs text-slate-400"
                style={{ height: ALTURA_LINHA_PX }}
              >
                {n}
              </div>
            ))}
          </div>

          {/* Textarea real (fica por cima das linhas) */}
          <textarea
            ref={textareaRef}
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            spellCheck={false}
            placeholder="Comece a escrever sua redação aqui..."
            className="relative block w-full resize-none bg-transparent pl-12 pr-4 text-base text-slate-900 outline-none placeholder:text-slate-400"
            style={{
              lineHeight: `${ALTURA_LINHA_PX}px`,
              minHeight: ALTURA_LINHA_PX * LINHAS_MAX,
              // fontFamily e fontSize DEVEM ser iguais aos do espelho
              fontFamily:
                'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
              fontSize: "16px",
              paddingTop: 0,
              paddingBottom: 0,
            }}
          />

          {/* Div espelho (invisível) — usado APENAS para medir linhas */}
          <div
            ref={mirrorRef}
            aria-hidden
            className="invisible absolute -left-9999px -top-9999px whitespace-pre-wrap break-word"
            style={{
              lineHeight: `${ALTURA_LINHA_PX}px`,
              fontFamily:
                'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
              fontSize: "16px",
              // padding deve ser 0 para a medição ser precisa
              padding: 0,
              margin: 0,
            }}
          />
        </div>

        {/* Mensagem de limite */}
        {mensagemLimite && (
          <div className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {mensagemLimite}
          </div>
        )}
      </div>

      {/* Contadores */}
      <ContadorStatus
        linhas={linhas}
        palavras={palavras}
        caracteres={caracteres}
      />
    </div>
  );
}