"use client";

import { useEffect, useState } from "react";

interface ToastProps {
  mensagem: string;
  tipo?: "sucesso" | "erro";
  duracaoMs?: number;
  onFechar: () => void;
}

export default function Toast({
  mensagem,
  tipo = "sucesso",
  duracaoMs = 2500,
  onFechar,
}: ToastProps) {
  const [visivel, setVisivel] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setVisivel(false), duracaoMs);
    const fechamento = setTimeout(onFechar, duracaoMs + 200);
    return () => {
      clearTimeout(t);
      clearTimeout(fechamento);
    };
  }, [duracaoMs, onFechar]);

  const cor =
    tipo === "sucesso"
      ? "bg-emerald-600 text-white"
      : "bg-red-600 text-white";

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 rounded-md px-4 py-3 text-sm shadow-lg transition-all duration-200 ${cor} ${
        visivel ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
      }`}
      role="status"
    >
      {mensagem}
    </div>
  );
}