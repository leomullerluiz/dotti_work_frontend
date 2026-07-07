import assert from "node:assert/strict";
import test from "node:test";
import { inviteFallbackHref, parseInvitePath } from "../utils/inviteRoutes";

test("invite fallback route keeps the invite code in query string", () => {
  assert.equal(inviteFallbackHref("AbC123xYz"), "/invite/_?code=AbC123xYz");
});

test("invite paths can be recovered from static export 404", () => {
  assert.deepEqual(parseInvitePath("/invite/AbC123xYz"), {
    code: "AbC123xYz",
  });

  assert.deepEqual(parseInvitePath("/invite/code%20with%20space"), {
    code: "code with space",
  });

  assert.equal(parseInvitePath("/matches"), null);
});
