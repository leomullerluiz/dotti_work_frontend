const HEX_COLOR = /^#[0-9a-f]{6}$/i;

const defaultFrameColors = {
  accent: "#f05d4f",
  ring: "#f8c14a",
  shadow: "#15202b",
  glow: "#f05d4f",
};

type ProfileFrameCssVariables = {
  "--profile-frame-accent": string;
  "--profile-frame-ring": string;
  "--profile-frame-shadow": string;
  "--profile-frame-glow": string;
};

function safeHexColor(value: unknown, fallback: string) {
  return typeof value === "string" && HEX_COLOR.test(value.trim())
    ? value.trim()
    : fallback;
}

export function profileFrameCssVariables(
  styleConfig?: Record<string, unknown> | null,
): ProfileFrameCssVariables {
  return {
    "--profile-frame-accent": safeHexColor(
      styleConfig?.accent,
      defaultFrameColors.accent,
    ),
    "--profile-frame-ring": safeHexColor(styleConfig?.ring, defaultFrameColors.ring),
    "--profile-frame-shadow": safeHexColor(
      styleConfig?.shadow,
      defaultFrameColors.shadow,
    ),
    "--profile-frame-glow": safeHexColor(styleConfig?.glow, defaultFrameColors.glow),
  };
}
