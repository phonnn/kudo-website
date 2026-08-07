import type { HTMLAttributes } from "react";
import { Text } from "./text";

interface AvatarProps extends HTMLAttributes<HTMLSpanElement> {
  initials: string;
  size?: "small" | "medium" | "large";
}

export function Avatar({ initials, size = "medium", className, ...props }: AvatarProps) {
  const classes = ["avatar", `avatar-${size}`, className].filter(Boolean).join(" ");

  return (
    <Text as="span" className={classes} aria-hidden="true" {...props}>
      {initials}
    </Text>
  );
}
