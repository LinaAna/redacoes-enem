import { createClient } from "@supabase/supabase-js";

/**
 * Cliente Supabase para uso APENAS no servidor (Route Handlers).
 *
 * Usa a service_role key, que tem acesso total ao banco.
 * Por isso, NUNCA importe este arquivo em componentes "use client".
 */
export function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.zSUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Variáveis do Supabase não configuradas. Verifique o .env.local."
    );
  }

  return createClient(url, key);
}