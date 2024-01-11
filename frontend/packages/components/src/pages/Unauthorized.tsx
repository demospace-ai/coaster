import LongLogo from "@coaster/assets/long-logo.svg";
import Mail from "@coaster/assets/mail.svg";
import Image from "next/image";
import { NavLink } from "../link/Link";

export const Unauthorized: React.FC = () => {
  return (
    <div className="tw-flex tw-h-full tw-w-full tw-flex-row tw-bg-slate-100">
      <div className="tw-mx-auto tw-mb-auto tw-mt-56 tw-w-[400px] tw-select-none">
        <div className="tw-flex tw-flex-col tw-items-center tw-rounded-lg tw-bg-white tw-px-8 tw-pb-10 tw-pt-12 tw-shadow-md">
          <Image src={LongLogo} width={200} height={32} className="tw-mb-4 tw-select-none" alt="coaster logo" />
          <div className="tw-my-2 tw-text-center">
            <div className="tw-flex tw-flex-col tw-items-center tw-justify-center">
              <div className="tw-mt-4">
                <NavLink className="tw-text-blue-500" href="/signup">
                  Try again
                </NavLink>{" "}
                with a different account or{" "}
                <a className="tw-text-blue-500" href="mailto:founders@trycoaster.com">
                  contact us
                </a>{" "}
                to resolve your issue!
              </div>
              <Image src={Mail} alt="mail" width={144} height={144} className="tw-mt-5" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
