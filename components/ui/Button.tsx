import type { ComponentProps, ReactNode } from "react";
import { Button as AnimateButton } from "@/components/animate-ui/primitives/buttons/button";
import { buttonClasses, type ButtonSize, type ButtonVariant } from "@/components/ui/buttonStyles";

export { buttonClasses };
export type { ButtonSize, ButtonVariant };

export function Button({
  children,
  className,
  variant = "primary",
  size = "md",
  ...props
}: Omit<ComponentProps<typeof AnimateButton>, "asChild" | "children"> & {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
}) {
  return (
    <AnimateButton
      className={buttonClasses({ variant, size, className })}
      hoverScale={props.disabled ? 1 : 1.03}
      tapScale={props.disabled ? 1 : 0.97}
      {...props}
    >
      {children}
    </AnimateButton>
  );
}
