import { Badge } from "@/components/ui/Badge";
import type { DifficultyLevel } from "@/types";

export function DifficultyBadge({ difficulty }: { difficulty: DifficultyLevel }) {
  const tone =
    difficulty === "Beginner" || difficulty === "Easy"
      ? "success"
      : difficulty === "Medium"
        ? "warning"
        : "danger";

  return <Badge tone={tone}>{difficulty}</Badge>;
}
