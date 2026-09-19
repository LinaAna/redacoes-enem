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
  tema: string;
  setTema: (t: string) => void;
  texto: string;
  setTexto: (t: string) => void;
}

export default function RedacaoEditor({
  tema,
  setTema,
  texto,
  setTexto,
}: RedacaoEditorProps) {
  const [linhas, setLinhas] = useState(0);
  const [mensagemLimite, setMensagemLimite] = useState("");

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const mirrorRef = useRef<HTMLDivElement>(null);

  // Guarda o último texto válido para reverter quando o usuário ultrapassar 30 linhas
  const ultimoTextoValidoRef = useRef(texto);

  // Flag: só revertemos o texto se o usuário estiver editando.
  // Ao carregar uma redação existente, não queremos "cortar" o texto dela.
  const isInicializandoRef = useRef(true);

  useEffect(() => {
    // Após o primeiro render, consideramos que a inicialização acabou
    const t = setTimeout(() => {
      isInicializandoRef.current = false;
    }, 50);
    return () => clearTimeout(t);
  }, []);

  /**
   * Calcula quantas linhas o texto ocupa no espelho.
   * Não modifica o texto — apenas lê.
   */
  const calcularLinhasAtual = useCallback(() => {
    if (!mirrorRef.current) return 0;
    return contarLinhas(texto, mirrorRef.current);
  }, [texto]);

  useEffect(() => {
    if (!mirrorRef.current) return;

    const novasLinhas = calcularLinhasAtual();
      const frameId = requestAnimationFrame(() => {
        if (novasLinhas > LINHAS_MAX) {
          // Se ainda estamos inicializando (carregando redação), apenas avisamos
          if (isInicializandoRef.current) {
            setLinhas(novasLinhas);
            setMensagemLimite(
              `Esta redação tem ${novasLinhas} linhas (acima do limite de 30).`
            );
            return;
          }
          // Se o usuário está digitando, revertemos para o último texto válido
          setTexto(ultimoTextoValidoRef.current);
          setMensagemLimite("Limite de 30 linhas atingido.");
          setTimeout(() => setMensagemLimite(""), 2500);
          return;
        }

        setMensagemLimite(" ");
        setLinhas(novasLinhas);
        ultimoTextoValidoRef.current = texto;
      });

      return () => cancelAnimationFrame(frameId);
  }, [texto, calcularLinhasAtual, setTexto]);

  // Sincroniza largura do espelho com a do textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    const mirror = mirrorRef.current;
    if (!textarea || !mirror) return;

    const sincronizar = () => {
      const estilo = getComputedStyle(textarea);
      const paddingH =
        parseFloat(estilo.paddingLeft) + parseFloat(estilo.paddingRight);
      const borderH =
        parseFloat(estilo.borderLeftWidth) + parseFloat(estilo.borderRightWidth);
      mirror.style.width = `${textarea.clientWidth - paddingH - borderH}px`;
    };

    const ro = new ResizeObserver(sincronizar);
    ro.observe(textarea);
    sincronizar();
    return () => ro.disconnect();
  }, []);

  const palavras = useMemo(() => contarPalavras(texto), [texto]);
  const caracteres = useMemo(() => contarCaracteres(texto), [texto]);

  const linhasRascunho = Array.from({ length: LINHAS_MAX }, (_, i) => i + 1);

  return (
    <div className="flex flex-col gap-4">
      {/* Tema editável */}
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <label className="mb-1 block text-sm font-medium text-slate-700">
          Tema da redação
        </label>
        <input
          type="text"
          value={tema}
          onChange={(e) => setTema(e.target.value)}
          placeholder="Ex: Desafios da educação brasileira no século XXI"
          className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-slate-800 outline-none transition focus:border-blue-400 focus:bg-white"
        />
      </div>

      {/* Folha de redação */}
      <div className="relative rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="relative overflow-hidden rounded-md border border-slate-300 bg-white">
          {/* Pauta (linhas horizontais) */}
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
            aria-hidden
          >
            {linhasRascunho.map((n) => (
              <div
                key={n}
                className="px-2 text-right text-xs text-slate-400"
                style={{ height: ALTURA_LINHA_PX, lineHeight: `${ALTURA_LINHA_PX}px` }}
              >
                {n}
              </div>
            ))}
          </div>

          {/* Textarea */}
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
              fontFamily:
                'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
              fontSize: "16px",
              paddingTop: 0,
              paddingBottom: 0,
            }}
          />

          {/* Espelho invisível para medir linhas */}
          <div
            ref={mirrorRef}
            aria-hidden
            className="invisible absolute -left-9999px -top-9999px whitespace-pre-wrap break-word"
            style={{
              lineHeight: `${ALTURA_LINHA_PX}px`,
              fontFamily:
                'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
              fontSize: "16px",
              padding: 0,
              margin: 0,
            }}
          />
        </div>

        {mensagemLimite && (
          <div className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {mensagemLimite}
          </div>
        )}
      </div>

      <ContadorStatus linhas={linhas} palavras={palavras} caracteres={caracteres} />
    </div>
  );
}