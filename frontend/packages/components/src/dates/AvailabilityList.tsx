"use client";

import { compareDates, mergeClasses, toUndefined } from "@coaster/utils/common";
import {
  autoUpdate,
  offset,
  shift,
  size,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
  useRole,
} from "@floating-ui/react";
import { Listbox, Transition } from "@headlessui/react";
import { CalendarIcon } from "@heroicons/react/24/outline";
import { Fragment, useState } from "react";
import { Loading } from "../loading/Loading";

export const AvailabilityListPopper: React.FC<{
  className?: string;
  wrapperClass?: string;
  selected: Date | undefined;
  onSelect: (selected: Date | undefined) => void;
  availability: Date[];
  durationMinutes: number | undefined;
  loading?: boolean;
}> = ({ availability, className, wrapperClass, selected, onSelect, loading, durationMinutes }) => {
  const [open, setOpen] = useState(false);
  const { refs, floatingStyles, context } = useFloating<HTMLDivElement>({
    open,
    onOpenChange: setOpen,
    middleware: [
      offset(4),
      shift(),
      size({
        apply({ rects, elements }) {
          Object.assign(elements.floating.style, {
            minWidth: `${rects.reference.width}px`,
          });
        },
        padding: 12,
      }),
    ],
    whileElementsMounted: autoUpdate,
    placement: "bottom-start",
  });
  const click = useClick(context, {
    keyboardHandlers: false,
  });
  const dismiss = useDismiss(context);
  const role = useRole(context);
  const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss, role]);

  const getDisplayValue = (value: Date | undefined): string => {
    if (!value) {
      return "";
    }
    const durationDays = Math.floor((durationMinutes || 0) / 1440);
    if (durationDays > 0) {
      const endDate = new Date(value.getFullYear(), value.getMonth(), value.getDate() + durationDays);
      return (
        value.toLocaleDateString("en-us", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }) +
        " - " +
        endDate.toLocaleDateString("en-us", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      );
    } else {
      return value.toLocaleDateString("en-us", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    }
  };

  return (
    <Listbox
      by={(a, b) => compareDates(toUndefined(a), toUndefined(b))}
      value={selected ? selected : null}
      onChange={(value) => {
        onSelect(value ? value : undefined);
        setOpen(false);
      }}
    >
      <div className={mergeClasses("tw-relative tw-flex", wrapperClass)}>
        <Listbox.Button
          ref={refs.setReference}
          {...getReferenceProps()}
          className={mergeClasses(
            "tw-flex tw-py-3.5 tw-px-3 tw-rounded-md tw-bg-white tw-text-left tw-border tw-border-solid tw-border-slate-300 tw-transition tw-duration-100 tw-cursor-pointer tw-items-center",
            className,
          )}
        >
          <div
            className={
              "tw-flex tw-items-center tw-w-[calc(100%-20px)] tw-truncate tw-leading-5 tw-text-base tw-overflow-none"
            }
          >
            <CalendarIcon className="tw-w-5 tw-ml-2 tw-mr-3 -tw-mt-[1.5px]" />
            {selected ? selected.toLocaleDateString() : "Select a date"}
          </div>
        </Listbox.Button>
        <div ref={refs.setFloating} style={floatingStyles} {...getFloatingProps()}>
          <Transition
            as={Fragment}
            show={open}
            enter="tw-transition tw-ease-out tw-duration-100"
            enterFrom="tw-transform tw-opacity-0 tw-scale-95"
            enterTo="tw-transform tw-opacity-100 tw-scale-100"
            leave="tw-transition tw-ease-in tw-duration-100"
            leaveFrom="tw-transform tw-opacity-100 tw-scale-100"
            leaveTo="tw-transform tw-opacity-0 tw-scale-95"
          >
            <Listbox.Options className="tw-max-h-60 tw-w-full tw-overflow-auto tw-rounded-md tw-bg-white tw-p-4 tw-text-base tw-shadow-lg tw-ring-1 tw-ring-slate-900 tw-ring-opacity-5 focus:tw-outline-none sm:tw-text-sm tw-gap-3 tw-flex tw-flex-col">
              {loading ? (
                <Loading />
              ) : (
                availability.map((option: Date, index: number) => (
                  <Listbox.Option
                    key={index}
                    value={option}
                    className={({ active, selected }) =>
                      `tw-flex tw-items-center tw-justify-center tw-border tw-border-solid tw-border-gray-300 tw-rounded-xl tw-py-2 tw-px-4 tw-cursor-pointer tw-select-none tw-text-base tw-text-slate-900
                        ${active && "tw-bg-slate-100"}
                        ${selected && "tw-bg-slate-200"}`
                    }
                  >
                    <div className="tw-font-medium tw-whitespace-nowrap">{getDisplayValue(option)}</div>
                  </Listbox.Option>
                ))
              )}
            </Listbox.Options>
          </Transition>
        </div>
      </div>
    </Listbox>
  );
};
