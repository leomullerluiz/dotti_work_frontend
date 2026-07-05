import assert from "node:assert/strict";
import test from "node:test";
import { parseProjectDetailPath, projectDetailHref } from "../utils/projectRoutes";

test("project detail routes use static-export friendly query strings", () => {
  assert.equal(
    projectDetailHref("samuelloranger", "reelward"),
    "/projects?owner=samuelloranger&repo=reelward",
  );
});

test("legacy project detail paths can be recovered from 404", () => {
  assert.deepEqual(parseProjectDetailPath("/projects/samuelloranger/reelward"), {
    owner: "samuelloranger",
    repo: "reelward",
  });

  assert.equal(parseProjectDetailPath("/matches"), null);
});
