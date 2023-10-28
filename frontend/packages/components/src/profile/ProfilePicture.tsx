import { mergeClasses } from "@coaster/utils/common";
import Image from "next/image";

export const ProfilePicture: React.FC<{
  url: string | undefined;
  name: string;
  className?: string;
  width: number;
  height: number;
  onClick?: () => void;
}> = ({ url, name, width, height, className, onClick }) => {
  return (
    <>
      {url ? (
        <Image
          width={width}
          height={height}
          src={url}
          className={mergeClasses(
            "tw-aspect-square tw-rounded-full tw-select-none tw-flex tw-items-center tw-justify-center tw-object-cover",
            className,
          )}
          referrerPolicy="no-referrer"
          alt="profile picture"
          onClick={onClick}
        />
      ) : (
        <div
          className={mergeClasses(
            "tw-bg-orange-400 tw-text-white tw-rounded-full tw-flex tw-justify-center tw-items-center",
            className,
          )}
          style={{
            width: width,
            height: height,
          }}
          onClick={onClick}
        >
          {name.charAt(0)}
        </div>
      )}
    </>
  );
};
