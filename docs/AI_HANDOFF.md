# AI Handoff - dotti.work

Este projeto e um prototipo front-end em Next.js App Router para recomendar repositorios open source com base no perfil tecnico do usuario.

## Regras importantes

- Leia `AGENTS.md` antes de alterar codigo.
- Esta versao usa Next.js `16.2.9`. Antes de mudar APIs do framework, consulte os guias locais em `node_modules/next/dist/docs/`.
- Nao ha backend, autenticacao real ou GitHub API real neste prototipo.
- Toda persistencia atual usa `localStorage`.
- Os dados de repositorios e issues sao mocks em `data/repositories.ts`.
- Evite mover logica complexa para arquivos de rota em `app/`; as rotas devem continuar finas.

## Comandos

```bash
npm run dev
npm run lint
npm run build
```

## Rotas implementadas

- `/`: landing page.
- `/onboarding`: fluxo multi-etapas com perfil, stack, preferencias e loading simulado.
- `/matches`: lista principal com filtros, busca, ordenacao, salvar e ignorar.
- `/projects/[owner]/[repo]`: detalhe do projeto, compatibilidade, saude e issues recomendadas.
- `/saved`: projetos salvos com status editavel.
- `/history`: timeline local de interacoes, com undo ignore.
- `/profile`: perfil tecnico salvo, estatisticas locais e import/export de perfil.
- `/settings`: tema, import/export de dados locais, limpeza e reset.

## Onde mexer primeiro

- Componentes de tela: `components/**`
- Estado global: `contexts/**`
- Hooks publicos: `hooks/**`
- Tipos: `types/index.ts`
- Constantes: `data/constants.ts`
- Repositorios mockados: `data/repositories.ts`
- Estilos globais: `app/globals.css`

## Cuidados comuns

- Componentes que usam hooks, eventos, `localStorage`, `window` ou `navigator` precisam de `"use client"`.
- Paginas e layouts do App Router sao Server Components por padrao.
- Em rotas dinamicas do Next 16, `params` e uma `Promise`; veja `app/projects/[owner]/[repo]/page.tsx`.
- Se adicionar um novo estado persistido, registre uma chave em `STORAGE_KEYS`.
- Se alterar o formato de dados persistidos, pense em migracao ou fallback para JSON antigo.

## Validacao antes de entregar

Sempre rode:

```bash
npm run lint
npm run build
```

