"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, X } from "lucide-react";
import { Button as AnimateButton } from "@/components/animate-ui/primitives/buttons/button";
import { AnimatedDiv } from "@/components/ui/AnimatedSurface";
import { Button } from "@/components/ui/Button";
import { adaptApiTechnologyToUserTechnology } from "@/services/dotti/adapters";
import { listTechnologies } from "@/services/dotti/profile";
import type { SkillLevel, TechCategory, UserTechnology } from "@/types";
import { cn } from "@/utils/cn";
import { SearchInput } from "../ui/SearchInput";

const skillLevels: SkillLevel[] = ["Learning", "Basic", "Daily use", "Advanced"];
const defaultCategory: TechCategory = "Languages";

export function TechnologySelector({
  selected,
  onChange,
}: {
  selected: UserTechnology[];
  onChange: (technologies: UserTechnology[]) => void;
}) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] =
    useState<TechCategory>(defaultCategory);
  const [catalog, setCatalog] = useState<UserTechnology[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCatalog = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await listTechnologies({ active: true, limit: 100 });
      const technologies = response.items.map(adaptApiTechnologyToUserTechnology);
      setCatalog(technologies);
      setActiveCategory((current) =>
        technologies.some((technology) => technology.category === current)
          ? current
          : technologies[0]?.category ?? defaultCategory,
      );
    } catch (loadError) {
      setCatalog([]);
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Could not load technology catalog.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isCurrent = true;

    listTechnologies({ active: true, limit: 100 })
      .then((response) => {
        if (!isCurrent) {
          return;
        }

        const technologies = response.items.map(adaptApiTechnologyToUserTechnology);
        setCatalog(technologies);
        setActiveCategory((current) =>
          technologies.some((technology) => technology.category === current)
            ? current
            : technologies[0]?.category ?? defaultCategory,
        );
      })
      .catch((loadError) => {
        if (!isCurrent) {
          return;
        }

        setCatalog([]);
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Could not load technology catalog.",
        );
      })
      .finally(() => {
        if (isCurrent) {
          setIsLoading(false);
        }
      });

    return () => {
      isCurrent = false;
    };
  }, []);

  const options = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return catalog.filter((technology) =>
      normalizedQuery
        ? technology.name.toLowerCase().includes(normalizedQuery)
        : true,
    );
  }, [catalog, query]);

  const visibleOptions = query
    ? options
    : options.filter((technology) => technology.category === activeCategory);
  const categories = Array.from(
    new Set(catalog.map((technology) => technology.category)),
  );

  const addTechnology = (technology: { name: string; category: TechCategory }) => {
    if (selected.some((item) => item.name === technology.name)) {
      return;
    }

    onChange([...selected, { ...technology, level: "Basic" }]);
  };

  const removeTechnology = (name: string) => {
    onChange(selected.filter((technology) => technology.name !== name));
  };

  const updateLevel = (name: string, level: SkillLevel) => {
    onChange(
      selected.map((technology) =>
        technology.name === name ? { ...technology, level } : technology,
      ),
    );
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
      <AnimatedDiv className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Search TypeScript, Docker, Laravel..."
        />

        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          {categories.map((category) => (
            <AnimateButton
              key={category}
              type="button"
              onClick={() => setActiveCategory(category)}
              className={cn(
                "whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium transition",
                activeCategory === category && !query
                  ? "border-coral-400 bg-coral-400/10 text-coral-700 dark:text-coral-200"
                  : "border-zinc-200 bg-zinc-50 text-zinc-600 hover:border-coral-300 hover:text-coral-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-zinc-300",
              )}
            >
              {category}
            </AnimateButton>
          ))}
        </div>

        {isLoading ? (
          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="h-16 animate-pulse rounded-lg border border-zinc-200 bg-zinc-100 dark:border-white/10 dark:bg-white/10"
              />
            ))}
          </div>
        ) : error ? (
          <div className="mt-5 rounded-lg border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-700 dark:text-red-200">
            <p>{error}</p>
            <Button
              type="button"
              size="sm"
              className="mt-3"
              onClick={() => {
                void loadCatalog();
              }}
            >
              Retry catalog
            </Button>
          </div>
        ) : (
          <div className="mt-5 grid gap-2 sm:grid-cols-2">
          {visibleOptions.map((technology) => {
            const isSelected = selected.some((item) => item.name === technology.name);
            return (
              <AnimateButton
                key={`${technology.category}-${technology.name}`}
                type="button"
                onClick={() => addTechnology(technology)}
                disabled={isSelected}
                className={cn(
                  "flex items-center justify-between rounded-lg border px-3 py-2 text-left text-sm transition",
                  isSelected
                    ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-700 dark:text-emerald-200"
                    : "border-zinc-200 bg-zinc-50 text-zinc-700 hover:border-coral-300 hover:bg-coral-400/5 dark:border-white/10 dark:bg-black/20 dark:text-zinc-300",
                )}
              >
                <span>
                  <span className="block font-medium">{technology.name}</span>
                  <span className="text-xs text-zinc-500">{technology.category}</span>
                </span>
                <Plus size={15} />
              </AnimateButton>
            );
          })}
          </div>
        )}
      </AnimatedDiv>

      <AnimatedDiv className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
        <h3 className="font-semibold text-zinc-950 dark:text-white">
          Selected stack
        </h3>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Set how comfortable you are with each technology.
        </p>

        <div className="mt-4 space-y-3">
          {selected.length === 0 ? (
            <p className="rounded-lg border border-dashed border-zinc-300 p-4 text-sm text-zinc-500 dark:border-white/10 dark:text-zinc-400">
              Select at least one technology to continue.
            </p>
          ) : (
            selected.map((technology) => (
              <div
                key={technology.name}
                className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-white/10 dark:bg-black/20"
              >
                <div className="mb-2 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-zinc-950 dark:text-white">
                      {technology.name}
                    </p>
                    <p className="text-xs text-zinc-500">{technology.category}</p>
                  </div>
                  <AnimateButton
                    type="button"
                    onClick={() => removeTechnology(technology.name)}
                    className="rounded-md p-1 text-zinc-400 transition hover:bg-zinc-200 hover:text-zinc-800 dark:hover:bg-white/10 dark:hover:text-white"
                    aria-label={`Remove ${technology.name}`}
                    hoverScale={1.08}
                    tapScale={0.92}
                  >
                    <X size={15} />
                  </AnimateButton>
                </div>
                <select
                  value={technology.level}
                  onChange={(event) =>
                    updateLevel(technology.name, event.target.value as SkillLevel)
                  }
                  className="h-9 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-800 outline-none focus:border-coral-400 focus:ring-2 focus:ring-coral-400/20 dark:border-white/10 dark:bg-white/[0.04] dark:text-zinc-100"
                >
                  {skillLevels.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
              </div>
            ))
          )}
        </div>
      </AnimatedDiv>
    </div>
  );
}
