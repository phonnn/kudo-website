"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";

const PUBLIC_ROUTES = new Set(["/login", "/register"]);

export function AuthGate({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isPublic = PUBLIC_ROUTES.has(pathname);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    if (isPublic) {
      setAuthenticated(false);
      return;
    }

    const hasSession = Boolean(localStorage.getItem("goodjob.accessToken"));
    setAuthenticated(hasSession);

    if (!hasSession) {
      let next = "";

      if (pathname !== "/") {
        next = `?next=${encodeURIComponent(pathname)}`;
      }

      router.replace(`/login${next}`);
    }
  }, [isPublic, pathname, router]);

  if (isPublic) {
    return children;
  }
  if (!authenticated) {
    return (
      <main className="auth-loading" aria-live="polite">
        Checking your session…
      </main>
    );
  }
  return children;
}
