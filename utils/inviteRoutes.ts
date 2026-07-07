export type InviteRouteParams = {
  code: string;
};

function cleanCode(value: string | null | undefined) {
  return value?.trim() ?? "";
}

export function inviteFallbackHref(code: string) {
  const params = new URLSearchParams({
    code: cleanCode(code),
  });

  return `/invite/_?${params.toString()}`;
}

export function parseInvitePath(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length !== 2 || segments[0] !== "invite") {
    return null;
  }

  try {
    const code = decodeURIComponent(segments[1]);
    return code ? ({ code } satisfies InviteRouteParams) : null;
  } catch {
    return segments[1] ? ({ code: segments[1] } satisfies InviteRouteParams) : null;
  }
}
