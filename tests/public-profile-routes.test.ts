import assert from "node:assert/strict";
import test from "node:test";
import {
  fallbackPublicProfileUrl,
  parsePublicProfilePath,
  publicProfileHref,
  publicProfileLoginFromSearch,
} from "../utils/publicProfileRoutes";

test("public profile routes build shareable /u links", () => {
  assert.equal(publicProfileHref("ana-dev"), "/u/ana-dev");
  assert.equal(publicProfileHref("@ana dev"), "/u/ana%20dev");
  assert.equal(publicProfileHref(""), "/u");
});

test("public profile path parser recovers login from /u/:login", () => {
  assert.deepEqual(parsePublicProfilePath("/u/ana-dev"), {
    login: "ana-dev",
  });
  assert.deepEqual(parsePublicProfilePath("/u/ana%20dev"), {
    login: "ana dev",
  });
  assert.equal(parsePublicProfilePath("/settings/public-profile"), null);
});

test("public profile search parser supports static-export fallback", () => {
  assert.equal(publicProfileLoginFromSearch("login=ana-dev"), "ana-dev");
  assert.equal(publicProfileLoginFromSearch("q=ana-dev"), null);
});

test("public profile fallback URL prefers configured site origin", () => {
  process.env.NEXT_PUBLIC_DOTTI_SITE_URL = "https://dotti.work/";

  assert.equal(
    fallbackPublicProfileUrl("ana-dev"),
    "https://dotti.work/u/ana-dev",
  );
});
