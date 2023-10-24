import { Logo } from "@coaster/assets";

export const LogoLoading: React.FC = () => {
  return (
    <img
      src={Logo.src}
      className="
        tw-m-auto
        tw-w-36
        tw-h-36
        tw-justify-center
        tw-items-center
        tw-rounded
        tw-flex
        tw-my-auto
        tw-select-none
        tw-animate-shimmer
        [mask:linear-gradient(-60deg,#000_30%,#0005,#000_70%)_right/500%_100%]
        "
      alt="coaster logo"
    />
  );
};
