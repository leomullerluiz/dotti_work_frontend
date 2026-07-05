import assert from "node:assert/strict";
import test from "node:test";
import { getRemoteListUiState } from "../services/dotti/remoteUiState";

test("remote list UI state covers loading, error, empty, and ready states", () => {
  assert.equal(
    getRemoteListUiState({
      isLoading: true,
      error: "Could not load matches",
      itemCount: 0,
    }),
    "loading",
  );

  assert.equal(
    getRemoteListUiState({
      error: "Could not load matches",
      itemCount: 0,
    }),
    "error",
  );

  assert.equal(
    getRemoteListUiState({
      itemCount: 0,
    }),
    "empty",
  );

  assert.equal(
    getRemoteListUiState({
      itemCount: 3,
    }),
    "ready",
  );
});
