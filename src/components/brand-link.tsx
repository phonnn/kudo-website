import Link from "next/link";
import { Text } from "./ui/text";

export function BrandLink() {
  return (
    <Link className="brand" href="/">
      <Text as="span" className="brand-mark">
        GJ
      </Text>
      <Text as="span" className="brand-name">
        Good Job
      </Text>
    </Link>
  );
}
