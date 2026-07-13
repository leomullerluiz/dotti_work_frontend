import assert from "node:assert/strict";
import test from "node:test";
import { profileFrameCssVariables } from "../utils/profileFrame";

test("profile frame style variables accept safe hex colors", () => {
  assert.deepEqual(
    profileFrameCssVariables({
      accent: "#123abc",
      ring: "#f8c14a",
      shadow: "#15202b",
      glow: "#ABCDEF",
    }),
    {
      "--profile-frame-accent": "#123abc",
      "--profile-frame-ring": "#f8c14a",
      "--profile-frame-shadow": "#15202b",
      "--profile-frame-glow": "#ABCDEF",
    },
  );
});

test("profile frame style variables fall back for missing or unsafe values", () => {
  assert.deepEqual(
    profileFrameCssVariables({
      accent: "url(javascript:alert(1))",
      ring: "#bad",
      shadow: "rgb(1, 2, 3)",
      glow: null,
    }),
    {
      "--profile-frame-accent": "#f05d4f",
      "--profile-frame-ring": "#f8c14a",
      "--profile-frame-shadow": "#15202b",
      "--profile-frame-glow": "#f05d4f",
    },
  );
});
