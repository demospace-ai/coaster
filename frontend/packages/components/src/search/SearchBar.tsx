"use client";

import { mergeClasses } from "@coaster/utils/common";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useSearchParams } from "next/navigation";
import { useRef, useState } from "react";
import { trackEvent } from "../rudderstack/client";
import { SearchModal } from "./SearchBarModal";

export const SearchBar: React.FC = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState<string>("");
  const search = () => {
    if (query.length > 0) {
      trackEvent("search", { query });
      window.location.href = `/search?query=${query}`;
    }
  };

  return (
    <form
      onClick={() => inputRef.current?.focus()}
      onSubmit={(e) => {
        e.preventDefault();
        search();
      }}
      className="tw-flex tw-flex-row tw-items-center tw-w-full tw-max-w-[400px] tw-h-14 tw-bg-white tw-shadow-dark-sm tw-p-1.5 tw-rounded-[99px] tw-cursor-text tw-mt-2"
    >
      <input
        ref={inputRef}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="tw-w-full tw-bg-transparent tw-pl-4 tw-placeholder-gray-700 tw-text-base tw-select-none tw-cursor-text tw-outline-none"
        placeholder="Search trips"
      />
      <button
        className="tw-hidden tw-px-5 sm:tw-flex tw-items-center tw-rounded-[99px] tw-h-full tw-bg-coaster-blue tw-text-white tw-text-base tw-font-medium"
        onClick={search}
      >
        Search
      </button>
      <MagnifyingGlassIcon className="tw-flex sm:tw-hidden tw-w-6 tw-h-6 tw-mr-4 tw-stroke-gray-600" onClick={search} />
    </form>
  );
};

export const SearchBarHeader: React.FC<{ show: boolean }> = ({ show }) => {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState<string>(searchParams.get("query") ?? "");
  const inputRef = useRef<HTMLInputElement>(null);
  const search = () => {
    if (query.length > 0) {
      trackEvent("search", { query });
      window.location.href = `/search?query=${query}`;
    }
  };

  if (!show) {
    return <></>;
  }

  return (
    <div className="tw-flex tw-flex-1 tw-justify-center">
      <form
        onClick={() => inputRef.current?.focus()}
        onSubmit={(e) => {
          e.preventDefault();
          search();
        }}
        className="tw-flex tw-flex-row tw-items-center tw-w-full tw-max-w-[400px] tw-h-9 tw-bg-white tw-ring-1 tw-ring-slate-300 tw-rounded-[99px] tw-cursor-text tw-mx-2"
      >
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="tw-w-full tw-bg-transparent tw-pl-4 tw-placeholder-gray-700 tw-text-base tw-select-none tw-cursor-text tw-outline-none"
          placeholder="Search trips"
        />
        <MagnifyingGlassIcon className="tw-ml-2 tw-mr-4 tw-h-5 tw-stroke-gray-600 tw-cursor-pointer" onClick={search} />
      </form>
    </div>
  );
};

export const SearchBarModal: React.FC<{
  className?: string;
  header?: boolean;
}> = (props) => {
  const [open, setOpen] = useState(false);

  return (
    <div className={mergeClasses("tw-flex", !props.header && "tw-w-full tw-justify-center")}>
      <SearchModal open={open} close={() => setOpen(false)} />
      {props.header ? (
        <MagnifyingGlassIcon
          aria-label="Open search"
          role="button"
          className="tw-flex tw-cursor-pointer tw-mr-4 tw-w-6 tw-h-6"
          onClick={() => {
            setOpen(true);
          }}
        />
      ) : (
        <div
          role="search"
          className={mergeClasses(
            "tw-flex tw-flex-row tw-items-center tw-w-full tw-max-w-[640px] tw-h-14 tw-bg-white tw-shadow-dark-sm tw-p-1.5 tw-rounded-[99px] tw-cursor-pointer",
            props.className,
          )}
          onClick={() => setOpen(true)}
        >
          <MagnifyingGlassIcon className="tw-ml-3 sm:tw-ml-2 tw-w-6 tw-h-6 sm:tw-w-7 sm:tw-h-7 tw-stroke-gray-600" />
          <div className="tw-w-full tw-bg-transparent tw-px-2 tw-text-gray-700 tw-text-lg tw-select-none tw-cursor-pointer">
            Search trips
          </div>
          <div className="tw-hidden tw-px-5 sm:tw-flex tw-items-center tw-rounded-[99px] tw-h-full tw-bg-coaster-blue tw-text-white tw-text-base tw-font-medium">
            Search
          </div>
        </div>
      )}
    </div>
  );
};
