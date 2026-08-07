import Link from "next/link";
import { NotificationBell } from "@/features/notification/components/notification-bell";
import { BrandLink } from "@/components/brand-link";
import { Text } from "@/components/ui/text";

export type AppSection = "feed" | "profile" | "rewards";

function navigationClass(active: AppSection, section: AppSection) {
  if (active === section) {
    return "active";
  }

  return undefined;
}

export function AppHeader({ active }: { active: AppSection }) {
  return (
    <header>
      <BrandLink />
      <nav aria-label="Primary navigation">
        <Link className={navigationClass(active, "feed")} href="/">
          <Text as="span">Feed</Text>
        </Link>
        <Link className={navigationClass(active, "rewards")} href="/rewards">
          <Text as="span">Rewards</Text>
        </Link>
        <Link className={navigationClass(active, "profile")} href="/profile">
          <Text as="span">My profile</Text>
        </Link>
      </nav>
      <NotificationBell />
      <Link className="profile" href="/profile" aria-label="Open profile">
        AM
      </Link>
    </header>
  );
}
