import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.rpc("obter_estatisticas_redacoes");
    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    console.error("Erro ao carregar estatísticas:", error);
    return NextResponse.json(
      { erro: "Não foi possível carregar as estatísticas." },
      { status: 500 }
    );
  }
}