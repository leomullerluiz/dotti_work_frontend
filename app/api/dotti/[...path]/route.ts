import type { NextRequest } from "next/server";

function requireEnv(value: string | undefined, name: string) {
  if (!value?.trim()) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value.trim();
}

const API_BASE_URL = requireEnv(
  process.env.DOTTI_API_BASE_URL,
  "DOTTI_API_BASE_URL",
).replace(/\/+$/, "");

type RouteParams = {
  params: Promise<{
    path?: string[];
  }>;
};

function buildTargetUrl(request: NextRequest, path: string[] = []) {
  const sourceUrl = new URL(request.url);
  const pathname = path.map((segment) => encodeURIComponent(segment)).join("/");
  const targetUrl = new URL(`${API_BASE_URL}/${pathname}`);
  targetUrl.search = sourceUrl.search;
  return targetUrl;
}

function buildRequestHeaders(request: NextRequest) {
  const headers = new Headers();
  const contentType = request.headers.get("content-type");
  const accept = request.headers.get("accept");
  const cookie = request.headers.get("cookie");
  const authorization = request.headers.get("authorization");

  if (contentType) {
    headers.set("content-type", contentType);
  }
  if (accept) {
    headers.set("accept", accept);
  }
  if (cookie) {
    headers.set("cookie", cookie);
  }
  if (authorization) {
    headers.set("authorization", authorization);
  }

  return headers;
}

function buildResponseHeaders(response: Response) {
  const headers = new Headers();
  const contentType = response.headers.get("content-type");
  const location = response.headers.get("location");
  const setCookies =
    (response.headers as Headers & { getSetCookie?: () => string[] }).getSetCookie?.() ??
    [];
  const fallbackSetCookie = response.headers.get("set-cookie");

  if (contentType) {
    headers.set("content-type", contentType);
  }
  if (location) {
    headers.set("location", location);
  }
  if (setCookies.length > 0) {
    setCookies.forEach((cookie) => headers.append("set-cookie", cookie));
  } else if (fallbackSetCookie) {
    headers.set("set-cookie", fallbackSetCookie);
  }

  return headers;
}

async function proxy(request: NextRequest, context: RouteParams) {
  const { path } = await context.params;
  const body =
    request.method === "GET" || request.method === "HEAD"
      ? undefined
      : await request.arrayBuffer();

  const response = await fetch(buildTargetUrl(request, path), {
    method: request.method,
    headers: buildRequestHeaders(request),
    body,
    cache: "no-store",
    redirect: "manual",
  });

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: buildResponseHeaders(response),
  });
}

export {
  proxy as DELETE,
  proxy as GET,
  proxy as HEAD,
  proxy as PATCH,
  proxy as POST,
  proxy as PUT,
};
