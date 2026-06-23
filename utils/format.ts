export function formatNumber(value: number) {
  return new Intl.NumberFormat("en", {
    notation: value >= 10000 ? "compact" : "standard",
    maximumFractionDigits: 1,
  }).format(value);
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export function timeAgo(value: string) {
  const diffMs = Date.now() - new Date(value).getTime();
  const days = Math.max(1, Math.round(diffMs / 86_400_000));

  if (days === 1) {
    return "1 day ago";
  }

  if (days < 30) {
    return `${days} days ago`;
  }

  const months = Math.round(days / 30);
  return months === 1 ? "1 month ago" : `${months} months ago`;
}

export function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function makeId(prefix = "evt") {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
