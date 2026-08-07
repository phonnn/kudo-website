import type { LabelHTMLAttributes, ReactNode } from "react";
import { Text } from "./text";

interface FieldProps extends LabelHTMLAttributes<HTMLLabelElement> {
  label: ReactNode;
  hint?: ReactNode;
}

export function Field({ label, hint, children, className, ...props }: FieldProps) {
  return (
    <label className={["ui-field", className].filter(Boolean).join(" ")} {...props}>
      <Text as="span" className="ui-field-label">
        <Text as="span">{label}</Text>
        {hint && <Text as="small">{hint}</Text>}
      </Text>
      {children}
    </label>
  );
}
