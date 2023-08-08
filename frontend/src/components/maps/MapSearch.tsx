import {
  autoUpdate,
  flip,
  offset,
  shift,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
  useRole,
} from "@floating-ui/react";
import { Wrapper } from "@googlemaps/react-wrapper";
import { Transition } from "@headlessui/react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { FormEvent, Fragment, useEffect, useRef, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { isProd } from "src/utils/env";
import { mergeClasses } from "src/utils/twmerge";

const PRODUCTION_MAPS_KEY = "AIzaSyC5eBlci7ImDnJ0TRhT5uUq1LsKdxJOZP8";
const DEVELOPMENT_MAPS_KEY = "AIzaSyD5BH5C_jcdkqpt3PnzEbgRfTv_0Lx6Huw";

export const MapSearch: React.FC<{ onSubmit?: (input: string) => void }> = (props) => {
  const urlPath = useLocation();
  const [searchParams] = useSearchParams();

  const [query, setQuery] = useState("");
  const [active, setActive] = useState(false);

  const formRef = useRef<HTMLFormElement>(null);
  useOutsideClick(formRef, () => setActive(false));
  useEscapeKeyPress(() => setActive(false));

  const { refs, floatingStyles, context } = useFloating({
    open: active,
    onOpenChange: setActive,
    middleware: [offset(10), flip({ fallbackAxisSideDirection: "end" }), shift()],
    whileElementsMounted: autoUpdate,
  });

  const click = useClick(context);
  const dismiss = useDismiss(context);
  const role = useRole(context);

  const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss, role]);

  useEffect(() => {
    if (urlPath.pathname === "/search") {
      const location = searchParams.get("location");
      if (location) {
        setQuery(location);
      }
    }
  }, [location, searchParams]);

  const onSubmit = (input: string) => {
    props.onSubmit && props.onSubmit(input);
    setActive(false);
  };

  return (
    <div className="tw-flex sm:tw-flex-1 tw-justify-center tw-items-center tw-h-full">
      <MagnifyingGlassIcon
        className="tw-flex sm:tw-hidden tw-cursor-pointer tw-ml-3 tw-w-5"
        onClick={() => setActive(true)}
      />
      <div
        className={mergeClasses(
          "tw-absolute tw-z-10 tw-left-0 tw-top-0 tw-w-full tw-h-full tw-bg-black/10 tw-backdrop-blur-sm tw-invisible tw-transition-all tw-duration-100",
          active && "tw-visible",
        )}
      />
      <form
        ref={formRef}
        className={mergeClasses(
          "tw-hidden sm:tw-flex tw-left-0 sm:tw-left-[unset] tw-absolute tw-w-full sm:tw-w-fit tw-p-5 sm:tw-p-0",
          active && "tw-flex",
        )}
        onSubmit={(e: FormEvent) => {
          e.preventDefault();
          onSubmit(query);
        }}
        onClick={() => {
          setActive(true);
        }}
      >
        <div
          ref={refs.setReference}
          className={mergeClasses(
            "tw-flex tw-w-0 tw-rounded-[50px] tw-bg-white tw-shadow-centered-md sm:tw-ring-1 tw-ring-slate-300 tw-relative tw-z-20 sm:tw-w-[25vw] tw-transition-all tw-duration-100",
            active && "tw-w-full sm:tw-w-[50vw] tw-rounded-lg",
          )}
          {...getReferenceProps()}
        >
          <MagnifyingGlassIcon className="tw-cursor-pointer tw-ml-3 tw-w-5" />
          <input
            className="tw-inline tw-placeholder-gray-600 tw-w-full tw-bg-transparent tw-py-4 sm:tw-py-3 tw-px-3 tw-text-sm tw-leading-5 tw-outline-none tw-text-slate-900 tw-text-ellipsis tw-cursor-pointer tw-transition tw-duration-100"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Where to?"
          />
        </div>
        <div
          className="tw-relative tw-z-20 tw-w-[calc(100%-40px)] sm:tw-w-[50vw]"
          ref={refs.setFloating}
          style={floatingStyles}
          {...getFloatingProps()}
        >
          <Transition
            as={Fragment}
            show={active}
            enter="tw-transition tw-ease-out tw-duration-100"
            enterFrom="tw-transform tw-opacity-0 tw-scale-80"
            enterTo="tw-transform tw-opacity-100 tw-scale-100"
            leave="tw-transition tw-ease-in tw-duration-100"
            leaveFrom="tw-transform tw-opacity-100 tw-scale-100"
            leaveTo="tw-transform tw-opacity-0 tw-scale-0"
          >
            <div className="tw-absolute tw-z-20 tw-mt-1 tw-min-w-full tw-max-h-80 tw-overflow-auto tw-rounded-md tw-bg-white tw-py-1 tw-text-sm tw-text-black tw-shadow-lg tw-ring-1 tw-ring-slate-300 sm:tw-text-sm">
              <Wrapper apiKey={isProd() ? PRODUCTION_MAPS_KEY : DEVELOPMENT_MAPS_KEY} libraries={["places"]}>
                <Suggestions query={query} setQuery={setQuery} onSubmit={onSubmit} />
              </Wrapper>
            </div>
          </Transition>
        </div>
      </form>
    </div>
  );
};

const Suggestions: React.FC<{
  query: string;
  setQuery: (query: string) => void;
  onSubmit?: (input: string) => void;
}> = ({ query, setQuery, onSubmit }) => {
  const [suggestions, setSuggestions] = useState<string[]>([
    "Las Vegas",
    "Los Angeles",
    "San Francisco",
    "New York",
    "Chicago",
  ]);

  useEffect(() => {
    const autocomplete = new window.google.maps.places.AutocompleteService();
    if (query.length > 0) {
      autocomplete.getQueryPredictions(
        { input: query },
        (predictions: google.maps.places.QueryAutocompletePrediction[] | null) =>
          setSuggestions(predictions?.map((p) => p.description) ?? []),
      );
    }
  }, [query]);

  return (
    <>
      {suggestions.map((suggestion) => (
        <div
          key={suggestion}
          className="tw-relative tw-cursor-pointer tw-select-none tw-py-2.5 tw-pl-4 tw-pr-4 hover:tw-bg-slate-100"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setQuery(suggestion);
            onSubmit && onSubmit(suggestion);
          }}
        >
          {suggestion}
        </div>
      ))}
    </>
  );
};

function useOutsideClick(ref: React.RefObject<HTMLElement>, callback: () => void) {
  useEffect(() => {
    function handleClickOutside(event: any) {
      if (ref.current && !ref.current.contains(event.target)) {
        callback();
      }
    }
    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref]);
}

function useEscapeKeyPress(callback: () => void) {
  useEffect(() => {
    function handleEscapeKeyPress(event: any) {
      if (event.key === "Escape") {
        callback();
      }
    }
    // Bind the event listener
    document.addEventListener("keydown", handleEscapeKeyPress);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("keydown", handleEscapeKeyPress);
    };
  }, []);
}
