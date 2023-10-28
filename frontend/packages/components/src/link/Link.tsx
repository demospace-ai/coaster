"use client";

import { mergeClasses } from "@coaster/utils/common";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavLink({
  href,
  className,
  activeClassName,
  children,
  fullMatch = true,
}: {
  href: string;
  className?: string;
  activeClassName?: string;
  children: React.ReactNode;
  fullMatch?: boolean;
}) {
  const pathname = usePathname();
  const isActive = fullMatch ? pathname === href : pathname.startsWith(href);

  return (
    <Link href={href} className={mergeClasses(className, isActive && activeClassName)}>
      {children}
    </Link>
  );
}
