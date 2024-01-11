"use client";

export const HelpButton: React.FC = () => {
  return (
    <span
      className="tw-cursor-pointer tw-underline"
      onClick={() => {
        if ((window as any).Atlas) {
          (window as any).Atlas.chat.openWindow();
        }
      }}
    >
      Send us a message.
    </span>
  );
};
