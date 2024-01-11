import { mergeClasses } from "@coaster/utils/common";
import { UserIcon } from "@heroicons/react/24/solid";
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
            "tw-flex tw-aspect-square tw-select-none tw-items-center tw-justify-center tw-rounded-full tw-object-cover",
            className,
          )}
          referrerPolicy="no-referrer"
          alt="profile picture"
          onClick={onClick}
        />
      ) : (
        <div
          className={mergeClasses(
            "tw-flex tw-aspect-square tw-items-center tw-justify-center tw-rounded-full tw-bg-orange-400 tw-text-white",
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

export const ProfilePlaceholder: React.FC<{
  className?: string;
  width: number;
  height: number;
  onClick?: () => void;
}> = ({ width, height, className, onClick }) => {
  return (
    <div
      className={mergeClasses(
        "tw-flex tw-items-center tw-justify-center tw-rounded-full tw-bg-gray-400 tw-text-white",
        className,
      )}
      onClick={onClick}
    >
      <UserIcon
        className="tw-p-1"
        style={{
          width: width,
          height: height,
        }}
      />
    </div>
  );
};
