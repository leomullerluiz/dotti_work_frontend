import { DottiApiError } from "./client";

type ApiErrorCopy = {
  unauthorized?: string;
  validation?: string;
  rateLimited?: string;
  unavailable?: string;
  fallback: string;
};

function validationDetailSummary(details: unknown) {
  if (!details || typeof details !== "object") {
    return null;
  }

  const entries = Object.entries(details as Record<string, unknown>);
  if (entries.length === 0) {
    return null;
  }

  return entries
    .slice(0, 3)
    .map(([field, value]) => {
      if (Array.isArray(value)) {
        return `${field}: ${value.join(", ")}`;
      }

      if (typeof value === "string" || typeof value === "number") {
        return `${field}: ${value}`;
      }

      return field;
    })
    .join("; ");
}

export function apiErrorMessage(error: unknown, copy: ApiErrorCopy) {
  if (!(error instanceof DottiApiError)) {
    return error instanceof Error ? error.message : copy.fallback;
  }

  if (error.status === 401) {
    return copy.unauthorized ?? "Your session expired. Sign in again to continue.";
  }

  if (error.status === 422) {
    const details = validationDetailSummary(error.details);
    const message =
      copy.validation ?? "Some fields were rejected by the API.";
    return details ? `${message} ${details}` : message;
  }

  if (error.status === 429) {
    return copy.rateLimited ?? "This action is temporarily rate limited. Try again shortly.";
  }

  if (error.status === 502 || error.status === 503) {
    return copy.unavailable ?? "The API is temporarily unavailable. Please retry shortly.";
  }

  return error.message;
}

export function apiErrorTitle(error: unknown, fallback = "Could not complete request") {
  if (!(error instanceof DottiApiError)) {
    return fallback;
  }

  if (error.status === 401) {
    return "Authentication required";
  }

  if (error.status === 422) {
    return "Validation failed";
  }

  if (error.status === 429) {
    return "Rate limited";
  }

  if (error.status === 502 || error.status === 503) {
    return "Service unavailable";
  }

  return fallback;
}
