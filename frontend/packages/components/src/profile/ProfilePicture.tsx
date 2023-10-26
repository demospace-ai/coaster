import { mergeClasses } from "@coaster/utils/common";

export const ProfilePicture: React.FC<{
  url: string | undefined;
  name: string;
  className?: string;
  onClick?: () => void;
}> = ({ url, name, className, onClick }) => {
  return (
    <>
      {url ? (
        <img
          src={url}
          className={mergeClasses(
            "tw-rounded-full tw-select-none tw-flex tw-items-center tw-justify-center tw-object-cover",
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
          onClick={onClick}
        >
          {name.charAt(0)}
        </div>
      )}
    </>
  );
};
