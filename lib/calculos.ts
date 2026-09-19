/**
 * Funções de contagem de linhas, palavras e caracteres.
 *
 * A contagem de linhas usa a técnica do "elemento espelho":
 * um div invisível com as mesmas propriedades CSS do editor.
 * Colocamos o texto dentro e medimos scrollHeight / lineHeight.
 */

import { ALTURA_LINHA_PX } from "@/types/redacao";

/**
 * Calcula quantas linhas VISUAIS o texto ocupa dentro de um container
 * com as mesmas propriedades CSS do mirror.
 *
 * @param texto - texto digitado pelo usuário
 * @param mirror - referência ao div espelho (já configurado com CSS correto)
 * @returns número de linhas ocupadas
 */
export function contarLinhas(texto: string, mirror: HTMLDivElement): number {
  if (!mirror) return 0;

  // Colocamos o texto no espelho.
  // Usamos innerText (não textContent) para preservar quebras de linha.
  // Adicionamos um caractere extra no final para garantir que uma linha
  // vazia final seja contada corretamente.
  mirror.innerText = texto + "\n.";

  const alturaTotal = mirror.scrollHeight;
  const linhas = Math.round(alturaTotal / ALTURA_LINHA_PX);

  return linhas;
}

/**
 * Conta palavras considerando espaços, quebras de linha e pontuação.
 * Usa a mesma lógica simples que o Word/Google Docs.
 */
export function contarPalavras(texto: string): number {
  const limpo = texto.trim();
  if (limpo.length === 0) return 0;
  // Divide por qualquer sequência de espaços/quebras
  return limpo.split(/\s+/).length;
}

/**
 * Conta caracteres SEM contar quebras de linha (padrão ENEM).
 */
export function contarCaracteres(texto: string, incluirQuebras = false): number {
  if (incluirQuebras) return texto.length;
  return texto.replace(/\n/g, "").length;
}