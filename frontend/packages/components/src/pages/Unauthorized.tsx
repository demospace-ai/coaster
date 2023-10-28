import { LongLogo, Mail } from "@coaster/assets";
import Image from "next/image";
import { NavLink } from "../link/Link";

export const Unauthorized: React.FC = () => {
  return (
    <div className="tw-flex tw-flex-row tw-h-full tw-w-full tw-bg-slate-100">
      <div className="tw-mt-56 tw-mb-auto tw-mx-auto tw-w-[400px] tw-select-none">
        <div className="tw-flex tw-flex-col tw-pt-12 tw-pb-10 tw-px-8 tw-rounded-lg tw-shadow-md tw-bg-white tw-items-center">
          <Image src={LongLogo.src} width={200} height={32} className="tw-select-none tw-mb-4" alt="coaster logo" />
          <div className="tw-text-center tw-my-2">
            <div className="tw-flex tw-flex-col tw-justify-center tw-items-center">
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
              <Image src={Mail.src} alt="mail" width={144} height={144} className="tw-mt-5" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
