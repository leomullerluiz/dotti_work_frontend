# State and Data

## Persistencia local

Todas as chaves de `localStorage` ficam em `data/constants.ts`.

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

O hook base e `hooks/useLocalStorage.ts`.

## Contratos principais

Os tipos ficam em `types/index.ts`.

Tipos mais importantes:

- `DeveloperProfile`
- `UserTechnology`
- `MatchPreferences`
- `MatchedProject`
- `RepositoryIssue`
- `SavedProject`
- `HistoryEvent`
- `TechnologyFilter`
- `LocalAppData`

## Contextos

### ProfileContext

Responsavel por:

- Perfil tecnico.
- Salvar perfil vindo do onboarding.
- Resetar perfil.
- Exportar/importar profile JSON.

### SavedProjectsContext

Responsavel por:

- Salvar/remover projeto.
- Alterar status.
- Limpar salvos.
- Registrar eventos de saved/contribution quando aplicavel.

### HistoryContext

Responsavel por:

- Timeline local.
- Registrar viewed/saved/ignored/opened GitHub/contribution events.
- Limpar historico.

### MatchesContext

Responsavel por:

- Filtros de matches.
- Busca e ordenacao.
- Ignorar/restaurar projetos.
- Refresh simulado.

### ThemeContext

Responsavel por:

- Tema `dark`, `light` ou `system`.
- Aplicar classe `.dark` no `document.documentElement`.

## Mocks

`data/repositories.ts` contem 12 projetos mockados, incluindo:

- Metadados do repositorio.
- Scores de match, atividade e saude.
- Linguagens, topics, dificuldade e senioridade recomendada.
- Checklist de saude.
- Issues recomendadas.

Para adicionar um projeto:

1. Crie um novo item em `mockProjects`.
2. Garanta `id` unico.
3. Inclua `owner` e `repo`, pois eles formam a rota `/projects/[owner]/[repo]`.
4. Inclua pelo menos uma issue recomendada.
5. Rode `npm run build` para validar `generateStaticParams`.

## Import/export

- Perfil: pagina `/profile`.
- App inteiro: pagina `/settings`.

O import/export de app inteiro grava diretamente as chaves de `localStorage` e recarrega a pagina para sincronizar os providers.

