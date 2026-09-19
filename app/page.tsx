import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="mb-2 text-3xl font-semibold text-slate-800">
        Minhas Redações
      </h1>
      <p className="mb-6 text-slate-500">
        Treine redações do ENEM e acompanhe sua evolução.
      </p>

      <div className="mb-6">
        <Link
          href="/redacoes/nova"
          className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700"
        >
          + Nova redação
        </Link>
      </div>

      <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
        Nenhuma redação cadastrada ainda.
        <br />
        <span className="text-xs">
          (A lista será implementada na Etapa 6)
        </span>
      </div>
    </main>
  );
}