"use client";

import type { ComponentPropsWithoutRef } from "react";
import { Fade } from "@/components/animate-ui/primitives/effects/fade";

const surfaceTransition = { duration: 0.28, ease: "easeOut" } as const;

export function AnimatedDiv(props: ComponentPropsWithoutRef<"div">) {
  return (
    <Fade
      asChild
      inView
      inViewOnce
      initialOpacity={0}
      transition={surfaceTransition}
    >
      <div {...props} />
    </Fade>
  );
}

export function AnimatedSection(props: ComponentPropsWithoutRef<"section">) {
  return (
    <Fade
      asChild
      inView
      inViewOnce
      initialOpacity={0}
      transition={surfaceTransition}
    >
      <section {...props} />
    </Fade>
  );
}

export function AnimatedArticle(props: ComponentPropsWithoutRef<"article">) {
  return (
    <Fade
      asChild
      inView
      inViewOnce
      initialOpacity={0}
      transition={surfaceTransition}
    >
      <article {...props} />
    </Fade>
  );
}

export function AnimatedAside(props: ComponentPropsWithoutRef<"aside">) {
  return (
    <Fade
      asChild
      inView
      inViewOnce
      initialOpacity={0}
      transition={surfaceTransition}
    >
      <aside {...props} />
    </Fade>
  );
}

export function AnimatedHeader(props: ComponentPropsWithoutRef<"header">) {
  return (
    <Fade
      asChild
      inView
      inViewOnce
      initialOpacity={0}
      transition={surfaceTransition}
    >
      <header {...props} />
    </Fade>
  );
}

export function AnimatedDetails(props: ComponentPropsWithoutRef<"details">) {
  return (
    <Fade
      asChild
      inView
      inViewOnce
      initialOpacity={0}
      transition={surfaceTransition}
    >
      <details {...props} />
    </Fade>
  );
}
