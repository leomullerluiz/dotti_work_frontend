# dotti.work

dotti.work e um prototipo front-end em Next.js para ajudar desenvolvedores a encontrar repositorios open source onde possam contribuir de acordo com stack, senioridade, preferencias de contribuicao e sinais de saude do projeto.

O projeto ainda nao possui backend, autenticacao real ou integracao real com a API do GitHub. Toda a experiencia atual funciona com mocks locais e persistencia em `localStorage`.

## Status do projeto

- Front-end completo implementado.
- App Router do Next.js.
- TypeScript.
- TailwindCSS v4.
- Dark mode como padrao, com suporte a light/system.
- Dados mockados em `data/repositories.ts`.
- Persistencia local via `localStorage`.
- Pronto para futura integracao com GitHub API e OAuth.

## Stack

- Next.js `16.2.9`
- React `19.2.4`
- TypeScript
- TailwindCSS `4`
- lucide-react
- ESLint

> Importante: este projeto usa uma versao de Next.js com mudancas relevantes. Antes de alterar APIs, convencoes de App Router ou estrutura de arquivos, leia `AGENTS.md` e consulte os guias locais em `node_modules/next/dist/docs/`.

## Como rodar

Instale as dependencias:

```bash
npm install
```

Rode o servidor de desenvolvimento:

```bash
npm run dev
```

Abra:

```txt
http://localhost:3000
```

Validacao recomendada antes de entregar qualquer alteracao:

```bash
npm run lint
npm run build
```

## Funcionalidades

- Landing page profissional para o produto.
- Onboarding em multiplas etapas:
  - perfil tecnico;
  - stack com nivel por tecnologia;
  - preferencias de contribuicao;
  - loading simulado antes dos matches.
- Lista de matches com:
  - busca;
  - filtros;
  - ordenacao;
  - refresh simulado;
  - salvar projeto;
  - ignorar projeto;
  - abrir GitHub;
  - registro de historico.
- Detalhe de projeto com:
  - metricas do repositorio;
  - score de compatibilidade;
  - tecnologias em comum;
  - pontos positivos;
  - desafios;
  - checklist de saude;
  - issues recomendadas.
- Projetos salvos com status editavel.
- Historico local de interacoes com undo para projetos ignorados.
- Perfil tecnico com import/export JSON.
- Settings com tema, import/export de dados locais e reset.
- Estados de empty, loading, error, skeleton e toasts.

## Rotas

```txt
/                         Landing page
/onboarding               Onboarding multi-etapas
/matches                  Projetos recomendados
/projects/[owner]/[repo]  Detalhe de projeto mockado
/saved                    Projetos salvos
/history                  Historico local
/profile                  Perfil tecnico
/settings                 Configuracoes
```

## Estrutura principal

```txt
app/          Rotas do Next.js App Router
components/   Componentes reutilizaveis e telas
contexts/     Providers globais e estado persistido
hooks/        Hooks publicos usados pela UI
data/         Constantes e mocks
types/        Tipos TypeScript compartilhados
utils/        Helpers pequenos
docs/         Documentacao de apoio para manutencao e futuras IAs
```

## Estado e persistencia

Os dados locais sao persistidos no navegador. As chaves ficam em `data/constants.ts`:

```ts
STORAGE_KEYS = {
  profile: "dotti.profile",
  savedProjects: "dotti.savedProjects",
  ignoredProjects: "dotti.ignoredProjects",
  history: "dotti.history",
  theme: "dotti.theme",
  filters: "dotti.filters",
}
```

Principais providers:

- `ProfileContext`: perfil tecnico, import/export e reset.
- `SavedProjectsContext`: projetos salvos e status.
- `HistoryContext`: eventos locais da aplicacao.
- `MatchesContext`: filtros, matches, ignored projects e refresh simulado.
- `ThemeContext`: tema `dark`, `light` ou `system`.
- `ToastProvider`: feedback visual de acoes.

## Mocks

Os repositorios mockados ficam em:

```txt
data/repositories.ts
```

Cada projeto segue o contrato `MatchedProject`, definido em:

```txt
types/index.ts
```

Para adicionar um novo projeto mockado:

1. Adicione um item em `mockProjects`.
2. Use um `id` unico.
3. Defina `owner` e `repo`, pois eles formam a URL do detalhe.
4. Inclua metricas, linguagens, topics, checklist de saude e issues.
5. Rode `npm run build` para validar as rotas geradas por `generateStaticParams`.

## Documentacao adicional

Arquivos importantes para futuras manutencoes:

- `docs/AI_HANDOFF.md`: resumo operacional para outra IA continuar o projeto.
- `docs/ARCHITECTURE.md`: arquitetura, providers e organizacao de UI.
- `docs/STATE_AND_DATA.md`: contratos de estado, mocks e persistencia.
- `docs/GITHUB_INTEGRATION_PLAN.md`: plano para GitHub API e OAuth.
- `todo.md`: proximos itens desejados pelo projeto.

## Futuras integracoes

O caminho recomendado para conectar a API do GitHub e criar uma camada:

```txt
services/
  github/
    client.ts
    repositories.ts
    issues.ts
    adapters.ts
```

Ideia geral:

1. Buscar repositorios via GitHub Search API.
2. Buscar issues abertas com labels como `good first issue` e `help wanted`.
3. Converter respostas externas para os tipos internos (`MatchedProject`, `RepositoryIssue`).
4. Manter `data/repositories.ts` como fallback mockado.
5. Implementar OAuth sem salvar tokens em `localStorage`.

## Roadmap curto

Itens anotados em `todo.md`:

- Adicionar Sentry.
- Avaliar animate-ui via shadcn.
- Adicionar OAuth do GitHub.

Outros proximos passos sugeridos:

- Criar camada `services/github`.
- Criar funcao pura de calculo de match score.
- Adicionar testes para filtros, contexts e adapters da API.
- Melhorar import/export com versionamento de schema.

## Observacoes para contribuidores

- Componentes com hooks, eventos, `window`, `navigator` ou `localStorage` precisam de `"use client"`.
- Rotas em `app/` devem continuar finas; prefira colocar UI e logica em `components/**`, `contexts/**`, `hooks/**` e `utils/**`.
- Nao implemente backend real ou autenticacao real sem mudar explicitamente o escopo do projeto.
- Preserve os contratos de `types/index.ts` sempre que possivel.

