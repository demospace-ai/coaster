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
      className="tw-mt-2 tw-flex tw-h-14 tw-w-full tw-max-w-[400px] tw-cursor-text tw-flex-row tw-items-center tw-rounded-[99px] tw-bg-white tw-p-1.5 tw-shadow-dark-sm"
    >
      <input
        ref={inputRef}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="tw-w-full tw-cursor-text tw-select-none tw-bg-transparent tw-pl-4 tw-text-base tw-placeholder-gray-700 tw-outline-none"
        placeholder="Search trips"
      />
      <button
        className="tw-hidden tw-h-full tw-items-center tw-rounded-[99px] tw-bg-blue-950 tw-px-5 tw-text-base tw-font-medium tw-text-white sm:tw-flex"
        onClick={search}
      >
        Search
      </button>
      <MagnifyingGlassIcon className="tw-mr-4 tw-flex tw-h-6 tw-w-6 tw-stroke-gray-600 sm:tw-hidden" onClick={search} />
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
        className="tw-mx-2 tw-flex tw-h-9 tw-w-full tw-max-w-[400px] tw-cursor-text tw-flex-row tw-items-center tw-rounded-[99px] tw-bg-white tw-ring-1 tw-ring-slate-300"
      >
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="tw-w-full tw-cursor-text tw-select-none tw-bg-transparent tw-pl-4 tw-text-base tw-placeholder-gray-700 tw-outline-none"
          placeholder="Search trips"
        />
        <MagnifyingGlassIcon className="tw-ml-2 tw-mr-4 tw-h-5 tw-cursor-pointer tw-stroke-gray-600" onClick={search} />
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
          className="tw-mr-4 tw-flex tw-h-6 tw-w-6 tw-cursor-pointer"
          onClick={() => {
            setOpen(true);
          }}
        />
      ) : (
        <div
          role="search"
          className={mergeClasses(
            "tw-flex tw-h-14 tw-w-full tw-max-w-[640px] tw-cursor-pointer tw-flex-row tw-items-center tw-rounded-[99px] tw-bg-white tw-p-1.5 tw-shadow-dark-sm",
            props.className,
          )}
          onClick={() => setOpen(true)}
        >
          <MagnifyingGlassIcon className="tw-ml-3 tw-h-6 tw-w-6 tw-stroke-gray-600 sm:tw-ml-2 sm:tw-h-7 sm:tw-w-7" />
          <div className="tw-w-full tw-cursor-pointer tw-select-none tw-bg-transparent tw-px-2 tw-text-lg tw-text-gray-700">
            Search trips
          </div>
          <div className="tw-hidden tw-h-full tw-items-center tw-rounded-[99px] tw-bg-blue-950 tw-px-5 tw-text-base tw-font-medium tw-text-white sm:tw-flex">
            Search
          </div>
        </div>
      )}
    </div>
  );
};
