import type { ReactNode } from "react";
import { Text } from "./text";

export function FormError({ children }: { children: ReactNode }) {
  return (
    <Text className="error" role="alert">
      {children}
    </Text>
  );
}
