"use client";

import { mergeClasses, useIsMobile } from "@coaster/utils";
import {
  FloatingFocusManager,
  autoUpdate,
  offset,
  shift,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
  useRole,
  useTransitionStyles,
} from "@floating-ui/react";
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { DateRange, DayPicker, DayPickerProps, DayPickerSingleProps } from "react-day-picker";
import { Loading } from "../loading/Loading";
export const DateRangePicker: React.FC<DayPickerProps> = ({
  className,
  classNames = {},
  showOutsideDays = false,
  ...props
}) => {
  const isMobile = useIsMobile();
  const numberOfMonths = props.numberOfMonths ? props.numberOfMonths : isMobile ? 1 : 2;

  const { month, nav_button, caption, ...rest } = classNames;

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={mergeClasses("tw-w-full tw-select-none", className)}
      numberOfMonths={numberOfMonths}
      classNames={{
        months: "tw-flex tw-flex-col sm:tw-flex-row tw-w-full tw-space-y-4 sm:tw-space-x-4 sm:tw-space-y-0",
        month: mergeClasses(
          "tw-flex tw-flex-col tw-w-full tw-space-y-4 tw-border-0 sm:tw-border sm:tw-p-4 tw-rounded-lg",
          month,
        ),
        caption: mergeClasses("tw-flex tw-justify-center tw-pt-1 tw-relative tw-items-center", caption),
        caption_label: "tw-text-sm tw-font-medium",
        nav: "tw-space-x-1 tw-flex tw-items-center",
        nav_button: mergeClasses(
          "tw-h-6 tw-w-6 tw-bg-transparent tw-p-0 tw-opacity-50 hover:tw-opacity-100 tw-rounded-lg",
          nav_button,
        ),
        nav_button_previous: "tw-absolute tw-left-1",
        nav_button_next: "tw-absolute tw-right-1",
        table: "tw-w-full tw-border-collapse tw-space-y-1",
        head_row: "tw-flex",
        head_cell: "tw-text-slate-200 tw-rounded-md tw-w-full tw-font-normal tw-text-sm",
        row: "tw-flex tw-w-full tw-mt-2",
        cell: "tw-w-full tw-aspect-square tw-text-center tw-text-sm tw-p-0 tw-relative focus-within:tw-relative focus-within:tw-z-20",
        day: "tw-w-full tw-h-full tw-p-0 tw-font-normal aria-selected:tw-opacity-100 hover:tw-bg-blue-500 hover:tw-text-white tw-rounded tw-flex tw-items-center tw-justify-center tw-cursor-pointer",
        day_today: "tw-bg-slate-300 tw-text-black",
        day_selected: "!tw-bg-blue-600 tw-text-white hover:tw-bg-blue-500",
        day_outside: "tw-text-slate-400 tw-opacity-50",
        day_disabled:
          "tw-text-slate-400 tw-opacity-50 !tw-cursor-not-allowed hover:tw-bg-slate-200 hover:tw-text-slate-400",
        day_range_middle: "aria-selected:!tw-bg-blue-500 aria-selected:tw-text-white",
        day_hidden: "tw-invisible",
        ...rest,
      }}
      components={{
        IconLeft: () => <ChevronLeftIcon />,
        IconRight: () => <ChevronRightIcon />,
        ...props.components,
      }}
      {...props}
    />
  );
};

export const DatePickerPopper: React.FC<
  Omit<DayPickerSingleProps, "mode" | "onSelect"> & {
    buttonClass?: string;
    onSelect: (selected: Date | undefined) => void;
    loading?: boolean;
  }
> = ({ className, classNames, buttonClass, onSelect, loading, showOutsideDays = true, ...props }) => {
  const [open, setOpen] = useState(false);

  const { refs, floatingStyles, context } = useFloating({
    open: open,
    onOpenChange: setOpen,
    middleware: [offset(10), shift()],
    whileElementsMounted: autoUpdate,
    placement: "bottom-start",
  });

  const click = useClick(context);
  const dismiss = useDismiss(context);
  const role = useRole(context);

  const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss, role]);

  const { isMounted, styles: transitionStyles } = useTransitionStyles(context, {
    duration: 100,
    initial: {
      opacity: 0,
      scale: "0.95",
    },
  });

  return (
    <div className={className}>
      <button
        className={mergeClasses(
          "tw-flex tw-border tw-border-solid tw-border-gray-300 tw-rounded-lg tw-justify-start tw-items-center tw-cursor-pointer tw-whitespace-nowrap",
          buttonClass,
        )}
        ref={refs.setReference}
        {...getReferenceProps()}
      >
        <CalendarIcon className="tw-w-5 tw-ml-4 tw-mr-3 -tw-mt-[1.5px]" />
        {props.selected ? props.selected.toLocaleDateString() : "Select a date"}
      </button>
      {isMounted && (
        <FloatingFocusManager context={context}>
          <div ref={refs.setFloating} style={floatingStyles} {...getFloatingProps()}>
            <div style={transitionStyles} className="tw-bg-white tw-rounded-lg tw-shadow-md">
              <DateRangePicker
                mode="single"
                className="tw-w-[320px]"
                numberOfMonths={1}
                onSelect={(e: Date | undefined) => {
                  setOpen(false);
                  onSelect && onSelect(e);
                }}
                {...props}
                components={loading ? { Day: () => <Loading className="tw-opacity-30" /> } : {}}
              />
            </div>
          </div>
        </FloatingFocusManager>
      )}
    </div>
  );
};

// These functions are needed because the date picker displays/selects dates in the local timezone, but we store them in UTC.
// This causes the date to be off since 2024-01-01T00:00:00Z is actually 2023-12-31T19:00:00-05:00 (Eastern Time).
// Therefore, we need to adjust the date to be whatever date it was in UTC by adding the timezone offset.
export function correctFromUTCRange(dateRange: DateRange | undefined) {
  if (!dateRange) {
    return {};
  }

  return {
    from: tryCorrectFromUTC(dateRange.from),
    to: tryCorrectFromUTC(dateRange.to),
  };
}

export function tryCorrectFromUTC(date: Date | undefined): Date | undefined {
  if (!date) {
    return undefined;
  }

  return correctFromUTC(date);
}

export function correctFromUTC(date: Date): Date {
  return new Date(date.getTime() + date.getTimezoneOffset() * 60000);
}

export function correctToUTC(date: Date | undefined): Date | undefined {
  if (!date) {
    return undefined;
  }

  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0));
}
