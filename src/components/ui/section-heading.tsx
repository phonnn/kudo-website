import type { ReactNode } from "react";
import { Eyebrow } from "./eyebrow";
import { Heading } from "./heading";

interface SectionHeadingProps {
  eyebrow: ReactNode;
  title: ReactNode;
}

export function SectionHeading({ eyebrow, title }: SectionHeadingProps) {
  return (
    <div className="section-title">
      <div>
        <Eyebrow>{eyebrow}</Eyebrow>
        <Heading>{title}</Heading>
      </div>
    </div>
  );
}
