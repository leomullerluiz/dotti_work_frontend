"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CircleDot, Filter, RefreshCcw, Star, Trophy, Users } from "lucide-react";
import { Button as AnimateButton } from "@/components/animate-ui/primitives/buttons/button";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { AnimatedDiv } from "@/components/ui/AnimatedSurface";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonProjectCard } from "@/components/ui/SkeletonProjectCard";
import { StatCard } from "@/components/ui/StatCard";
import { DottiApiError } from "@/services/dotti/client";
import { apiErrorMessage } from "@/services/dotti/apiErrorState";
import { listTechnologies } from "@/services/dotti/profile";
import { listTopRepositories } from "@/services/dotti/topRepositories";
import type {
  ApiCursor,
  ApiTechnology,
  ApiTopRepositoryItem,
  ApiTopRepositoryListMetadata,
  ApiTopRepositorySortBy,
} from "@/services/dotti/types";
import { cn } from "@/utils/cn";
import { formatNumber } from "@/utils/format";
import { TopRepositoryCard } from "./TopRepositoryCard";

const PAGE_SIZE = 30;

const sortOptions: Array<{
  value: ApiTopRepositorySortBy;
  label: string;
  icon: typeof Star;
}> = [
  { value: "stars", label: "Mais estrelas", icon: Star },
  { value: "open_issues", label: "Mais issues", icon: CircleDot },
  { value: "contributors", label: "Mais contribuidores", icon: Users },
];

function normalizeSort(value: string | null): ApiTopRepositorySortBy {
  if (value === "open_issues" || value === "contributors") {
    return value;
  }

  return "stars";
}

function errorMessageForTopRepositories(error: unknown) {
  return apiErrorMessage(error, {
    fallback: "Nao foi possivel carregar o ranking de repositorios.",
    unauthorized: "Sua sessao expirou. Entre novamente para ver o ranking.",
    validation: "O filtro selecionado nao foi aceito pela API.",
    unavailable: "O ranking esta temporariamente indisponivel. Tente novamente em instantes.",
  });
}

