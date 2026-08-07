"use client";
/* eslint-disable @next/next/no-img-element -- reward image URLs are managed by the backend */

import { useState } from "react";
import { Text } from "@/components/ui/text";

type RewardImageProps = {
  imageUrl: string | null;
  name: string;
  fallback: string;
};

export function RewardImage({ imageUrl, name, fallback }: RewardImageProps) {
  const [failed, setFailed] = useState(false);

  if (!imageUrl || failed) {
    return (
      <div className="reward-art reward-art-fallback" aria-label={name}>
        <Text as="span">{fallback}</Text>
      </div>
    );
  }

  return (
    <div className="reward-art">
      <img src={imageUrl} alt={name} onError={() => setFailed(true)} />
    </div>
  );
}
