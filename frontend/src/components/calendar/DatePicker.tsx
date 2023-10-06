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
} from "@floating-ui/react";
import { Transition } from "@headlessui/react";
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { DateRange, DayPicker, DayPickerProps, DayPickerSingleProps } from "react-day-picker";
import { mergeClasses } from "src/utils/twmerge";
import useWindowDimensions from "src/utils/window";

export const DateRangePicker: React.FC<DayPickerProps> = ({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}) => {
  const { width } = useWindowDimensions();
  const isMobile = width < 640;

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={className}
      numberOfMonths={props.numberOfMonths ? props.numberOfMonths : isMobile ? 1 : 2}
      classNames={{
        months: "tw-flex tw-flex-col sm:tw-flex-row tw-space-y-4 sm:tw-space-x-4 sm:tw-space-y-0",
        month: "tw-space-y-4 tw-border-0 sm:tw-border sm:tw-p-4 tw-rounded-lg",
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

export const DatePickerPopper: React.FC<
  Omit<DayPickerSingleProps, "mode" | "onSelect"> & {
    buttonClass?: string;
    onSelect: (selected: Date | undefined) => void;
  }
> = ({ className, classNames, buttonClass, onSelect, showOutsideDays = true, ...props }) => {
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

  return (
    <div className={className}>
      <button
        className={mergeClasses(
          "tw-flex tw-border tw-border-solid tw-border-gray-300 tw-rounded-lg tw-justify-start tw-items-center tw-cursor-pointer tw-font-medium",
          buttonClass,
        )}
        ref={refs.setReference}
        {...getReferenceProps()}
      >
        <CalendarIcon className="tw-w-5 tw-ml-4 tw-mr-3 -tw-mt-[1px]" />
        {props.selected ? props.selected.toLocaleDateString() : "Select a date"}
      </button>
      <Transition
        show={open}
        enter="tw-transition tw-ease-out tw-duration-100"
        enterFrom="tw-transform tw-opacity-0 tw-scale-95"
        enterTo="tw-transform tw-opacity-100 tw-scale-100"
        leave="tw-transition tw-ease-in tw-duration-75"
        leaveFrom="tw-transform tw-opacity-100 tw-scale-97"
        leaveTo="tw-transform tw-opacity-0 tw-scale-95"
      >
        <FloatingFocusManager context={context}>
          <div
            ref={refs.setFloating}
            style={floatingStyles}
            {...getFloatingProps()}
            className="tw-bg-white tw-rounded-lg tw-shadow-md"
          >
            <DateRangePicker
              mode="single"
              numberOfMonths={1}
              onSelect={(e: Date | undefined) => {
                setOpen(false);
                onSelect && onSelect(e);
              }}
              {...props}
            />
          </div>
        </FloatingFocusManager>
      </Transition>
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
    from: correctFromUTC(dateRange.from),
    to: correctFromUTC(dateRange.to),
  };
}

export function correctFromUTC(date: Date | undefined): Date | undefined {
  if (!date) {
    return undefined;
  }

  return new Date(date.getTime() + date.getTimezoneOffset() * 60000);
}

export function correctToUTC(date: Date | undefined): Date | undefined {
  if (!date) {
    return undefined;
  }

  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0));
}
