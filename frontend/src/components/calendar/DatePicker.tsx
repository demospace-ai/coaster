import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import * as React from "react";
import { DayPicker, DayPickerProps } from "react-day-picker";

export const DateRangePicker: React.FC<DayPickerProps> = ({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}) => {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={className}
      classNames={{
        months: "tw-flex tw-flex-col sm:tw-flex-row tw-space-y-4 sm:tw-space-x-4 sm:tw-space-y-0",
        month: "tw-space-y-4 tw-border-0 sm:tw-border tw-p-4 tw-rounded-lg",
        caption: "tw-flex tw-justify-center tw-pt-1 tw-relative tw-items-center",
        caption_label: "tw-text-sm tw-font-medium",
        nav: "tw-space-x-1 tw-flex tw-items-center",
        nav_button:
          "hover:tw-bg-slate-500 hover:tw-text-white tw-h-6 tw-w-6 tw-bg-transparent tw-p-0 tw-opacity-50 hover:tw-opacity-100",
        nav_button_previous: "tw-absolute tw-left-1",
        nav_button_next: "tw-absolute tw-right-1",
        table: "tw-w-full tw-border-collapse tw-space-y-1",
        head_row: "tw-flex",
        head_cell: "tw-text-slate-200 tw-rounded-md tw-w-9 tw-font-normal tw-text-sm",
        row: "tw-flex tw-w-full tw-mt-2",
        cell: "tw-text-center tw-text-sm tw-p-0 tw-relative focus-within:tw-relative focus-within:tw-z-20",
        day: "tw-h-9 tw-w-9 tw-p-0 tw-font-normal aria-selected:tw-opacity-100 hover:tw-bg-blue-500 hover:tw-text-white tw-rounded tw-flex tw-items-center tw-justify-center tw-cursor-pointer",
        day_today: "tw-bg-slate-300 tw-text-black",
        day_selected: "!tw-bg-blue-600 tw-text-white hover:tw-bg-blue-500",
        day_outside: "tw-text-slate-200 tw-opacity-50",
        day_disabled: "tw-text-slate-200 tw-opacity-50",
        day_range_middle: "aria-selected:!tw-bg-blue-500 aria-selected:tw-text-white",
        day_hidden: "tw-invisible",
        ...classNames,
      }}
      components={{
        IconLeft: () => <ChevronLeftIcon className="h-4 w-4" />,
        IconRight: () => <ChevronRightIcon className="h-4 w-4" />,
      }}
      {...props}
    />
  );
};
