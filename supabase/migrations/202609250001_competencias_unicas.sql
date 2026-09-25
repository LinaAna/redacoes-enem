create unique index if not exists competencias_redacao_id_competencia_key
  on public.competencias (redacao_id, competencia);

create or replace function public.obter_estatisticas_redacoes()
returns jsonb
language sql
security invoker
set search_path = public
as $$
  select jsonb_build_object(
    'totalRedacoes', (select count(*) from redacoes),
    'mediaGeral', (select avg(nota_final) from redacoes),
    'maiorNota', (select max(nota_final) from redacoes),
    'mediasCompetencias', (
      select jsonb_agg(
        jsonb_build_object('competencia', competencias.competencia, 'media', competencias.media)
        order by competencias.competencia
      )
      from (
        select serie.competencia, avg(c.nota) as media
        from generate_series(1, 5) as serie(competencia)
        left join public.competencias as c
          on c.competencia = serie.competencia
        group by serie.competencia
      ) as competencias
    ),
    'historico', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id', r.id,
          'titulo', r.titulo,
          'data', r.data,
          'nota', r.nota_final
        )
        order by r.data asc
      )
      from public.redacoes as r
    ), '[]'::jsonb)
  );
$$;

revoke all on function public.obter_estatisticas_redacoes() from public, anon, authenticated;
grant execute on function public.obter_estatisticas_redacoes() to service_role;