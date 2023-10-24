"use client";

import { mergeClasses } from "@coaster/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavLink({
  href,
  className,
  activeClassName,
  children,
}: {
  href: string;
  className?: string;
  activeClassName?: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link href={href} className={mergeClasses(className, isActive && activeClassName)}>
      {children}
    </Link>
  );
}
