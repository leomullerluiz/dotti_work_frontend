const INVITE_CODE_PARAM = "code";

function cleanInviteCode(value: string | null | undefined) {
  return value?.trim() ?? "";
}

export function inviteHref(code: string) {
  const params = new URLSearchParams({
    [INVITE_CODE_PARAM]: cleanInviteCode(code),
  });

  return `/invite/?${params.toString()}`;
}

export function inviteUrl(code: string, origin: string) {
  return new URL(inviteHref(code), origin).toString();
}

export function inviteCodeFromSearch(search: string) {
  return cleanInviteCode(new URLSearchParams(search).get(INVITE_CODE_PARAM));
}
