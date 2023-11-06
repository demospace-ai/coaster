"use client";

export const HelpButton: React.FC = () => {
  return (
    <span
      className="tw-underline tw-cursor-pointer"
      onClick={() => {
        if ((window as any).Intercom) {
          (window as any).Intercom("show");
        }
      }}
    >
      Send us a message.
    </span>
  );
};
