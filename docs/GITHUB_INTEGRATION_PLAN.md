# GitHub Integration Plan

Este prototipo foi preparado para uma futura integracao com GitHub OAuth e GitHub API, mas hoje nao chama servicos externos.

## Objetivo futuro

Substituir gradualmente os mocks por dados reais sem reescrever a UI.

## Interfaces que devem continuar estaveis

Preserve estes tipos sempre que possivel:

- `Repository`
- `MatchedProject`
- `RepositoryIssue`
- `DeveloperProfile`
- `MatchPreferences`

Se a API retornar outro formato, crie adapters para converter dados externos para esses contratos.

## Camada recomendada para futura API

Criar uma pasta nova:

```text
services/
  github/
    client.ts
    repositories.ts
    issues.ts
    adapters.ts
```

Sugestao de responsabilidades:

- `client.ts`: configuracao de fetch, headers e auth token.
- `repositories.ts`: busca por repositorios, topics, linguagens e metadados.
- `issues.ts`: busca de issues com labels como `good first issue` e `help wanted`.
- `adapters.ts`: converte respostas GitHub para `MatchedProject` e `RepositoryIssue`.

## OAuth

Quando houver autenticacao real:

- Nao guardar tokens em `localStorage`.
- Preferir cookies httpOnly/session server-side.
- Separar perfil local de perfil autenticado.
- Criar estados de UI para conectado, desconectado, expirado e erro de permissao.

## Matching real

Um fluxo inicial seguro:

1. Usar `DeveloperProfile.technologies` e `MatchPreferences`.
2. Buscar repositorios por linguagem/topic.
3. Filtrar repositorios com atividade recente.
4. Buscar issues abertas com labels relevantes.
5. Calcular score em uma funcao pura, por exemplo `utils/matching.ts`.
6. Retornar `MatchedProject[]` para reutilizar `ProjectCard`, `ProjectGrid` e `ProjectDetailPage`.

## Criterios para substituir mocks

- A UI continua funcionando offline ou com fallback mockado.
- Erros de API aparecem como empty/error states, sem quebrar a pagina.
- `npm run lint` e `npm run build` passam.
- A documentacao em `docs/STATE_AND_DATA.md` e atualizada com qualquer novo contrato.