export function TopRepositoriesPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeSort = normalizeSort(searchParams.get("sort_by"));
  const selectedTechnologySlug =
    searchParams.get("technology")?.trim() || undefined;
  const [technologies, setTechnologies] = useState<ApiTechnology[]>([]);
  const [technologyError, setTechnologyError] = useState<string | null>(null);
  const [items, setItems] = useState<ApiTopRepositoryItem[]>([]);
  const [metadata, setMetadata] = useState<ApiTopRepositoryListMetadata | null>(
    null,
  );
  const [nextCursor, setNextCursor] = useState<ApiCursor>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingTechnologies, setIsLoadingTechnologies] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorStatus, setErrorStatus] = useState<number | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let isCurrent = true;

    async function loadTechnologyCatalog() {
      setIsLoadingTechnologies(true);
      setTechnologyError(null);

      try {
        const response = await listTechnologies({ active: true, limit: 100 });
        if (isCurrent) {
          setTechnologies(
            [...response.items].sort(
              (first, second) =>
                (first.display_order ?? 999) - (second.display_order ?? 999) ||
                first.name.localeCompare(second.name),
            ),
          );
        }
      } catch (loadError) {
        if (isCurrent) {
          setTechnologyError(
            apiErrorMessage(loadError, {
              fallback: "Nao foi possivel carregar as tecnologias.",
              unauthorized: "Entre novamente para carregar tecnologias.",
              validation: "A consulta de tecnologias foi rejeitada pela API.",
              unavailable:
                "O catalogo de tecnologias esta temporariamente indisponivel.",
            }),
          );
        }
      } finally {
        if (isCurrent) {
          setIsLoadingTechnologies(false);
        }
      }
    }

    void loadTechnologyCatalog();

    return () => {
      isCurrent = false;
    };
  }, []);

  useEffect(() => {
    let isCurrent = true;

    async function loadRanking() {
      setIsLoading(true);
      setError(null);
      setErrorStatus(null);
      setItems([]);
      setNextCursor(null);

      try {
        const response = await listTopRepositories({
          sort_by: activeSort,
          technology: selectedTechnologySlug,
          limit: PAGE_SIZE,
        });

        if (isCurrent) {
          setItems(response.items);
          setMetadata(response.metadata ?? null);
          setNextCursor(response.pagination.next_cursor ?? null);
        }
      } catch (loadError) {
        if (isCurrent) {
          setError(errorMessageForTopRepositories(loadError));
          setErrorStatus(
            loadError instanceof DottiApiError ? loadError.status : null,
          );
        }
      } finally {
        if (isCurrent) {
          setIsLoading(false);
        }
      }
    }

    void loadRanking();

    return () => {
      isCurrent = false;
    };
  }, [activeSort, selectedTechnologySlug, reloadKey]);

  const activeTechnology = useMemo(
    () =>
      technologies.find(
        (technology) => technology.slug === selectedTechnologySlug,
      ) ?? null,
    [selectedTechnologySlug, technologies],
  );

  const activeSortLabel =
    sortOptions.find((option) => option.value === activeSort)?.label ??
    "Mais estrelas";

  const updateUrl = (
    sortBy: ApiTopRepositorySortBy,
    technologySlug: string | undefined,
  ) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort_by", sortBy);

    if (technologySlug) {
      params.set("technology", technologySlug);
    } else {
      params.delete("technology");
    }

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const changeSort = (sortBy: ApiTopRepositorySortBy) => {
    updateUrl(sortBy, selectedTechnologySlug);
  };

  const changeTechnology = (technologySlug: string) => {
    const nextTechnology = technologySlug || undefined;
    updateUrl(activeSort, nextTechnology);
  };

  const clearTechnologyFilter = () => {
    changeTechnology("");
  };

  const loadMore = async () => {
    if (!nextCursor || isLoadingMore) {
      return;
    }

    setIsLoadingMore(true);
    setError(null);
    setErrorStatus(null);

    try {
      const response = await listTopRepositories({
        sort_by: activeSort,
        technology: selectedTechnologySlug,
        limit: PAGE_SIZE,
        cursor: nextCursor,
      });

      setItems((current) => [...current, ...response.items]);
      setMetadata(response.metadata ?? metadata);
      setNextCursor(response.pagination.next_cursor ?? null);
    } catch (loadError) {
      setError(errorMessageForTopRepositories(loadError));
      setErrorStatus(loadError instanceof DottiApiError ? loadError.status : null);
    } finally {
      setIsLoadingMore(false);
    }
  };

  return (
    <AppShell>
      <PageHeader
        eyebrow="Discovery"
        title="Top repositories"
        description={`${items.length} repositorios carregados por ${activeSortLabel.toLowerCase()}${
          activeTechnology ? ` em ${activeTechnology.name}` : ""
        }.`}
      />

      <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
        <div className="min-w-0">
          <AnimatedDiv className="mb-5 flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.04] xl:flex-row xl:items-center xl:justify-between">
            <div
              className="inline-grid grid-cols-3 rounded-lg border border-zinc-200 bg-zinc-100 p-1 dark:border-white/10 dark:bg-white/[0.04]"
              role="tablist"
              aria-label="Ordenacao de top repositories"
            >
              {sortOptions.map((option) => {
                const Icon = option.icon;
                const isActive = activeSort === option.value;

                return (
                  <AnimateButton
                    key={option.value}
                    type="button"
                    onClick={() => changeSort(option.value)}
                    className={cn(
                      "flex min-h-10 transform-gpu items-center justify-center gap-1.5 rounded-md px-2.5 py-2 text-xs font-medium transition-[transform,box-shadow,color,background-color] hover:scale-[1.03] active:scale-95 sm:px-3",
                      isActive
                        ? "bg-white text-zinc-950 shadow-sm dark:bg-white/10 dark:text-white"
                        : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white",
                    )}
                    role="tab"
                    aria-selected={isActive}
                  >
                    <Icon size={14} />
                    <span>{option.label}</span>
                  </AnimateButton>
                );
              })}
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <label
                htmlFor="top-repositories-technology"
                className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500"
              >
                <Filter size={14} />
                Tecnologia
              </label>
              <select
                id="top-repositories-technology"
                value={selectedTechnologySlug ?? ""}
                onChange={(event) => changeTechnology(event.target.value)}
                disabled={isLoadingTechnologies}
                className="min-h-10 rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-700 shadow-sm outline-none transition focus:border-coral-400 focus:ring-2 focus:ring-coral-400/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-zinc-950 dark:text-zinc-200"
              >
                <option value="">Todas</option>
                {technologies.map((technology) => (
                  <option key={technology.slug} value={technology.slug}>
                    {technology.name}
                  </option>
                ))}
              </select>
            </div>
          </AnimatedDiv>

          {technologyError ? (
            <p className="mb-4 text-sm text-amber-700 dark:text-amber-200">
              {technologyError}
            </p>
          ) : null}

          {isLoading ? (
            <div className="grid gap-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <SkeletonProjectCard key={index} />
              ))}
            </div>
          ) : error ? (
            <EmptyState
              title={
                errorStatus === 422
                  ? "Filtro invalido"
                  : "Nao foi possivel carregar o ranking"
              }
              description={error}
              action={
                <div className="flex flex-wrap justify-center gap-2">
                  {errorStatus === 422 && selectedTechnologySlug ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={clearTechnologyFilter}
                    >
                      Limpar filtro
                    </Button>
                  ) : null}
                  <Button
                    type="button"
                    onClick={() => setReloadKey((current) => current + 1)}
                  >
                    <RefreshCcw size={16} />
                    Tentar novamente
                  </Button>
                </div>
              }
            />
          ) : items.length === 0 ? (
            <EmptyState
              title="Nenhum repositorio encontrado"
              description={
                activeTechnology
                  ? `Nao ha repositorios populares para ${activeTechnology.name} neste ranking.`
                  : "A API nao retornou repositorios para este ranking."
              }
              action={
                activeTechnology ? (
                  <Button type="button" onClick={clearTechnologyFilter}>
                    Ver todas
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <>
              <div className="grid gap-4">
                {items.map((item) => (
                  <TopRepositoryCard
                    key={`${item.rank}-${item.repository.full_name ?? item.repository.github_repository_id}`}
                    item={item}
                    activeSort={activeSort}
                  />
                ))}
              </div>

              {nextCursor ? (
                <div className="mt-5 flex justify-center">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      void loadMore();
                    }}
                    disabled={isLoadingMore}
                  >
                    <RefreshCcw
                      size={16}
                      className={isLoadingMore ? "animate-spin" : ""}
                    />
                    {isLoadingMore ? "Carregando..." : "Carregar mais"}
                  </Button>
                </div>
              ) : null}
            </>
          )}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:h-fit">
          <StatCard
            label="Ranking"
            value={activeSortLabel}
            helper={activeTechnology ? activeTechnology.name : "Todas tecnologias"}
            icon={<Trophy size={18} />}
          />
          <StatCard
            label="Carregados"
            value={formatNumber(items.length)}
            helper={metadata?.cached ? "Resultado em cache" : "Resultado atualizado"}
            icon={<Star size={18} />}
          />
          <AnimatedDiv className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
            <h2 className="font-semibold text-zinc-950 dark:text-white">
              Filtro ativo
            </h2>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge tone="accent">{activeSortLabel}</Badge>
              <Badge tone={activeTechnology ? "blue" : "neutral"}>
                {activeTechnology?.name ?? "Todas"}
              </Badge>
            </div>
          </AnimatedDiv>
        </aside>
      </div>
    </AppShell>
  );
}
