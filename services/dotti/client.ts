type ApiErrorPayload = {
  code?: string;
  message?: string;
  details?: unknown;
};

type ApiEnvelope<T> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      error: ApiErrorPayload;
    };

export class DottiApiError extends Error {
  status: number;
  code?: string;
  details?: unknown;

  constructor({
    status,
    code,
    message,
    details,
  }: {
    status: number;
    code?: string;
    message: string;
    details?: unknown;
  }) {
    super(message);
    this.name = "DottiApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

function requireEnv(value: string | undefined, name: string) {
  if (!value?.trim()) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value.trim();
}

const API_BASE_URL = requireEnv(
  process.env.NEXT_PUBLIC_DOTTI_API_BASE_URL,
  "NEXT_PUBLIC_DOTTI_API_BASE_URL",
).replace(/\/+$/, "");

function normalizePath(path: string) {
  return path.startsWith("/") ? path : `/${path}`;
}

function isPlainObjectBody(body: BodyInit | object | undefined) {
  return Boolean(
    body &&
    typeof body === "object" &&
    !(body instanceof FormData) &&
    !(body instanceof URLSearchParams) &&
    !(body instanceof Blob) &&
    !(body instanceof ArrayBuffer),
  );
}

async function readJson<T>(response: Response) {
  const text = await response.text();

  if (!text) {
    return null as T | null;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new DottiApiError({
      status: response.status,
      message: "A API retornou uma resposta invalida.",
    });
  }
}

export async function dottiRequest<T>(
  path: string,
  init: Omit<RequestInit, "body"> & {
    body?: BodyInit | object;
  } = {},
) {
  const headers = new Headers(init.headers);
  const body = isPlainObjectBody(init.body)
    ? JSON.stringify(init.body)
    : (init.body as BodyInit | undefined);

  headers.set("accept", "application/json");
  if (body && isPlainObjectBody(init.body) && !headers.has("content-type")) {
    headers.set("content-type", "application/json");
  }

  const response = await fetch(`${API_BASE_URL}${normalizePath(path)}`, {
    ...init,
    body,
    headers,
    cache: "no-store",
    credentials: "include",
  });

  const payload = await readJson<ApiEnvelope<T>>(response);

  if (!response.ok || payload?.success === false) {
    const error = payload && "error" in payload ? payload.error : undefined;

    throw new DottiApiError({
      status: response.status,
      code: error?.code,
      message: error?.message ?? "Nao foi possivel concluir a requisicao.",
      details: error?.details,
    });
  }

  if (!payload || !("data" in payload)) {
    throw new DottiApiError({
      status: response.status,
      message: "A API nao retornou dados para esta requisicao.",
    });
  }

  return payload.data;
}

export function isUnauthorizedError(error: unknown) {
  return error instanceof DottiApiError && error.status === 401;
}

export function normalizeReturnTo(value: string | null | undefined, fallback = "/matches") {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return fallback;
  }

  const lowered = value.trim().toLowerCase();
  if (
    lowered.startsWith("/http:") ||
    lowered.startsWith("/https:") ||
    lowered.startsWith("/javascript:") ||
    lowered.startsWith("/data:")
  ) {
    return fallback;
  }

  return value;
}

export function buildGitHubOAuthStartUrl(
  returnTo: string,
  options: { inviteCode?: string | null } = {},
) {
  const url = new URL(`${API_BASE_URL}/auth/github/start`);
  url.searchParams.set("return_to", normalizeReturnTo(returnTo));

  if (options.inviteCode?.trim()) {
    url.searchParams.set("invite_code", options.inviteCode.trim());
  }

  return url.toString();
}
