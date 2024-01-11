"use client";

import { lateef, mergeClasses } from "@coaster/utils/common";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
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
        "tw-z-10 tw-mt-auto tw-flex tw-w-full tw-flex-col tw-items-center tw-justify-center tw-border-t tw-border-solid tw-border-slate-200 tw-bg-gray-50 tw-px-5 tw-py-8 xs:tw-px-8 sm:tw-px-20",
        hasMobileFooter && "tw-mb-20 md:tw-mb-0",
      )}
    >
      <div className="tw-flex tw-w-full tw-max-w-7xl tw-flex-wrap tw-justify-start tw-gap-x-16 tw-gap-y-8 sm:tw-justify-between sm:tw-gap-x-20">
        <div className="tw-flex tw-flex-col tw-gap-1">
          <div
            translate="no"
            className={mergeClasses(
              lateef.className,
              "-tw-mt-5 tw-select-none tw-overflow-hidden tw-whitespace-nowrap tw-text-[40px] tw-font-extrabold tw-tracking-[-0.5px]",
            )}
          >
            Coaster
          </div>
          <div className="tw-mb-2 tw-font-semibold">Newsletter</div>
          <div className="tw-mb-2 tw-w-80">We send occasional updates on new trips, stories, and discounts.</div>
          <NewsletterForm />
        </div>
        <div className="tw-flex tw-flex-col tw-gap-1">
          <div className="tw-mb-2 tw-font-semibold">Company</div>
          <Link href="/about">About</Link>
          <Link href="/blog">Blog</Link>
          <Link href="/careers">Careers</Link>
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
          <Link href="/sustainability">Sustainability</Link>
        </div>
        <div className="tw-flex tw-flex-col tw-gap-1">
          <div className="tw-mb-2 tw-font-semibold">Locations</div>
          <Link href="/search?location=Lisbon">Portugal</Link>
          <Link href="/search?location=El+Salvador">El Salvador</Link>
          <Link href="/search?location=Nepal">Nepal</Link>
          <Link href="/search?location=San+Francisco">San Francisco</Link>
          <Link href="/search?location=New+Hampshire">New Hampshire</Link>
          <Link href="/search?location=Sandgate+QLD+Australia">Australia</Link>
        </div>
        <div className="tw-flex tw-flex-col tw-gap-1">
          <div className="tw-mb-2 tw-font-semibold">Get in touch</div>
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
          <Link href="/request-trip">Request a Trip</Link>
        </div>
        <div className="tw-flex tw-flex-col tw-gap-1">
          <div className="tw-mb-2 tw-font-semibold">Guides / Suppliers</div>
          <Link href="https://supplier.trycoaster.com">Supplier Portal</Link>
          <Link href="https://supplier.trycoaster.com">Apply as a guide</Link>
        </div>
      </div>

      <div className="tw-mt-20 tw-flex tw-w-full tw-max-w-7xl tw-items-center tw-justify-between tw-whitespace-nowrap tw-text-xs sm:tw-text-sm">
        <span className="tw-select-none">© 2023 Coaster, Inc.</span>
        <div className="tw-flex tw-gap-3 sm:tw-gap-5">
          <Link href="/terms">Terms</Link>
          <Link href="/privacy">Privacy Policy</Link>
        </div>
      </div>
    </div>
  );
};

const NewsletterForm: React.FC = () => {
  const INIT = "INIT";
  const SUBMITTING = "SUBMITTING";
  const SUCCESS = "SUCCESS";
  const FormStates = [INIT, SUBMITTING, SUCCESS] as const;
  const [email, setEmail] = useState("");
  const [formState, setFormState] = useState<(typeof FormStates)[number]>(INIT);
  const [errorMessage, setErrorMessage] = useState("");

  const resetForm = () => {
    setEmail("");
    setFormState(INIT);
    setErrorMessage("");
  };

  /**
   * Rate limit the number of submissions allowed
   * @returns {boolean} true if the form has been successfully submitted in the past minute
   */
  const hasRecentSubmission = (): boolean => {
    const time = new Date();
    const timestamp = time.valueOf();
    const previousTimestamp = localStorage.getItem("loops-form-timestamp");

    // Indicate if the last sign up was less than a minute ago
    if (previousTimestamp && Number(previousTimestamp) + 60 * 1000 > timestamp) {
      setErrorMessage("Too many signups, please try again in a little while");
      return true;
    }

    localStorage.setItem("loops-form-timestamp", timestamp.toString());
    return false;
  };

  const isValidEmail = (email: any) => {
    return /.+@.+/.test(email);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    // Prevent the default form submission
    event.preventDefault();

    // boundary conditions for submission
    if (formState !== INIT) return;
    if (!isValidEmail(email)) {
      setErrorMessage("Please enter a valid email");
      return;
    }
    if (hasRecentSubmission()) return;
    setFormState(SUBMITTING);

    // build body
    const formBody = `userGroup=newsletter&email=${encodeURIComponent(email)}`;

    // API request to add user to newsletter
    fetch("https://app.loops.so/api/newsletter-form/clgzfa7c40052l70fomrecqid", {
      method: "POST",
      body: formBody,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    })
      .then((res: any) => [res.ok, res.json(), res])
      .then(([ok, dataPromise, res]) => {
        if (ok) {
          resetForm();
          setFormState(SUCCESS);
        } else {
          dataPromise.then((data: any) => {
            setErrorMessage(data.message || res.statusText);
            localStorage.setItem("loops-form-timestamp", "");
          });
        }
      })
      .catch((error) => {
        // check for cloudflare error
        if (error.message === "Failed to fetch") {
          setErrorMessage("Too many signups, please try again in a little while");
        } else if (error.message) {
          setErrorMessage(error.message);
        }
        localStorage.setItem("loops-form-timestamp", "");
      });
  };

  switch (formState) {
    case SUCCESS:
      return <p className="tw-text-green-700">Success!</p>;
    default:
      return (
        <>
          <form onSubmit={handleSubmit} className="tw-flex tw-gap-2">
            <Input
              type="text"
              name="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required={true}
              className="tw-w-50 tw-h-8 tw-text-sm"
            />
            <Button type="submit" className="tw-text-sm tw-font-medium">
              {formState === SUBMITTING ? "Please wait..." : "Subscribe"}
            </Button>
          </form>
          <p className="tw-text-red-500">{errorMessage}</p>
        </>
      );
  }
};
