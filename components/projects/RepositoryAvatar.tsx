import { cn } from "@/utils/cn";

export function RepositoryAvatar({
  owner,
  repo,
  color,
  className,
}: {
  owner: string;
  repo: string;
  color: string;
  className?: string;
}) {
  const initials = `${owner[0] ?? "d"}${repo[0] ?? "w"}`.toUpperCase();

  return (
    <div
      className={cn(
        "flex size-11 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-sm font-bold text-white shadow-lg shadow-black/10",
        color,
        className,
      )}
      aria-hidden
    >
      {initials}
    </div>
  );
}
