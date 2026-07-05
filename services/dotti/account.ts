import { dottiRequest } from "./client";
import type { ApiLocalDataImport, ApiUserDataExport } from "./types";

export function exportMyData() {
  return dottiRequest<ApiUserDataExport>("/me/export");
}

export function importLocalData(input: ApiLocalDataImport) {
  return dottiRequest<ApiUserDataExport>("/me/import-local-data", {
    method: "POST",
    body: input,
  });
}

export function deleteMyAccount() {
  return dottiRequest<{ deleted: boolean }>("/me/account", {
    method: "DELETE",
  });
}
