"use client";

import { mergeClasses } from "@coaster/utils/common";
import Link from "next/link";
import { usePathname } from "next/navigation";

export const Footer: React.FC = () => {
  // TODO: do this better - this is to account for the extra footer on the listing page on mobile
  const pathname = usePathname();
  const pathTokens = pathname ? pathname.split("/") : [];
  const path = pathTokens[1];
  const isNew = pathTokens[2] === "new";
  const isEdit = pathTokens[3] === "edit";
  const hasMobileFooter = path === "listings" && !isNew && !isEdit;

  return (
    <div
      className={mergeClasses(
        "tw-z-10 tw-flex tw-box-border tw-text-xs sm:tw-text-sm tw-whitespace-nowrap tw-max-h-[40px] tw-min-h-[40px] sm:tw-max-h-[40px] sm:tw-min-h-[40px] tw-w-full tw-px-5 xs:tw-px-8 sm:tw-px-20 tw-py-6 tw-items-center tw-justify-between tw-border-t tw-border-solid tw-border-slate-200 tw-mt-auto tw-bg-gray-50",
        hasMobileFooter && "tw-mb-20 md:tw-mb-0",
      )}
    >
      <span className="tw-select-none">© 2023 Coaster, Inc.</span>
      <div className="tw-flex tw-gap-3 sm:tw-gap-5">
        <Link href="https://www.trycoaster.com/blog">Blog</Link>
        <Link href="https://www.trycoaster.com/about">About</Link>
        <Link href="https://www.trycoaster.com/terms">Terms</Link>
        <Link href="https://www.trycoaster.com/privacy">Privacy Policy</Link>
      </div>
    </div>
  );
};
