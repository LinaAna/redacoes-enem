# Correcoes

## 19/09/2026

Foram corrigidos avisos da regra `react-hooks/set-state-in-effect` nos seguintes arquivos:

- `components/RedacaoEditor.tsx`
  - A atualizacao da contagem de linhas foi agendada para o proximo frame de renderizacao.
  - O cancelamento do frame foi adicionado durante a desmontagem do componente.

- `components/Toast.tsx`
  - O Toast inicia visivel sem atualizar estado imediatamente dentro do efeito.
  - Os timers de desaparicao e fechamento sao limpos durante a desmontagem.

- `app/page.tsx`
  - O carregamento inicial das redacoes foi agendado para depois da montagem do componente.

- `app/redacoes/id/page.tsx`
  - O carregamento da redacao foi agendado para depois da montagem.
  - O timer e cancelado caso o componente seja desmontado.

## Validacao

O comando `npm.cmd run lint` foi executado com sucesso, sem erros.

## Etapa 4 - Competências

- Criado o handler `app/api/redacoes/[id]/competencias/route.ts`.
- Criado o formulário `components/CorrecaoCompetencias.tsx`.
- Adicionadas as funções de competências em `lib/api.ts`.
- Integrado o carregamento e salvamento da correção em `app/redacoes/[id]/page.tsx`.
- A nota final é calculada pela soma das cinco competências e salva em `redacoes.nota_final`.
- As pastas das rotas dinâmicas foram corrigidas para usar o padrão `[id]` do Next.js.

O comando `npm.cmd run build` também foi executado com sucesso.
