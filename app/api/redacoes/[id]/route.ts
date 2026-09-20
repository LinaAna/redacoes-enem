import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { Redacao } from "@/types/redacao";

type RouteContext = { params: Promise<{ id: string }> };

/**
 * GET /api/redacoes/[id]
 * Busca uma redação completa pelo ID.
 */
export async function GET(
  _req: NextRequest,
  context: RouteContext
) {
  const { id } = await context.params;
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("redacoes")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    return NextResponse.json(
      { erro: "Redação não encontrada." },
      { status: 404 }
    );
  }

  return NextResponse.json(data as Redacao);
}

/**
 * PUT /api/redacoes/[id]
 * Atualiza uma redação existente.
 */
export async function PUT(
  req: NextRequest,
  context: RouteContext
) {
  const { id } = await context.params;

  let body: Partial<Redacao>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { erro: "JSON inválido." },
      { status: 400 }
    );
  }

  const supabase = getSupabaseAdmin();

  // Atualiza apenas os campos enviados + updated_at
  const { data, error } = await supabase
    .from("redacoes")
    .update({
      ...body,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Erro ao atualizar redação:", error);
    return NextResponse.json(
      { erro: "Erro ao atualizar redação." },
      { status: 500 }
    );
  }

  return NextResponse.json(data as Redacao);
}

/**
 * DELETE /api/redacoes/[id]
 * Exclui uma redação.
 * Graças ao "on delete cascade" do schema, as competências são excluídas junto.
 */
export async function DELETE(
  _req: NextRequest,
  context: RouteContext
) {
  const { id } = await context.params;
  const supabase = getSupabaseAdmin();

  const { error } = await supabase
    .from("redacoes")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Erro ao excluir redação:", error);
    return NextResponse.json(
      { erro: "Erro ao excluir redação." },
      { status: 500 }
    );
  }

  return NextResponse.json({ sucesso: true });
}