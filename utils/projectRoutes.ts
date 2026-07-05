export type ProjectRouteParams = {
  owner: string;
  repo: string;
};

function cleanSegment(value: string | null | undefined) {
  return value?.trim() ?? "";
}

export function projectDetailHref(owner: string, repo: string) {
  const params = new URLSearchParams({
    owner: cleanSegment(owner),
    repo: cleanSegment(repo),
  });

  return `/projects?${params.toString()}`;
}

export function parseProjectDetailPath(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length !== 3 || segments[0] !== "projects") {
    return null;
  }

  const [owner, repo] = segments.slice(1).map((segment) => {
    try {
      return decodeURIComponent(segment);
    } catch {
      return segment;
    }
  });

  if (!owner || !repo) {
    return null;
  }

  return { owner, repo } satisfies ProjectRouteParams;
}
