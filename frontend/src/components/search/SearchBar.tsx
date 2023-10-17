import { Dialog, Disclosure, Listbox, Transition } from "@headlessui/react";
import {
  ChevronUpIcon,
  MagnifyingGlassIcon,
  MinusCircleIcon,
  PlusCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { Fragment, useRef, useState } from "react";
import { DateRange } from "react-day-picker";
import { Button } from "src/components/button/Button";
import { DateRangePicker } from "src/components/calendar/DatePicker";
import { EXCLUDED_CATEGORIES, getCategoryForDisplay, getCategoryIcon } from "src/components/icons/Category";
import { Category, CategoryType } from "src/rpc/types";
import { mergeClasses } from "src/utils/twmerge";

export const SearchBar: React.FC<{ className: string }> = (props) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <SearchModal open={open} close={() => setOpen(false)} />
      <div
        className={mergeClasses(
          "tw-flex tw-flex-row tw-items-center tw-w-full tw-max-w-[640px] tw-h-14 tw-bg-white tw-shadow-dark-sm tw-p-1.5 tw-rounded-[99px] tw-cursor-pointer",
          props.className,
        )}
        onClick={() => setOpen(true)}
      >
        <MagnifyingGlassIcon className="tw-ml-3 sm:tw-ml-2 tw-h-6 sm:tw-h-7 tw-stroke-gray-600" />
        <div className="tw-w-full tw-bg-transparent tw-px-2 tw-text-gray-700 tw-text-lg tw-select-none tw-cursor-pointer">
          Search trips
        </div>
        <div className="tw-hidden tw-px-5 sm:tw-flex tw-items-center tw-rounded-[99px] tw-h-full tw-bg-blue-950 tw-text-white tw-font-medium">
          Search
        </div>
      </div>
    </>
  );
};

export const SearchBarHeader: React.FC<{ show?: boolean; className?: string }> = (props) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <SearchModal open={open} close={() => setOpen(false)} />
      {props.show && (
        <>
          <MagnifyingGlassIcon
            className="tw-flex sm:tw-hidden tw-cursor-pointer tw-ml-3 tw-w-6 tw-text-gray-500"
            onClick={() => {
              setOpen(true);
            }}
          />
          <div
            className={mergeClasses(
              "tw-hidden sm:tw-flex tw-flex-row tw-items-center tw-bg-white tw-ring-1 tw-ring-slate-300 tw-w-[25vw] tw-rounded-[99px] tw-cursor-pointer",
              props.className,
            )}
            onClick={() => setOpen(true)}
          >
            <MagnifyingGlassIcon className="tw-ml-4 tw-w-5 tw-text-gray-500" />
            <div className="tw-ml-0.5 tw-w-full tw-bg-transparent tw-px-2 tw-py-3 sm:tw-py-2.5 tw-text-gray-600 tw-text-base tw-select-none tw-cursor-pointer">
              Search trips
            </div>
          </div>
        </>
      )}
    </>
  );
};

