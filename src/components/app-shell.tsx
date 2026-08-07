import type { ReactNode } from "react";
import { AppHeader, type AppSection } from "./app-header";
import { Text } from "./ui/text";

interface AppShellProps {
  active: AppSection;
  children: ReactNode;
  mainClassName?: string;
}

export function AppShell({ active, children, mainClassName }: AppShellProps) {
  return (
    <>
      <AppHeader active={active} />
      <main className={mainClassName}>{children}</main>
      <footer>
        <Text as="small">Good Job · Built for better teams</Text>
      </footer>
    </>
  );
}
