export type RemoteListUiState = "loading" | "error" | "empty" | "ready";

export type RemoteListUiStateInput = {
  isLoading?: boolean;
  error?: string | null;
  itemCount: number;
};

export function getRemoteListUiState({
  isLoading = false,
  error = null,
  itemCount,
}: RemoteListUiStateInput): RemoteListUiState {
  if (isLoading) {
    return "loading";
  }

  if (error) {
    return "error";
  }

  if (itemCount === 0) {
    return "empty";
  }

  return "ready";
}
