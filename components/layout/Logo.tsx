import Image from "next/image";
import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2" aria-label="dotti.work home">
      <Image
        src="/dotti-icon.svg"
        alt=""
        width={36}
        height={36}
        className="size-9 shrink-0 rounded-full shadow-lg shadow-coral-500/20"
        unoptimized
      />
      <span className="flex h-6 items-center">
        <Image
          src="/dotti-wordmark.svg"
          alt=""
          width={94}
          height={24}
          className="h-6 w-auto dark:hidden"
          unoptimized
        />
        <span className="hidden text-base font-semibold tracking-tight text-white dark:inline">
          dotti<span className="text-coral-500">.</span>work
        </span>
      </span>
    </Link>
  );
}
