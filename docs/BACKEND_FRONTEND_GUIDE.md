# Guia do Backend para Desenvolvimento do Front - dotti.work API v2

Este arquivo e o contexto operacional do backend para uma IA ou pessoa que va construir o front-end. Ele traduz o `openapi.yaml` para uma documentacao de produto + API, com as regras de negocio que aparecem no codigo atual.

Fontes locais usadas: `openapi.yaml`, `documentation.md`, `readme.md`, `api/index.php`, controllers, services, models e `migrations/202606230001_open_source_portal.sql`.

## Resumo Executivo

A API do dotti.work e um backend PHP nativo para descoberta de projetos open source. O produto ajuda desenvolvedores a encontrar repositorios e issues compativeis com stack tecnica, senioridade, objetivos profissionais e preferencias de contribuicao.

O dominio antigo de tarefas foi descontinuado. O front novo nao deve construir telas para tarefas, categorias, signup manual, login por senha ou reset de senha.

O dominio atual e:

- Login exclusivo via GitHub OAuth.
- Sessao propria da API por cookie HttpOnly ou Bearer token opaco.
- Perfil profissional e onboarding.
- Catalogo global de tecnologias.
- Stack tecnica do usuario.
- Preferencias de matching.
- Cache de repositorios e issues do GitHub.
- Matches persistidos, explicaveis e deterministicos.
- Estados de repositorio por usuario: salvo, ignorado, pesquisando, trabalhando, PR enviado, contribuido, arquivado.
- Historico de interacoes.
- Importacao do MVP em localStorage.
- Exportacao dos dados do usuario.
- Exclusao de conta por soft delete.

## Bases da API

Todas as rotas do contrato existem sem prefixo e tambem com `/api/v1`.

Producao:

```text
https://api.dottiwork.com
https://api.dottiwork.com/api/v1
```

Local:

```text
http://localhost/dottiwork_api/api
http://localhost/dottiwork_api/api/api/v1
```

Para o front, escolha uma unica `API_BASE_URL` e monte as rotas a partir dela.

## Arquitetura

Fluxo de request:

```text
Cliente
  -> Apache/.htaccess
  -> api/index.php
  -> Router
  -> Controller
  -> Service
  -> Model
  -> PDO/MySQL
  -> Response JSON
```

Camadas:

- `api/core`: infraestrutura HTTP, CORS, request, response, auth, crypto, OAuth, GitHubClient e database.
- `api/controller`: valida entrada, exige autenticacao quando necessario e chama models/services.
- `api/service`: regra de negocio, matching, saude de repositorio, dificuldade de issues, import/export.
- `api/model`: acesso a banco via PDO.
- `migrations`: schema da API v2.
- `docs`: Swagger UI.

## Autenticacao e Sessao

O unico login suportado e GitHub OAuth App.

O front deve iniciar login redirecionando o browser para:

```text
GET /auth/github/start?return_to=/caminho-interno
```

Regras de OAuth:

- `return_to` aceita apenas caminhos internos iniciados com `/`.
- Valores externos como `http:`, `https:`, `//`, `javascript:` e `data:` sao trocados por `/matches`.
- O backend gera `state` forte, salva apenas hash e expira em cerca de 10 minutos.
- O callback troca `code` por access token no servidor.
- O token GitHub e criptografado no banco e nunca volta ao front.
- O backend cria sessao local propria e grava cookie HttpOnly.
- Sucesso redireciona para `FRONTEND_URL/auth/callback?status=success&return_to=...`.
- Erro redireciona para `FRONTEND_URL/auth/callback?status=error&reason=...`.

No browser, use sempre:

```ts
fetch(url, {
  credentials: "include"
})
```

Rotas protegidas aceitam duas formas de autenticacao:

- Cookie HttpOnly `dotti_session`, recomendado para o front.
- Header `Authorization: Bearer TOKEN`, reservado para integracoes, testes ou apps futuros.

O cookie usa:

```text
HttpOnly
SameSite=Lax
Secure em producao
Path=/
Nome padrao: dotti_session
TTL padrao: 2592000 segundos, ou 30 dias
```

Mutacoes (`POST`, `PUT`, `PATCH`, `DELETE`) validam `Origin` quando o header existe. Se o front estiver em origem nao configurada em `CORS_ALLOWED_ORIGINS`, a API responde `403`.

## Contrato de Resposta

Sucesso sempre vem assim:

```json
{
  "success": true,
  "data": {}
}
```

