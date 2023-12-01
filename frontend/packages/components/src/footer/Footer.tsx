"use client";

import { lateef, mergeClasses } from "@coaster/utils/common";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "../button/Button";
import { Input } from "../input/Input";

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
        "tw-z-10 tw-flex tw-flex-col tw-justify-center tw-items-center tw-w-full tw-px-5 xs:tw-px-8 sm:tw-px-20 tw-py-8 tw-border-t tw-border-solid tw-border-slate-200 tw-mt-auto tw-bg-gray-50",
        hasMobileFooter && "tw-mb-20 md:tw-mb-0",
      )}
    >
      <div className="tw-flex tw-flex-wrap tw-w-full tw-max-w-7xl tw-gap-y-8 tw-gap-x-16 sm:tw-gap-x-20 tw-justify-start sm:tw-justify-between">
        <div className="tw-flex tw-flex-col tw-gap-1">
          <div
            translate="no"
            className={mergeClasses(
              lateef.className,
              "tw-whitespace-nowrap tw-overflow-hidden tw-select-none tw-tracking-[-0.5px] -tw-mt-5 tw-font-extrabold tw-text-[40px]",
            )}
          >
            Coaster
          </div>
          <div className="tw-font-semibold tw-mb-2">Newsletter</div>
          <div className="tw-w-80 tw-mb-2">We send occasional updates on new trips, stories, and discounts.</div>
          <div className="tw-flex tw-gap-2">
            <Input className="tw-w-48 tw-h-8" value={""} />
            <Button className="tw-font-medium">Subscribe</Button>
          </div>
        </div>
        <div className="tw-flex tw-flex-col tw-gap-1">
          <div className="tw-font-semibold tw-mb-2">Company</div>
          <Link href="https://www.trycoaster.com/about">About</Link>
          <Link href="https://www.trycoaster.com/blog">Blog</Link>
          <Link href="https://www.trycoaster.com/careers">Careers</Link>
          <button
            className="tw-flex"
            onClick={() => {
              if ((window as any).Atlas) {
                (window as any).Atlas.chat.openWindow();
              }
            }}
          >
            Help
          </button>
          <Link href="https://www.trycoaster.com/sustainability">Sustainability</Link>
        </div>
        <div className="tw-flex tw-flex-col tw-gap-1">
          <div className="tw-font-semibold tw-mb-2">Locations</div>
          <Link href="https://www.trycoaster.com/search?location=Lisbon">Portugal</Link>
          <Link href="https://www.trycoaster.com/search?location=El+Salvador">El Salvador</Link>
          <Link href="https://www.trycoaster.com/search?location=Nepal">Nepal</Link>
          <Link href="https://www.trycoaster.com/search?location=San+Francisco">San Francisco</Link>
          <Link href="https://www.trycoaster.com/search?location=New+Hampshire">New Hampshire</Link>
          <Link href="https://www.trycoaster.com/search?location=Sandgate+QLD+Australia">Australia</Link>
        </div>
        <div className="tw-flex tw-flex-col tw-gap-1">
          <div className="tw-font-semibold tw-mb-2">Get in touch</div>
          <button
            className="tw-flex"
            onClick={() => {
              if ((window as any).Atlas) {
                (window as any).Atlas.chat.openWindow();
              }
            }}
          >
            Chat
          </button>
          <Link href="https://twitter.com/coasterguides">Twitter</Link>
          <Link href="https://www.instagram.com/coasterguides">Instagram</Link>
          <Link href="mailto:info@trycoaster.com">Email</Link>
        </div>
        <div className="tw-flex tw-flex-col tw-gap-1">
          <div className="tw-font-semibold tw-mb-2">Guides / Suppliers</div>
          <Link href="https://supplier.trycoaster.com">Supplier Portal</Link>
          <Link href="https://supplier.trycoaster.com">Apply as a guide</Link>
        </div>
      </div>

      <div className="tw-flex tw-w-full tw-max-w-7xl tw-items-center tw-justify-between tw-text-xs sm:tw-text-sm tw-whitespace-nowrap tw-mt-20">
        <span className="tw-select-none">© 2023 Coaster, Inc.</span>
        <div className="tw-flex tw-gap-3 sm:tw-gap-5">
          <Link href="https://www.trycoaster.com/terms">Terms</Link>
          <Link href="https://www.trycoaster.com/privacy">Privacy Policy</Link>
        </div>
      </div>
    </div>
  );
};
