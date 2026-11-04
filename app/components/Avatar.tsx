import { existsSync } from "node:fs";
import path from "node:path";
import Image from "next/image";
import { site } from "../site";

// 60px round portrait. Drop a square photo at public/avatar.jpg to use it;
// until then a neutral monogram holds the spot.
export default function Avatar() {
  const hasPhoto = existsSync(path.join(process.cwd(), "public", "avatar.jpg"));

  if (hasPhoto) {
    return (
      <Image
        src="/avatar.jpg"
        alt={site.name}
        width={128}
        height={128}
        draggable={false}
        className="mb-8 select-none rounded-full"
        priority
      />
    );
  }

  return (
    <div
      aria-hidden="true"
      className="mb-8 flex h-32 w-32 select-none items-center justify-center rounded-full bg-surface text-lg font-semibold text-tertiary ring-1 ring-line-soft"
    >
      ER
    </div>
  );
}
