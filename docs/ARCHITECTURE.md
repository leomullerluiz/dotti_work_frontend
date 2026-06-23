# Architecture

## Visao geral

O projeto separa rotas, UI, estado e dados mockados:

```text
app/                  Rotas do Next.js App Router
components/           Componentes reutilizaveis e telas client-side
contexts/             Providers globais com persistencia local
hooks/                Hooks publicos usados pelas telas
data/                 Constantes e fixtures
types/                Tipos TypeScript compartilhados
utils/                Helpers pequenos
docs/                 Documentacao para manutencao
```

## App Router

As rotas em `app/` importam componentes de tela. Isso mantem os arquivos `page.tsx` pequenos e evita misturar regra de negocio com convencao de roteamento.

Exemplo:

```tsx
import { MatchesPage } from "@/components/projects/MatchesPage";

export default function MatchesRoute() {
  return <MatchesPage />;
}
```

## Providers

`contexts/AppProviders.tsx` envolve a aplicacao no `app/layout.tsx`.

Ordem atual:

1. `ThemeProvider`
2. `ToastProvider`
3. `HistoryProvider`
4. `ProfileProvider`
5. `SavedProjectsProvider`
6. `MatchesProvider`

Essa ordem permite que saved/matches registrem historico e mostrem toasts.

## UI

- `components/layout`: shell interno, sidebar, mobile nav, header e logo.
- `components/ui`: primitives simples como `Button`, `Badge`, `EmptyState`, dialogs e theme toggle.
- `components/onboarding`: fluxo multi-etapas e seletor de tecnologias.
- `components/projects`: cards, filtros, detalhe, health card, issue card e paginas de projetos.
- `components/profile`, `components/history`, `components/settings`: telas especificas.

## Estilo

TailwindCSS v4 esta importado em `app/globals.css`.

Pontos relevantes:

- Dark mode via classe `.dark`.
- Cor principal customizada: `coral`, baseada em `#FF6F61`.
- Classe utilitaria local: `.field-input`.
- Fundo global: `bg-app`, vindo de `--color-app`.

## Dependencias

- `next`, `react`, `react-dom`
- `lucide-react` para icones
- Tailwind/PostCSS/ESLint/TypeScript conforme create-next-app

Nao ha shadcn/ui instalado.

