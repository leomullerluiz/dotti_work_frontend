import assert from "node:assert/strict";
import test from "node:test";
import { inviteCodeFromSearch, inviteHref, inviteUrl } from "../utils/inviteRoutes";

test("invite route uses a static-export friendly query string", () => {
  assert.equal(
    inviteHref("q6m-G52ZJiF9R6a0kBbe-dXL"),
    "/invite/?code=q6m-G52ZJiF9R6a0kBbe-dXL",
  );
});

test("invite URL keeps the current origin", () => {
  assert.equal(
    inviteUrl("q6m-G52ZJiF9R6a0kBbe-dXL", "https://dotti.work"),
    "https://dotti.work/invite/?code=q6m-G52ZJiF9R6a0kBbe-dXL",
  );
});

test("invite code can be read from search params", () => {
  assert.equal(
    inviteCodeFromSearch("?code=q6m-G52ZJiF9R6a0kBbe-dXL"),
    "q6m-G52ZJiF9R6a0kBbe-dXL",
  );

  assert.equal(inviteCodeFromSearch("?utm=source"), "");
});
