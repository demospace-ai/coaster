import LogoLoadingImage from "@coaster/assets/logo-loading.svg";
import { mergeClasses } from "@coaster/utils/common";
import Image from "next/image";

export const LogoLoading: React.FC<{ className: string }> = ({ className }) => {
  return (
    <Image
      src={LogoLoadingImage}
      width={144}
      height={144}
      className={mergeClasses(
        className,
        "tw-m-auto tw-justify-center tw-items-center tw-rounded tw-flex tw-my-auto tw-select-none tw-animate-shimmer [mask:linear-gradient(-60deg,#000_30%,#0005,#000_70%)_right/500%_100%]",
      )}
      alt="coaster logo"
    />
  );
};
