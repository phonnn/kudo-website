import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "ghost" | "icon";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

export function Button({ className, variant = "primary", type = "button", ...props }: ButtonProps) {
  const classes = ["ui-button", `ui-button-${variant}`, className].filter(Boolean).join(" ");

  return <button type={type} className={classes} {...props} />;
}