Erro sempre vem assim:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Dados invalidos.",
    "details": [
      {
        "field": "technologies.0.technology_id",
        "message": "technology_id deve ser inteiro."
      }
    ]
  }
}
```

Codigos importantes para o front:

- `401 UNAUTHORIZED`: sessao ausente, invalida ou expirada. Redirecione para login.
- `403 FORBIDDEN`: origem nao autorizada ou acesso negado.
- `404 NOT_FOUND`: recurso nao encontrado.
- `422 VALIDATION_ERROR`: mostrar erros por campo quando houver `details`.
- `429 RATE_LIMITED`: refresh de matches em cooldown ou limite do GitHub.
- `502 BAD_GATEWAY`: falha ao consultar GitHub.
- `503 SERVICE_UNAVAILABLE`: banco ou servico indisponivel.

## Paginacao

O contrato usa `limit` e `cursor`. `limit` vai de 1 a 100, com padrao usual de 30 ou 50.

Formato:

```json
{
  "pagination": {
    "next_cursor": null
  }
}
```

Observacao do codigo atual: catalogo de tecnologias retorna `next_cursor` como o `id` do ultimo item. Varias outras listagens aceitam `cursor`, mas atualmente retornam `next_cursor: null`. O front deve tratar `null` como fim da lista.

## Entidades de Negocio

Usuario:

- Criado/atualizado a partir do GitHub.
- Pode nao ter email publico.
- Nao possui senha no novo fluxo.
- Soft delete em `deleted_at`.

Perfil:

- `role`, `seniority`, `goals`, `onboarding_completed`.
- Criado automaticamente com defaults quando ausente.
- `onboarding_completed_at` e preenchido na primeira conclusao.

Tecnologias:

- Catalogo global com tecnologias ativas/inativas.
- Usuario escolhe ate 50 tecnologias.
- Cada item tem `proficiency_level` e `interest_level`.
- Alterar stack invalida matches ativos do usuario.

Preferencias:

- Controlam busca e ordenacao de matches.
- Alterar preferencias invalida matches ativos.
- Defaults existem caso o usuario ainda nao tenha salvo preferencias.

Repositorios:

- Dados vem do GitHub e sao normalizados em cache.
- O cache inclui dados gerais, linguagens, topics e health score.
- Issues tambem sao cacheadas com estimativa de dificuldade.

Matches:

- Gerados por algoritmo deterministico, sem IA generativa.
- Persistidos em `user_repository_matches`.
- Expiram por TTL.
- Projetos `ignored` ficam fora da lista padrao.

Estados:

- Uma tabela unica controla salvo, ignorado, pesquisando, trabalhando, PR enviado, contribuido e arquivado.
- Nao existem tabelas separadas de favoritos/ignorados.

Historico:

- Registra eventos de interacao do usuario.
- Sempre filtrado por `user_id`.
- Nao deve conter tokens ou dados sensiveis.

## Fluxos Recomendados Para o Front

### Bootstrap da aplicacao

1. Chamar `GET /auth/me` com `credentials: "include"`.
2. Se `401`, mostrar estado deslogado ou redirecionar para login.
3. Se autenticado, usar `data.user`, `data.profile` e `data.github`.
4. Se `profile.onboarding_completed` for falso, mandar para onboarding.
5. Depois do onboarding, carregar matches ou chamar refresh.

### Login GitHub

1. Botao "Entrar com GitHub" deve navegar para `/auth/github/start?return_to=/rota-desejada`.
2. O front nao chama `/auth/github/callback`; quem chama e o GitHub.
3. A pagina `/auth/callback` do front le `status`, `reason` e `return_to`.
4. Em sucesso, chamar `GET /auth/me` para confirmar sessao e redirecionar para `return_to`.

### Onboarding

Ordem recomendada:

1. `GET /catalog/technologies` para montar selecao de stack.
2. `PUT /me/profile` para role, seniority, goals e conclusao.
3. `PUT /me/technologies` para substituir a stack completa.
4. `PUT /me/preferences` para salvar preferencias.
5. `POST /matches/refresh` para gerar primeiros matches.

### Matches

1. Chamar `GET /matches` para obter cache existente.
2. Se vazio ou expirado, chamar `POST /matches/refresh`.
3. Se `429`, mostrar feedback de cooldown e manter lista atual.
4. Cards devem usar `repository`, `match` e `user_state`.
5. Nao chamar GitHub diretamente do front.
6. Nao chamar refresh a cada renderizacao.

### Detalhe de repositorio

1. Abrir `GET /repositories/{owner}/{repo}`.
2. O backend registra automaticamente `viewed_project`.
3. Carregar issues com `GET /repositories/{owner}/{repo}/issues`.
4. Registrar clique externo em GitHub com `POST /repositories/{owner}/{repo}/activity`.
5. Atualizar estado com `PUT /me/repositories/{githubRepositoryId}/state`.

### Estados de repositorio

- Use `saved` para salvar.
- Use `ignored` para esconder dos matches padrao.
- Use `researching` e `working` para acompanhamento.
- Use `pull_request_sent` quando o usuario informar PR enviado.
- Use `contributed` quando concluir contribuicao.
- Use `archived` para tirar do fluxo ativo sem considerar como contribuido.
- Use `POST /restore` para tirar de ignorado e voltar a `saved`.

## Mapa Completo de Endpoints

As rotas abaixo sao o conteudo operacional do `paths` do OpenAPI.

### Sistema

| Metodo | Rota | operationId | Auth | Sucesso | Erros |
| --- | --- | --- | --- | --- | --- |
| GET | `/` | `getRootHealth` | Nao | `HealthResponse` | - |
| GET | `/health` | `getHealth` | Nao | `HealthResponse` | - |
| GET | `/health/database` | `getDatabaseHealth` | Local: nao; producao: sim | `DatabaseHealthResponse` | `401`, `503` |

Regra de negocio: health simples serve para disponibilidade. `health/database` testa `SELECT 1`; em producao exige sessao.

### Autenticacao e Integracao GitHub

| Metodo | Rota | operationId | Auth | Entrada | Sucesso | Erros |
| --- | --- | --- | --- | --- | --- | --- |
| GET | `/auth/github/start` | `startGitHubOAuth` | Nao | query `return_to` | `302 Location` GitHub | `500` |
| GET | `/auth/github/callback` | `handleGitHubOAuthCallback` | Nao | query `code`, `state` | `302 Location` front | - |
| GET | `/auth/me` | `getAuthenticatedUser` | Sim | - | `AuthMeResponse` | `401` |
| POST | `/auth/logout` | `logoutCurrentSession` | Sim | - | `LogoutResponse` | `401`, `403` |
| POST | `/auth/logout-all` | `logoutAllSessions` | Sim | - | `LogoutAllResponse` | `401`, `403` |
| GET | `/auth/session` | `getCurrentSession` | Sim | - | `AuthSessionResponse` | `401` |
| GET | `/integrations/github/status` | `getGitHubIntegrationStatus` | Sim | - | `GitHubStatusResponse` | `401` |
| POST | `/integrations/github/sync` | `syncGitHubProfile` | Sim | - | `UserResponse` | `401`, `403`, `404`, `502` |

Regras de negocio:

- `/auth/me` e a principal rota para hidratar a sessao do front.
- `/auth/session` apenas valida sessao e retorna usuario.
- `/integrations/github/status` informa se a conta GitHub esta conectada, sem expor token.
- `/integrations/github/sync` busca perfil publico atual no GitHub e atualiza o usuario local.
- Logout revoga token local; logout-all revoga todas as sessoes e limpa cookie.

### Perfil, Importacao, Exportacao e Conta

| Metodo | Rota | operationId | Auth | Entrada | Sucesso | Erros |
| --- | --- | --- | --- | --- | --- | --- |
| GET | `/me/profile` | `getMyProfile` | Sim | - | `ProfileResponse` | `401` |
| PUT | `/me/profile` | `updateMyProfile` | Sim | `ProfileUpdateInput` | `ProfileResponse` | `401`, `403`, `422` |
| POST | `/me/import-local-data` | `importLocalData` | Sim | `LocalDataImport` | `UserDataExportResponse` | `401`, `403`, `422` |
| GET | `/me/export` | `exportMyData` | Sim | - | `UserDataExportResponse` | `401` |
| DELETE | `/me/account` | `deleteMyAccount` | Sim | - | `DeleteAccountResponse` | `401`, `403` |

`PUT /me/profile` aceita:

```json
{
  "display_name": "Nome Publico",
  "role": "Front-end Developer",
  "seniority": "junior",
  "goals": ["first_contribution", "build_portfolio"],
  "onboarding_completed": true
}
```

Regras de negocio:

- `display_name` atualiza tambem a tabela `users`.
- `role` maximo 100 caracteres.
- `display_name` maximo 150 caracteres.
- `seniority` pode ser `junior`, `mid`, `senior` ou `null`.
- `goals` e uma lista unica dos objetivos permitidos.
- `onboarding_completed_at` e definido na primeira transicao para completo.
- Importacao aceita partes opcionais: `profile`, `technologies`, `preferences`, `repository_states`, `history`.
- Importacao limita tecnologias a 50, estados a 200 e historico a 300.
- Importacao ignora dados invalidos em alguns blocos; o front nao deve depender de semantica all-or-nothing.
- Exportacao retorna apenas dados do usuario autenticado.
- Exclusao de conta revoga sessoes, limpa cookie e marca `deleted_at`.

### Catalogo e Tecnologias do Usuario

| Metodo | Rota | operationId | Auth | Entrada | Sucesso | Erros |
| --- | --- | --- | --- | --- | --- | --- |
| GET | `/catalog/technologies` | `listTechnologies` | Nao | query `category`, `search`, `active`, `limit`, `cursor` | `TechnologyListResponse` | - |
| GET | `/catalog/technologies/{slug}` | `getTechnologyBySlug` | Nao | path `slug` | `TechnologyResponse` | `404` |
| GET | `/me/technologies` | `getMyTechnologies` | Sim | - | `UserTechnologyListResponse` | `401` |
| PUT | `/me/technologies` | `replaceMyTechnologies` | Sim | `UserTechnologyReplaceInput` | `UserTechnologyListResponse` | `401`, `403`, `422` |

`PUT /me/technologies` faz replace completo:

```json
{
  "technologies": [
    {
      "technology_id": 1,
      "proficiency_level": "advanced",
      "interest_level": "contribute"
    }
  ]
}
```

Regras de negocio:

- Nao envie `user_id`; o backend usa o token.
- Limite de 50 tecnologias.
- `technology_id` deve existir e estar ativo.
- IDs duplicados retornam `422`.
- `proficiency_level`: `learning`, `basic`, `daily`, `advanced`.
- `interest_level`: `learn`, `contribute`, `mentor`; padrao `contribute`.
- Replace roda em transacao.
- Alterar tecnologias invalida matches ativos do usuario.

### Preferencias

| Metodo | Rota | operationId | Auth | Entrada | Sucesso | Erros |
| --- | --- | --- | --- | --- | --- | --- |
| GET | `/me/preferences` | `getMyPreferences` | Sim | - | `UserPreferenceResponse` | `401` |
| PUT | `/me/preferences` | `updateMyPreferences` | Sim | `UserPreferenceInput` | `UserPreferenceResponse` | `401`, `403`, `422` |

`PUT /me/preferences`:

```json
{
  "contribution_types": ["bug_fix", "documentation", "tests"],
  "difficulty_levels": ["beginner", "intermediate"],
  "project_sizes": ["small", "medium"],
  "documentation_languages": ["en", "pt", "any"],
  "organization_types": ["community", "foundation", "any"],
  "activity_window_days": 90,
  "minimum_stars": 0,
  "require_good_first_issue": false,
  "require_help_wanted": false,
  "default_sort_by": "best_match"
}
```

Regras de negocio:

- Campos de lista obrigatorios: `contribution_types`, `difficulty_levels`, `project_sizes`, `documentation_languages`, `organization_types`.
- Cada lista aceita no maximo 20 itens.
- `activity_window_days` entre 1 e 3650.
- `minimum_stars` nao pode ser negativo.
- Alterar preferencias invalida matches ativos.
- Defaults do backend: bug fix/documentacao/testes; beginner/intermediate; small/medium; en/pt/any; community/foundation/any; 90 dias; 0 estrelas; sem exigir labels; sort `best_match`.

### Matches

| Metodo | Rota | operationId | Auth | Entrada | Sucesso | Erros |
| --- | --- | --- | --- | --- | --- | --- |
| GET | `/matches` | `listMatches` | Sim | query `state`, `minimum_score`, `sort_by`, `limit`, `cursor` | `MatchListResponse` | `401` |
| POST | `/matches/refresh` | `refreshMatches` | Sim | - | `MatchRefreshResponse` | `401`, `403`, `429`, `502` |
| GET | `/matches/{githubRepositoryId}` | `getMatchByRepositoryId` | Sim | path `githubRepositoryId` | `MatchResponse` | `401`, `404` |

Regras de negocio:

- `GET /matches` lista matches persistidos ainda nao expirados.
- Sem filtro `state`, matches com `user_state = ignored` sao ocultados.
- Com filtro `state`, retorna apenas aquele estado.
- `minimum_score` filtra de 0 a 100.
- `sort_by` aceita o enum OpenAPI. No codigo atual, `recently_updated` ordena por update do repositorio; os demais caem em score desc.
- `POST /matches/refresh` consulta GitHub/cache, recalcula e persiste.
- Cooldown padrao: 60 segundos por usuario.
- Se o refresh estiver em cooldown, a controller responde `429`.
- Se GitHub falhar ou exceder limite, responda feedback nao destrutivo e mantenha cache anterior no front.

### Repositorios

| Metodo | Rota | operationId | Auth | Entrada | Sucesso | Erros |
| --- | --- | --- | --- | --- | --- | --- |
| GET | `/repositories/{owner}/{repo}` | `getRepository` | Sim | path `owner`, `repo` | `RepositoryDetailResponse` | `401`, `502` |
| GET | `/repositories/{owner}/{repo}/issues` | `listRepositoryIssues` | Sim | path `owner`, `repo`; query `difficulty`, `label`, `limit`, `cursor` | `RepositoryIssueListResponse` | `401`, `502` |
| POST | `/repositories/{owner}/{repo}/activity` | `createRepositoryActivity` | Sim | `RepositoryActivityInput` | `ActivityEventResponse` | `401`, `403`, `422` |

Regras de negocio:

- Detalhe usa cache fresco quando existe.
- Se nao houver cache fresco, consulta GitHub, linguagens, topics, labels e conteudo raiz.
- Se GitHub falhar, pode usar cache expirado como fallback.
- Abrir detalhe registra automaticamente `viewed_project`.
- Issues retornam apenas issues, nao pull requests.
- Issues sao cacheadas e recebem `difficulty_estimation`.
- Filtro `difficulty` compara com `difficulty_estimation.level`.
- Filtro `label` compara labels do GitHub em lowercase.
- Activity manual aceita: `viewed_project`, `opened_github`, `started_contributing`, `sent_pull_request`, `marked_contributed`.

### Estados de Repositorio

| Metodo | Rota | operationId | Auth | Entrada | Sucesso | Erros |
| --- | --- | --- | --- | --- | --- | --- |
| GET | `/me/repositories` | `listMyRepositoryStates` | Sim | query `state`, `limit`, `cursor` | `RepositoryStateListResponse` | `401` |
| PUT | `/me/repositories/{githubRepositoryId}/state` | `setRepositoryState` | Sim | `RepositoryStateInput` | `RepositoryStateResponse` | `401`, `403`, `422` |
| DELETE | `/me/repositories/{githubRepositoryId}/state` | `deleteRepositoryState` | Sim | path `githubRepositoryId` | `RemoveRepositoryStateResponse` | `401`, `403` |
| POST | `/me/repositories/{githubRepositoryId}/restore` | `restoreRepositoryState` | Sim | path `githubRepositoryId` | `RepositoryStateResponse` | `401`, `403` |

`PUT /me/repositories/{githubRepositoryId}/state`:

```json
{
  "state": "working",
  "notes": "Vou iniciar pela documentacao do componente."
}
```

Regras de negocio:

- Estado e unico por usuario + repositorio.
- O backend nunca aceita `user_id` do body.
- `saved` define `saved_at`.
- `ignored` define `ignored_at` e remove do match padrao.
- `contributed` define `contributed_at`.
- `restore` grava estado `saved` e evento `restored_project`.
- Ao setar estado, o backend tenta preencher `owner_login` e `repository_name` a partir do cache. Para repositorios arbitrarios, carregue primeiro o detalhe ou use um item vindo de matches.
- Map de eventos ao alterar estado:
  - `saved` -> `saved_project`
  - `ignored` -> `ignored_project`
  - `researching` -> `started_contributing`
  - `working` -> `started_contributing`
  - `pull_request_sent` -> `sent_pull_request`
  - `contributed` -> `marked_contributed`
  - `archived` -> `ignored_project`

### Historico

| Metodo | Rota | operationId | Auth | Entrada | Sucesso | Erros |
| --- | --- | --- | --- | --- | --- | --- |
| GET | `/me/history` | `listMyHistory` | Sim | query `event_type`, `github_repository_id`, `limit`, `cursor` | `ActivityEventListResponse` | `401` |
| DELETE | `/me/history` | `clearMyHistory` | Sim | - | `ClearHistoryResponse` | `401`, `403` |

Regras de negocio:

- Lista sempre filtrada pelo usuario autenticado.
- `DELETE /me/history` apaga somente historico do usuario atual.
- Eventos possuem `metadata` livre, mas nao devem conter tokens.

## DTOs e Schemas Principais

Esta secao resume os schemas do `components.schemas` do OpenAPI.

### Wrappers

`SuccessResponse`:

- `success: boolean`
- `data: object`

`ErrorResponse`:

- `success: false`
- `error.code: string`
- `error.message: string`
- `error.details: ErrorDetail[]`

`ErrorDetail`:

- `field?: string`
- `message?: string`
- campos extras permitidos

`Pagination`:

- `next_cursor: string | integer | null`

### Auth e Perfil

`User`:

- `id: integer`
- `login: string | null`
- `display_name: string | null`
- `email: string | null`
- `avatar_url: uri | null`
- `bio: string | null`
- `location: string | null`
- `company: string | null`
- `website_url: string | null`
- `github_profile_url: uri | null`
- `created_at: string | null`
- `updated_at: string | null`

`AuthProfile`:

- `role: string | null`
- `seniority: Seniority | null`
- `onboarding_completed: boolean`
- `goals: ProfileGoal[]`

`UserProfile` = `AuthProfile` +:

- `id: integer`
- `user_id: integer`
- `onboarding_completed_at: string | null`
- `created_at: string`
- `updated_at: string`

`GitHubIntegration`:

- `connected: boolean`
- `login: string | null`
- `provider: "github"`
- `scope: string | null`
- `token_last_verified_at: string | null`

`ProfileUpdateInput`:

- `display_name?: string | null`, max 150
- `role?: string | null`, max 100
- `seniority?: Seniority | null`
- `goals?: ProfileGoal[]`, unique
- `onboarding_completed?: boolean`

`AuthMeResponse.data`:

- `user: User`
- `profile: AuthProfile`
- `github: GitHubIntegration`

`ProfileResponse.data`:

- `user: User`
- `profile: UserProfile`

### Exportacao e Importacao

`UserDataExport`:

- `user: User`
- `profile: UserProfile`
- `technologies: UserTechnology[]`
- `preferences: UserPreference`
- `repository_states: RepositoryState[]`
- `history: ActivityEvent[]`

`LocalDataImport`:

- `profile?: ProfileUpdateInput`
- `technologies?: UserTechnologyInput[]`, max 50
- `preferences?: UserPreferenceInput`
- `repository_states?: RepositoryStateImportInput[]`, max 200
- `history?: ActivityEventImportInput[]`, max 300

### Tecnologias

`Technology`:

- `id: integer`
- `slug: string`
- `name: string`
- `category: TechnologyCategory`
- `github_language: string | null`
- `github_topics: string[]`
- `is_active: boolean`
- `display_order: integer`
- `created_at: string`
- `updated_at: string`

`UserTechnologyInput`:

- `technology_id: integer`
- `proficiency_level: ProficiencyLevel`
- `interest_level?: InterestLevel`, default `contribute`

`UserTechnology` = `UserTechnologyInput` +:

- `id: integer`
- `user_id: integer`
- `slug: string`
- `name: string`
- `category: TechnologyCategory`
- `github_language: string | null`
- `github_topics: string[]`
- `created_at: string`
- `updated_at: string`

`UserTechnologyReplaceInput`:

- `technologies: UserTechnologyInput[]`, max 50

### Preferencias

`UserPreferenceInput`:

- `contribution_types: ContributionType[]`, required, max 20
- `difficulty_levels: DifficultyLevel[]`, required, max 20
- `project_sizes: ProjectSize[]`, required, max 20
- `documentation_languages: DocumentationLanguage[]`, required, max 20
- `organization_types: OrganizationType[]`, required, max 20
- `activity_window_days?: integer`, 1..3650, default 90
- `minimum_stars?: integer`, min 0, default 0
- `require_good_first_issue?: boolean`, default false
- `require_help_wanted?: boolean`, default false
- `default_sort_by?: SortBy`, default `best_match`

`UserPreference` = `UserPreferenceInput` +:

- `id: integer`
- `user_id: integer`
- `created_at: string`
- `updated_at: string`

### Matches

`RepositoryMatchItem`:

- `repository: RepositorySummary`
- `match: Match`
- `user_state: RepositoryStateValue | null`

`Match`:

- `score: number`
- `recommended_seniority: "junior" | "mid" | "senior"`
- `breakdown: MatchBreakdown`
- `reasons: string[]`
- `generated_at: string`
- `expires_at: string`

`MatchBreakdown`:

- `stack: number`
- `difficulty: number`
- `issues: number`
- `activity: number`
- `health: number`
- `contribution_readiness: number`

`MatchListResponse.data`:

- `items: RepositoryMatchItem[]`
- `pagination: Pagination`
- `metadata.cached: boolean`

`MatchRefreshResponse.data`:

- `refreshed: boolean`
- `items: RepositoryMatchItem[]`

### Repositorios e Issues

`RepositorySummary`:

- `github_repository_id: integer | null`
- `owner: string | null`
- `name: string | null`
- `description: string | null`
- `html_url: uri | null`
- `stars: integer`
- `forks: integer`
- `open_issues: integer`
- `languages: string[]`
- `topics: string[]`
- `updated_at: string | null`
- `license: string | null`
- `homepage: string | null`

`RepositoryHealth`:

- `score: integer`, 0..100
- `has_readme: boolean`
- `has_contributing: boolean`
- `has_code_of_conduct: boolean`
- `has_ci: boolean`
- `has_tests: boolean`
- `has_contribution_labels: boolean`

`RepositoryDetailResponse.data`:

- `repository: RepositorySummary`
- `health: RepositoryHealth | null`
- `user_state: RepositoryStateValue | null`
- `match: Match | null`

`RepositoryIssue`:

- `id: integer`
- `github_repository_id: integer`
- `github_issue_id: integer`
- `issue_number: integer`
- `issue_data: object`
- `difficulty_estimation: IssueDifficulty | null`
- `fetched_at: string`
- `expires_at: string`
- `created_at: string`
- `updated_at: string`

`IssueDifficulty`:

- `level: DifficultyLevel`
- `confidence: number`
- `reasons: string[]`

`RepositoryActivityInput`:

- `event_type: viewed_project | opened_github | started_contributing | sent_pull_request | marked_contributed`

### Estados e Historico

`RepositoryState`:

- `id: integer`
- `user_id: integer`
- `github_repository_id: integer`
- `owner_login: string`
- `repository_name: string`
- `state: RepositoryStateValue`
- `notes: string | null`
- `saved_at: string | null`
- `ignored_at: string | null`
- `contributed_at: string | null`
- `created_at: string`
- `updated_at: string`

`RepositoryStateInput`:

- `state: RepositoryStateValue`
- `notes?: string | null`

`RepositoryStateImportInput` = `RepositoryStateInput` +:

- `github_repository_id: integer`
- `owner_login?: string`
- `repository_name?: string`

`ActivityEvent`:

- `id: integer`
- `user_id: integer`
- `github_repository_id: integer | null`
- `event_type: ActivityEventType`
- `metadata: object | null`
- `created_at: string`

`ActivityEventImportInput`:

- `event_type: ActivityEventType`
- `github_repository_id?: integer | null`

## Enums

`Seniority`:

```text
junior
mid
senior
```

`ProfileGoal`:

```text
first_contribution
build_portfolio
practical_experience
join_communities
long_term_projects
```

`TechnologyCategory`:

```text
language
framework
library
tool
platform
database
devops_cloud
```

`ProficiencyLevel`:

```text
learning
basic
daily
advanced
```

`InterestLevel`:

```text
learn
contribute
mentor
```

`ContributionType`:

```text
bug_fix
feature
documentation
tests
performance
refactor
accessibility
translation
```

`DifficultyLevel`:

```text
beginner
intermediate
advanced
```

`ProjectSize`:

```text
small
medium
large
```

`DocumentationLanguage`:

```text
en
pt
es
any
```

`OrganizationType`:

```text
independent
startup
company
community
foundation
any
```

`SortBy`:

```text
best_match
most_active
most_stars
beginner_friendly
recently_updated
```

`RepositoryStateValue`:

```text
saved
ignored
researching
working
pull_request_sent
contributed
archived
```

`ActivityEventType`:

```text
viewed_project
saved_project
ignored_project
opened_github
started_contributing
sent_pull_request
marked_contributed
restored_project
```

## Matching: Regra de Negocio

O algoritmo atual fica em `MatchService` e nao depende de IA generativa.

Fluxo do refresh:

1. Verifica cooldown pelo ultimo `generated_at`.
2. Busca conta OAuth GitHub do usuario e decripta access token.
3. Carrega tecnologias, perfil e preferencias.
4. Gera queries de busca a partir das primeiras 5 tecnologias.
5. Para cada tecnologia, usa `github_language` e ate 2 `github_topics`.
6. Se o usuario nao tiver stack, usa fallback `topic:good-first-issue` e `topic:opensource`.
7. Monta query GitHub com `archived:false is:public stars:>=minimum_stars`.
8. Busca ate 5 repositorios por query e deduplica.
9. Analisa no maximo 12 candidatos.
10. Para cada candidato, busca linguagens, topics, labels, conteudo raiz e issues.
11. Calcula saude do repositorio e dificuldade das issues.
12. Calcula score, ordena desc e persiste ate 30 matches.

Distribuicao de score:

```text
stack: ate 35
difficulty: ate 20
issues: ate 15
activity: ate 10
health: ate 10
contribution_readiness: ate 10
total: ate 100
```

Detalhes do score:

- Stack: 15 pontos se linguagem do repo bater com tecnologia do usuario.
- Stack: ate 15 pontos por topics compativeis, 5 por match.
- Stack: ate 5 pontos extras pela quantidade de tecnologias do usuario.
- Junior: `8 + beginnerIssues * 4`, max 20.
- Mid: `10 + helpfulLabels * 2`, max 20.
- Senior: `12 + 4` se repo tiver mais de 50 issues abertas, max 20.
- Sem senioridade: dificuldade padrao 10.
- Issues: `helpfulLabels * 3 + beginnerIssues * 2`, max 15.
- Atividade: atualizado ate 30 dias = 10; ate 90 = 7; ate 180 = 4; mais antigo = 1.
- Health: `round(repositoryHealth.score / 10)`, max 10.
- Readiness: contributing 4 + contribution labels 4 + readme 2.

Reasons atuais possiveis:

- `Repository language matches your stack`
- `Repository topics match your technologies`
- `Repository is active recently`
- `Contribution-friendly issues are available`
- `Contribution guide found`
- fallback: `Repository has public activity and can be explored`

`recommended_seniority` no codigo atual e derivado do score:

- score >= 85: `mid`
- score >= 70: `junior`
- abaixo de 70: `senior`

## Saude de Repositorio

`RepositoryHealthService` calcula `score` de 0 a 100.

Pesos atuais:

- README: 15
- CONTRIBUTING: 20
- CODE_OF_CONDUCT: 10
- Licenca: 10
- CI: 10
- Tests ou `__tests__`: 10
- Labels `good first issue` ou `help wanted`: 15
- Descricao: 10

Sinais detectados:

- `has_readme`
- `has_contributing`
- `has_code_of_conduct`
- `has_ci`
- `has_tests`
- `has_contribution_labels`

## Estimativa de Dificuldade de Issue

`IssueDifficultyService` estima nivel com base em titulo, corpo, labels e quantidade de comentarios.

Beginner signals:

```text
good first issue
beginner
documentation
translation
easy
starter
simple test
```

Intermediate signals:

```text
bug
feature
refactor
test
performance
accessibility
```

Advanced signals:

```text
architecture
security
breaking change
migration
infrastructure
complex
```

Regras:

- Advanced se houver sinal advanced ou mais de 12 comentarios.
- Beginner se houver sinal beginner e ate 5 comentarios.
- Intermediate se houver sinal intermediate.
- Default: intermediate com confidence 0.55.
- Labels `good first issue` e `help wanted` entram nas reasons.
- O front deve apresentar como estimativa, nao certeza absoluta.

## Cache e Limites

Configuracoes em `api/config/github.php`:

- `REPOSITORY_CACHE_TTL_SECONDS`, default 21600 segundos, 6 horas.
- `ISSUES_CACHE_TTL_SECONDS`, default 3600 segundos, 1 hora.
- `MATCH_CACHE_TTL_SECONDS`, default 3600 segundos, 1 hora.
- `MATCH_REFRESH_COOLDOWN_SECONDS`, default 60 segundos.
- Timeouts GitHub: connect 5s, total 15s por padrao.

Implica para o front:

- Nao consultar refresh de matches automaticamente em toda tela.
- Preferir `GET /matches` primeiro.
- Fazer refresh apenas por acao explicita, onboarding ou estado vazio.
- Reutilizar dados de `RepositorySummary` nos cards.
- Abrir detalhe apenas quando o usuario entrar no detalhe.

## Seguranca Para o Front

Nunca:

- Guardar token local em `localStorage`.
- Esperar receber token GitHub.
- Mandar `user_id` em payloads.
- Chamar GitHub diretamente para dados que o backend fornece.
- Criar telas de email/senha.
- Criar telas de reset de senha.
- Usar endpoints antigos de tarefas.
- Exibir detalhes internos de erro para o usuario final.

Sempre:

- Usar `credentials: "include"`.
- Tratar `401` como sessao expirada.
- Tratar `422` por campo.
- Tratar `429` com feedback de cooldown.
- Manter o usuario no fluxo se GitHub falhar e houver cache.
- Usar os enums exatamente como definidos.
- Buscar catalogo de tecnologias antes de salvar stack.

## Tabelas Principais

O schema da migration v2 cria/adapta:

- `users`
- `auth_tokens`
- `oauth_accounts`
- `oauth_authorization_states`
- `user_profiles`
- `user_profile_goals`
- `technologies`
- `user_technologies`
- `user_preferences`
- `user_repository_states`
- `user_activity_events`
- `repository_cache`
- `repository_issue_cache`
- `user_repository_matches`

Tecnologias iniciais do catalogo:

```text
JavaScript
TypeScript
React
Next.js
Node.js
PHP
Laravel
WordPress
Python
Django
Java
Spring
Vue
Angular
TailwindCSS
React Query
Redux
Zod
Docker
GitHub Actions
MySQL
PostgreSQL
MongoDB
Firebase
AWS
Cloudflare
Nginx
Playwright
Vitest
Jest
```

## Checklist Para Outra IA Desenvolvendo o Front

- Configurar `API_BASE_URL`.
- Criar helper HTTP que sempre envia `credentials: "include"`.
- Centralizar tratamento de `success`, `data` e `error`.
- Criar guarda de autenticacao baseada em `GET /auth/me`.
- Implementar pagina `/auth/callback` no front.
- Implementar login por redirect para `/auth/github/start`.
- Implementar onboarding com perfil, tecnologias e preferencias.
- Implementar tela de matches baseada em `GET /matches` e refresh manual.
- Implementar cards com score, reasons, stack, health e estado.
- Implementar detalhe de repositorio + issues.
- Implementar acoes: salvar, ignorar, restaurar, pesquisar, trabalhando, PR enviado, contribuido, arquivar.
- Implementar historico com filtros opcionais.
- Implementar importacao de localStorage uma vez apos login, se o MVP antigo existir.
- Implementar exportacao de dados.
- Implementar logout e logout-all.
- Implementar exclusao de conta com confirmacao forte.
- Nao implementar funcionalidades fora do dominio atual.
