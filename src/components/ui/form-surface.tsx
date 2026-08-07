import { forwardRef, type FormHTMLAttributes } from "react";

export const FormSurface = forwardRef<HTMLFormElement, FormHTMLAttributes<HTMLFormElement>>(
  function FormSurface({ className, ...props }, ref) {
    return <form ref={ref} className={["card", className].filter(Boolean).join(" ")} {...props} />;
  },
);
