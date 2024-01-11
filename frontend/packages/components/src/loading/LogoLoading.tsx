import Logo from "@coaster/assets/logo.svg";
import Image from "next/image";

export const LogoLoading: React.FC = () => {
  return (
    <Image
      src={Logo}
      width={144}
      height={144}
      className="
        tw-m-auto
        tw-my-auto
        tw-flex
        tw-animate-shimmer
        tw-select-none
        tw-items-center
        tw-justify-center
        tw-rounded
        [mask:linear-gradient(-60deg,#000_30%,#0005,#000_70%)_right/500%_100%]
        "
      alt="coaster logo"
    />
  );
};
