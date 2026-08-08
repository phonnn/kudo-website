"use client";

import { useState } from "react";
import Link from "next/link";
import { NotificationBell } from "@/features/notification/components/notification-bell";
import { BrandLink } from "@/components/brand-link";
import { Button } from "@/components/ui/button";
import { Surface } from "@/components/ui/surface";
import { Text } from "@/components/ui/text";

export type AppSection = "feed" | "profile" | "rewards";

const SECTIONS: { section: AppSection; href: string; label: string }[] = [
  { section: "feed", href: "/", label: "Feed" },
  { section: "rewards", href: "/rewards", label: "Rewards" },
  { section: "profile", href: "/profile", label: "My profile" },
];

function navigationClass(active: AppSection, section: AppSection) {
  if (active === section) {
    return "active";
  }

  return undefined;
}

function menuToggleLabel(menuOpen: boolean) {
  if (menuOpen) {
    return "Close menu";
  }

  return "Open menu";
}

function menuToggleIcon(menuOpen: boolean) {
  if (menuOpen) {
    return "✕";
  }

  return "☰";
}

export function AppHeader({ active }: { active: AppSection }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header>
      <BrandLink />
      <nav aria-label="Primary navigation">
        {SECTIONS.map(({ section, href, label }) => (
          <Link key={section} className={navigationClass(active, section)} href={href}>
            <Text as="span">{label}</Text>
          </Link>
        ))}
      </nav>
      <NotificationBell />
      <Link className="profile" href="/profile" aria-label="Open profile">
        AM
      </Link>
      <div className="menu-wrap">
        <Button
          variant="icon"
          className="menu-toggle"
          onClick={() => setMenuOpen((value) => !value)}
          aria-label={menuToggleLabel(menuOpen)}
          aria-expanded={menuOpen}
        >
          <Text as="span">{menuToggleIcon(menuOpen)}</Text>
        </Button>

        {menuOpen && (
          <Surface as="nav" className="mobile-nav-panel" aria-label="Primary navigation">
            {SECTIONS.map(({ section, href, label }) => (
              <Link
                key={section}
                className={navigationClass(active, section)}
                href={href}
                onClick={() => setMenuOpen(false)}
              >
                <Text as="span">{label}</Text>
              </Link>
            ))}
          </Surface>
        )}
      </div>
    </header>
  );
}
