export type PublicProfileRouteParams = {
  login: string;
};

function cleanLogin(value: string | null | undefined) {
  return value?.trim().replace(/^@+/, "") ?? "";
}

export function publicProfileHref(login: string | null | undefined) {
  const cleaned = cleanLogin(login);
  return cleaned ? `/u/${encodeURIComponent(cleaned)}` : "/u";
}

export function parsePublicProfilePath(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length !== 2 || segments[0] !== "u") {
    return null;
  }

  try {
    const login = cleanLogin(decodeURIComponent(segments[1] ?? ""));
    return login ? ({ login } satisfies PublicProfileRouteParams) : null;
  } catch {
    const login = cleanLogin(segments[1]);
    return login ? ({ login } satisfies PublicProfileRouteParams) : null;
  }
}

export function publicProfileLoginFromSearch(search: string) {
  const login = cleanLogin(new URLSearchParams(search).get("login"));
  return login || null;
}

export function fallbackPublicProfileUrl(login: string | null | undefined) {
  const href = publicProfileHref(login);
  const siteUrl = process.env.NEXT_PUBLIC_DOTTI_SITE_URL?.replace(/\/+$/, "");

  if (siteUrl) {
    return `${siteUrl}${href}`;
  }

  if (typeof window !== "undefined") {
    return `${window.location.origin}${href}`;
  }

  return href;
}
