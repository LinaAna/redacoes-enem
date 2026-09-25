import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import {
  COMPETENCIAS_NOTAS_VALIDAS,
  Competencia,
} from "@/types/redacao";

type RouteContext = { params: Promise<{ id: string }> };
type CompetenciaInput = Pick<Competencia, "competencia" | "nota" | "observacao">;

type CompetenciasBody = {
  competencias?: CompetenciaInput[];
};

function validarCompetencias(competencias: CompetenciaInput[]) {
  if (competencias.length !== 5) return "Informe as cinco competências.";

  if (competencias.some((item) => !item || typeof item !== "object")) {
    return "Cada competência deve conter competência, nota e observação.";
  }

  const ids = competencias
    .map((item) => item.competencia)
    .sort((a, b) => a - b);
  if (ids.join(",") !== "1,2,3,4,5") {
    return "As competências devem ser C1, C2, C3, C4 e C5.";
  }

  if (
    competencias.some(
      (item) =>
        !Number.isInteger(item.competencia) ||
        !COMPETENCIAS_NOTAS_VALIDAS.includes(item.nota) ||
        typeof item.observacao !== "string"
    )
  ) {
    return "Cada nota deve ser 0, 40, 80, 120, 160 ou 200.";
  }

  return null;
}

export async function GET(
  _req: NextRequest,
  context: RouteContext
) {
  const { id } = await context.params;
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("competencias")
    .select("id, redacao_id, competencia, nota, observacao")
    .eq("redacao_id", id)
    .order("competencia", { ascending: true });

  if (error) {
    console.error("Erro ao buscar competências:", error);
    return NextResponse.json(
      { erro: "Erro ao carregar competências." },
      { status: 500 }
    );
  }

  return NextResponse.json(data as Competencia[]);
}

export async function POST(
  req: NextRequest,
  context: RouteContext
) {
  return salvarCompetencias(req, context);
}

export async function PUT(
  req: NextRequest,
  context: RouteContext
) {
  return salvarCompetencias(req, context);
}

export async function DELETE(
  _req: NextRequest,
  context: RouteContext
) {
  const { id } = await context.params;
  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("competencias")
    .delete()
    .eq("redacao_id", id);

  if (error) {
    console.error("Erro ao excluir competências:", error);
    return NextResponse.json(
      { erro: "Erro ao excluir competências." },
      { status: 500 }
    );
  }

  const { error: erroNota } = await supabase
    .from("redacoes")
    .update({ nota_final: null, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (erroNota) {
    console.error("Erro ao limpar nota final:", erroNota);
    return NextResponse.json(
      { erro: "Competências excluídas, mas não foi possível limpar a nota final." },
      { status: 500 }
    );
  }

  return NextResponse.json({ sucesso: true });
}

async function salvarCompetencias(
  req: NextRequest,
  context: RouteContext
) {
  const { id } = await context.params;
  let body: CompetenciasBody;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ erro: "JSON inválido." }, { status: 400 });
  }

  const competencias = body.competencias;
  if (!competencias || !Array.isArray(competencias)) {
    return NextResponse.json(
      { erro: "Informe a lista de competências." },
      { status: 400 }
    );
  }

  const erroValidacao = validarCompetencias(competencias);
  if (erroValidacao) {
    return NextResponse.json({ erro: erroValidacao }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { data: redacao, error: erroRedacao } = await supabase
    .from("redacoes")
    .select("id")
    .eq("id", id)
    .maybeSingle();

  if (erroRedacao || !redacao) {
    return NextResponse.json(
      { erro: "Redação não encontrada." },
      { status: 404 }
    );
  }

  const registros = competencias.map((item) => ({
    redacao_id: id,
    competencia: item.competencia,
    nota: item.nota,
    observacao: item.observacao.trim(),
  }));
  const notaFinal = competencias.reduce((total, item) => total + item.nota, 0);

  const { data, error } = await supabase
    .from("competencias")
    .upsert(registros, { onConflict: "redacao_id,competencia" })
    .select("id, redacao_id, competencia, nota, observacao")
    .order("competencia", { ascending: true });

  if (error) {
    console.error("Erro ao salvar competências:", error);
    return NextResponse.json(
      { erro: "Erro ao salvar competências." },
      { status: 500 }
    );
  }

  const { error: erroNota } = await supabase
    .from("redacoes")
    .update({ nota_final: notaFinal, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (erroNota) {
    console.error("Erro ao atualizar nota final:", erroNota);
    return NextResponse.json(
      { erro: "Competências salvas, mas não foi possível atualizar a nota final." },
      { status: 500 }
    );
  }

  return NextResponse.json(data as Competencia[]);
}
