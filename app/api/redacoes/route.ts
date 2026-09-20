import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { Redacao, RedacaoResumo } from "@/types/redacao";

/**
 * GET /api/redacoes
 * Lista todas as redações em formato "resumo" (sem o texto completo).
 */
export async function GET() {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("redacoes")
    .select(
      "id, titulo, tema, data, quantidade_linhas, quantidade_palavras, nota_final"
    )
    .order("data", { ascending: false });

  if (error) {
    console.error("Erro ao listar redações:", error);
    return NextResponse.json(
      { erro: "Erro ao listar redações." },
      { status: 500 }
    );
  }

  return NextResponse.json(data as RedacaoResumo[]);
}

/**
 * POST /api/redacoes
 * Cria uma nova redação.
 */
export async function POST(req: NextRequest) {
  let body: Partial<Redacao>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { erro: "JSON inválido." },
      { status: 400 }
    );
  }

  // Validação mínima
  if (!body.titulo || !body.tema || !body.texto || !body.data) {
    return NextResponse.json(
      { erro: "Campos obrigatórios faltando." },
      { status: 400 }
    );
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("redacoes")
    .insert({
      id: body.id,
      titulo: body.titulo,
      tema: body.tema,
      texto: body.texto,
      data: body.data,
      quantidade_linhas: body.quantidade_linhas,
      quantidade_palavras: body.quantidade_palavras,
      quantidade_caracteres: body.quantidade_caracteres,
      nota_final: body.nota_final ?? null,
    })
    .select()
    .single();

  if (error) {
    console.error("Erro ao criar redação:", error);
    return NextResponse.json(
      { erro: "Erro ao salvar redação." },
      { status: 500 }
    );
  }

  return NextResponse.json(data as Redacao, { status: 201 });
}