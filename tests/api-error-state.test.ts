import assert from "node:assert/strict";
import test from "node:test";

process.env.NEXT_PUBLIC_DOTTI_API_BASE_URL = "http://localhost/api";

test("apiErrorState maps authentication, validation, rate limit, and outage states", async () => {
  const { apiErrorMessage, apiErrorTitle } = await import(
    "../services/dotti/apiErrorState"
  );
  const { DottiApiError } = await import("../services/dotti/client");

  assert.equal(
    apiErrorTitle(
      new DottiApiError({
        status: 401,
        message: "Unauthorized",
      }),
    ),
    "Authentication required",
  );

  assert.equal(
    apiErrorMessage(
      new DottiApiError({
        status: 401,
        message: "Unauthorized",
      }),
      {
        fallback: "Fallback",
        unauthorized: "Sign in again.",
      },
    ),
    "Sign in again.",
  );

  assert.equal(
    apiErrorMessage(
      new DottiApiError({
        status: 422,
        message: "Invalid",
        details: {
          seniority: ["Invalid seniority"],
          role: "Required",
        },
      }),
      {
        fallback: "Fallback",
        validation: "Validation failed.",
      },
    ),
    "Validation failed. seniority: Invalid seniority; role: Required",
  );

  assert.equal(
    apiErrorMessage(
      new DottiApiError({
        status: 429,
        message: "Too many requests",
      }),
      {
        fallback: "Fallback",
        rateLimited: "Try later.",
      },
    ),
    "Try later.",
  );

  assert.equal(
    apiErrorMessage(
      new DottiApiError({
        status: 502,
        message: "Bad gateway",
      }),
      {
        fallback: "Fallback",
        unavailable: "Unavailable.",
      },
    ),
    "Unavailable.",
  );

  assert.equal(
    apiErrorTitle(
      new DottiApiError({
        status: 503,
        message: "Down",
      }),
    ),
    "Service unavailable",
  );
});
