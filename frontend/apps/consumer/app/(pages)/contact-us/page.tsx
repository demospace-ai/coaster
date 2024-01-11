import { ContactUs } from "app/(pages)/contact-us/client";

export default function Page() {
  return (
    <main className="tw-mt-6 tw-flex tw-w-full tw-flex-col tw-items-center tw-px-5 tw-pb-16 sm:tw-mt-10 sm:tw-px-20 sm:tw-pb-32">
      <div className="tw-max-w tw-flex tw-w-full tw-flex-col tw-items-center tw-text-base">
        <h1 className="tw-mb-4 tw-text-4xl tw-font-bold sm:tw-mb-6 sm:tw-text-5xl">Contact Us</h1>
        <h2 className="tw-mb-2 tw-text-lg tw-font-semibold">Have a question?</h2>
        <h3>We'd love to hear from you. Ask us anything and we'll get back to you within 24 hours.</h3>
        <ContactUs />
      </div>
    </main>
  );
}