const SearchModal: React.FC<{ open: boolean; close: () => void }> = ({ open, close }) => {
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [numberOfGuests, setNumberOfGuests] = useState(0);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const search = () => {};

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog onClose={close} className="tw-relative tw-z-[100]" initialFocus={buttonRef}>
        <Transition.Child
          as={Fragment}
          enter="tw-transform tw-transition tw-ease-in-out tw-duration-500 sm:tw-duration-100"
          enterFrom="tw-opacity-0"
          enterTo="tw-opacity-100"
          leave="tw-transform tw-transition tw-ease-in-out tw-duration-500 sm:tw-duration-100"
          leaveFrom="tw-opacity-100"
          leaveTo="tw-opacity-0"
        >
          <div className="tw-fixed tw-inset-0 tw-bg-black tw-bg-opacity-30" />
        </Transition.Child>
        <div className="tw-fixed tw-inset-x-0 tw-bottom-0 tw-h-[90svh] sm:tw-h-screen">
          <Transition.Child
            as={Fragment}
            enter="tw-transform tw-transition tw-ease-in-out tw-duration-500 sm:tw-ease-in sm:tw-duration-100"
            enterFrom="tw-translate-y-full sm:tw-scale-95"
            enterTo="tw-translate-y-0 sm:tw-scale-100"
            leave="tw-transform tw-transition tw-ease-in-out tw-duration-500 sm:tw-ease-in sm:tw-duration-100"
            leaveFrom="tw-translate-y-0 sm:tw-scale-100"
            leaveTo="tw-translate-y-full sm:tw-scale-95"
          >
            <Dialog.Panel className="sm:tw-absolute sm:sm:tw-top-[48%] tw-w-screen sm:tw-w-[500px] sm:tw-h-[70vh] sm:tw-max-h-[700px] sm:tw-left-1/2 sm:-tw-translate-x-1/2 sm:-tw-translate-y-1/2 tw-flex tw-flex-col tw-bg-white tw-shadow-md tw-rounded-t-xl sm:tw-rounded-xl tw-h-full tw-items-center tw-justify-start tw-overflow-clip">
              <div className="tw-flex tw-w-full tw-items-center tw-justify-between tw-p-6">
                <span className="tw-text-lg tw-font-semibold">Search</span>
                <button
                  className="tw-inline tw-bg-transparent tw-border-none tw-cursor-pointer"
                  onClick={(e) => {
                    e.preventDefault();
                    close();
                  }}
                >
                  <XMarkIcon className="tw-h-6 tw-stroke-black" />
                </button>
              </div>
              <div className="tw-flex tw-flex-col tw-w-full tw-gap-2 tw-p-6 tw-pt-0 tw-overflow-auto tw-h-full">
                <Disclosure defaultOpen>
                  {({ open }) => (
                    <div className="tw-rounded-lg tw-px-4 tw-pt-4 tw-border tw-border-solid tw-border-slate-300 tw-bg-white tw-divide-y">
                      <Disclosure.Button className="tw-flex tw-w-full tw-pb-4 tw-rounded-lg tw-justify-between tw-text-left tw-text-base tw-font-medium focus:tw-outline-none">
                        <span className="tw-whitespace-nowrap tw-overflow-clip tw-text-ellipsis tw-pr-2">
                          {categories.length > 0
                            ? categories.map((category) => getCategoryForDisplay(category)).join(", ")
                            : "Select activities"}
                        </span>
                        <ChevronUpIcon
                          className={`${open && "tw-rotate-180 tw-transform"} tw-h-5 tw-w-5 tw-text-slate-500`}
                        />
                      </Disclosure.Button>
                      <Disclosure.Panel className="tw-max-h-[280px] sm:tw-max-h-[300px] tw-overflow-auto">
                        <Listbox as="div" value={categories} onChange={setCategories} multiple>
                          <Listbox.Options
                            static
                            className="tw-grid tw-grid-flow-row-dense tw-grid-cols-3 sm:tw-grid-cols-4 tw-py-5 tw-gap-5 sm:tw-gap-6"
                          >
                            {Object.values(Category.Values)
                              .filter((category) => !EXCLUDED_CATEGORIES.includes(category))
                              .map((category) => (
                                <Listbox.Option key={category} value={category}>
                                  {({ selected }) => (
                                    <div
                                      className={mergeClasses(
                                        "tw-flex tw-flex-col tw-justify-center tw-items-center tw-cursor-pointer tw-select-none tw-p-2 tw-rounded-lg",
                                        selected && "tw-bg-slate-100",
                                      )}
                                    >
                                      {getCategoryIcon(category)}
                                      <span className="tw-text-xs tw-font-medium tw-mt-1 sm:tw-mt-2">
                                        {getCategoryForDisplay(category)}
                                      </span>
                                    </div>
                                  )}
                                </Listbox.Option>
                              ))}
                          </Listbox.Options>
                        </Listbox>
                      </Disclosure.Panel>
                    </div>
                  )}
                </Disclosure>
                <Disclosure>
                  {({ open }) => (
                    <div className="tw-rounded-lg tw-px-4 tw-pt-4 tw-border tw-border-solid tw-border-slate-300 tw-bg-white tw-divide-y">
                      <Disclosure.Button className="tw-flex tw-w-full tw-pb-4 tw-rounded-lg tw-justify-between tw-text-left tw-text-base tw-font-medium focus:tw-outline-none">
                        <span>
                          {dateRange?.from && dateRange?.to
                            ? dateRange.from.toLocaleDateString() + " - " + dateRange.to.toLocaleDateString()
                            : "Add dates"}
                        </span>
                        <ChevronUpIcon
                          className={`${open && "tw-rotate-180 tw-transform"} tw-h-5 tw-w-5 tw-text-slate-500`}
                        />
                      </Disclosure.Button>
                      <Disclosure.Panel className="tw-flex tw-flex-col tw-w-full tw-items-center tw-pb-4 sm:tw-pb-0">
                        <DateRangePicker
                          mode="range"
                          disabled={{ before: new Date() }}
                          numberOfMonths={1}
                          className="tw-mt-3 sm:tw-mt-0"
                          classNames={{
                            month: "sm:tw-border-0",
                          }}
                          selected={dateRange}
                          onSelect={setDateRange}
                        />
                      </Disclosure.Panel>
                    </div>
                  )}
                </Disclosure>
                <Disclosure>
                  {({ open }) => (
                    <div className="tw-rounded-lg tw-px-4 tw-pt-4 tw-border tw-border-solid tw-border-slate-300 tw-bg-white tw-divide-y">
                      <Disclosure.Button className="tw-flex tw-w-full tw-pb-4 tw-rounded-lg tw-justify-between tw-text-left tw-text-base tw-font-medium focus:tw-outline-none">
                        <span>{numberOfGuests ? numberOfGuests + " travelers" : "Add travelers"}</span>
                        <ChevronUpIcon
                          className={`${open && "tw-rotate-180 tw-transform"} tw-h-5 tw-w-5 tw-text-slate-500`}
                        />
                      </Disclosure.Button>
                      <Disclosure.Panel>
                        <div className="tw-flex tw-justify-between tw-py-5">
                          <span className="tw-text-base tw-whitespace-nowrap tw-select-none">Adults</span>
                          <div className="tw-flex tw-gap-3">
                            <button
                              onClick={() => {
                                setNumberOfGuests(Math.max(0, numberOfGuests - 1));
                              }}
                            >
                              <MinusCircleIcon
                                className={mergeClasses(
                                  "tw-w-6 tw-cursor-pointer tw-stroke-gray-500 hover:tw-stroke-black",
                                  numberOfGuests === 0 && "!tw-stroke-gray-300 tw-cursor-not-allowed",
                                )}
                              />
                            </button>
                            <span className="tw-flex tw-w-3 tw-justify-center tw-select-none">{numberOfGuests}</span>
                            <button
                              onClick={() => {
                                setNumberOfGuests(numberOfGuests + 1);
                              }}
                            >
                              <PlusCircleIcon className="tw-w-6 tw-cursor-pointer tw-stroke-gray-500 hover:tw-stroke-black" />
                            </button>
                          </div>
                        </div>
                      </Disclosure.Panel>
                    </div>
                  )}
                </Disclosure>
              </div>
              <div className="tw-flex tw-justify-between tw-w-full tw-border-t tw-border-solid tw-border-slate-200 tw-px-6 tw-py-4 tw-mt-auto">
                <button
                  className="tw-text-base"
                  onClick={() => {
                    setCategories([]);
                    setDateRange(undefined);
                    setNumberOfGuests(0);
                  }}
                >
                  Clear all
                </button>
                <Button
                  className="tw-h-10 tw-text-base tw-flex tw-flex-row tw-items-center tw-pr-5"
                  onClick={search}
                  ref={buttonRef}
                >
                  <MagnifyingGlassIcon className="tw-h-5 tw-mr-1.5 tw-stroke-2" />
                  Search
                </Button>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
};
