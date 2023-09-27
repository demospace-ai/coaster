import {
  autoUpdate,
  flip,
  offset,
  shift,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
  useListNavigation,
  useRole,
} from "@floating-ui/react";
import { Status, Wrapper } from "@googlemaps/react-wrapper";
import { Transition } from "@headlessui/react";
import { MagnifyingGlassIcon, MapPinIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { FormEvent, Fragment, HTMLProps, ReactElement, useEffect, useRef, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { Loading } from "src/components/loading/Loading";
import { isProd } from "src/utils/env";
import { mergeClasses } from "src/utils/twmerge";

const PRODUCTION_MAPS_KEY = "AIzaSyC5eBlci7ImDnJ0TRhT5uUq1LsKdxJOZP8";
const DEVELOPMENT_MAPS_KEY = "AIzaSyD5BH5C_jcdkqpt3PnzEbgRfTv_0Lx6Huw";
const INITIAL_SUGGESTIONS = ["Las Vegas", "Los Angeles", "San Francisco", "New York", "Chicago"];

export const MapSearch: React.FC<{ onSubmit?: (input: string) => void }> = (props) => {
  const urlPath = useLocation();
  const [searchParams] = useSearchParams();

  const {
    refs,
    floatingStyles,
    getReferenceProps,
    getFloatingProps,
    getItemProps,
    inputRef,
    listRef,
    query,
    setQuery,
    open,
    setOpen,
    activeIndex,
    suggestions,
    setSuggestions,
  } = useMapSearchState("");

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
    setOpen(false);
  };

  return (
    <div className="tw-flex sm:tw-flex-1 tw-justify-center tw-items-center tw-h-full">
      <MagnifyingGlassIcon
        className="tw-flex sm:tw-hidden tw-cursor-pointer tw-ml-3 tw-w-6 tw-text-gray-500"
        onClick={() => {
          setOpen(true);
          inputRef.current?.focus();
        }}
      />
      <div
        className={mergeClasses(
          "tw-absolute tw-z-10 tw-left-0 tw-top-0 tw-w-[100vw] tw-h-[100vh] tw-bg-black/10 tw-backdrop-blur-sm tw-invisible tw-transition-all tw-duration-100",
          open && "tw-visible",
        )}
      />
      <form
        ref={refs.setReference}
        className={mergeClasses(
          "tw-hidden sm:tw-flex tw-left-0 sm:tw-left-[unset] tw-absolute tw-w-full sm:tw-w-fit tw-p-5 sm:tw-p-0 tw-mt-4 sm:tw-mt-0",
          open && "tw-flex",
        )}
        onSubmit={(e: FormEvent) => {
          e.preventDefault();
          if (activeIndex !== null) {
            onSubmit(suggestions[activeIndex]);
          } else {
            onSubmit(query);
          }
        }}
        {...getReferenceProps({
          onClick() {
            inputRef.current?.focus();
          },
          onKeyDown(event) {
            if (event.key === "Escape") {
              inputRef.current?.blur();
            }
            if (event.key === "Enter") {
              if (activeIndex !== null) {
                onSubmit(suggestions[activeIndex]);
              } else {
                onSubmit(query);
              }
              inputRef.current?.blur();
            }
          },
        })}
      >
        <div
          className={mergeClasses(
            "tw-flex tw-w-0 tw-rounded-[50px] tw-bg-white tw-ring-1 tw-ring-slate-300 tw-relative tw-z-20 sm:tw-w-[25vw] tw-transition-all tw-duration-100",
            open && "tw-w-full sm:tw-w-[50vw] tw-rounded-lg",
          )}
        >
          <MagnifyingGlassIcon className="tw-cursor-pointer tw-ml-3 tw-w-5 tw-text-gray-500" />
          <input
            id="search"
            ref={inputRef}
            className="tw-inline tw-placeholder-gray-600 tw-w-full tw-bg-transparent tw-py-4 sm:tw-py-3 tw-px-3 tw-text-sm tw-leading-5 tw-outline-none tw-text-slate-900 tw-text-ellipsis tw-cursor-pointer tw-transition tw-duration-100"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            autoComplete="off"
            aria-autocomplete="list"
            placeholder="Where to?"
          />
          <XMarkIcon
            className={mergeClasses("tw-hidden tw-cursor-pointer tw-mr-3 tw-w-5 tw-text-gray-500", open && "tw-flex")}
            onClick={() => setQuery("")}
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
            show={open}
            enter="tw-transition tw-ease-out tw-duration-100"
            enterFrom="tw-transform tw-opacity-0 tw-scale-80"
            enterTo="tw-transform tw-opacity-100 tw-scale-100"
            leave="tw-transition tw-ease-in tw-duration-100"
            leaveFrom="tw-transform tw-opacity-100 tw-scale-100"
            leaveTo="tw-transform tw-opacity-0 tw-scale-0"
          >
            <div className="tw-absolute tw-z-20 -tw-mt-3 sm:tw-mt-0 tw-min-w-full tw-max-h-80 tw-overflow-auto tw-rounded-md tw-bg-white tw-py-1 tw-text-sm tw-text-black tw-shadow-lg tw-ring-1 tw-ring-slate-300 sm:tw-text-sm">
              <MapsWrapper loadingClass="tw-h-20">
                <Suggestions
                  query={query}
                  setQuery={setQuery}
                  suggestions={suggestions}
                  setSuggestions={setSuggestions}
                  activeIndex={activeIndex}
                  listRef={listRef}
                  onSubmit={onSubmit}
                  getItemProps={getItemProps}
                />
              </MapsWrapper>
            </div>
          </Transition>
        </div>
      </form>
    </div>
  );
};

export const InlineMapSearch: React.FC<{
  className?: string;
  label?: string;
  hideIcon?: boolean;
  onSelect?: (input: string) => void;
  initial?: string;
}> = (props) => {
  const {
    refs,
    floatingStyles,
    getReferenceProps,
    getFloatingProps,
    getItemProps,
    inputRef,
    listRef,
    query,
    setQuery,
    open,
    setOpen,
    activeIndex,
    suggestions,
    setSuggestions,
  } = useMapSearchState(props.initial);

  const onSelect = (input: string) => {
    props.onSelect && props.onSelect(input);
    setOpen(false);
  };

  const onSubmit = (input: string) => {
    setQuery(input);
    onSelect(input);
  };

  const showLabel = open || inputRef.current?.value || props.initial;

  return (
    <div
      className={mergeClasses(
        "tw-flex tw-justify-center tw-items-center tw-relative tw-w-full tw-mb-4",
        props.className,
      )}
    >
      <div
        ref={refs.setReference}
        className="tw-flex tw-w-full tw-p-0 sm:tw-mt-0"
        {...getReferenceProps({
          onClick() {
            inputRef.current?.focus();
          },
          onKeyDown(event) {
            if (event.key === "Escape") {
              inputRef.current?.blur();
            }
            if (event.key === "Enter") {
              if (activeIndex !== null) {
                onSubmit(suggestions[activeIndex]);
              }
              inputRef.current?.blur();
            }
          },
        })}
      >
        <div
          className={mergeClasses(
            "tw-flex tw-w-full tw-rounded-lg tw-bg-white tw-border tw-border-solid tw-border-gray-300 tw-transition-all tw-duration-100",
            props.label && "tw-py-3",
          )}
        >
          {props.label && (
            <label
              className={mergeClasses(
                "tw-absolute -tw-top-1.5 tw-text-base tw-text-slate-600 tw-cursor-[inherit] tw-select-none tw-inline-block tw-transition-all tw-duration-150",
                showLabel && "tw-top-1.5 tw-left-3 tw-text-xs",
              )}
            >
              {props.label}
            </label>
          )}
          <div className={mergeClasses("tw-flex tw-w-full", props.label && "tw-mt-1 -tw-mb-2")}>
            {!props.hideIcon && <MapPinIcon className="tw-ml-3 tw-w-5 tw-cursor-pointer" />}
            <input
              id="search"
              ref={inputRef}
              className="tw-inline tw-placeholder-gray-600 tw-w-full tw-bg-transparent tw-py-3 tw-px-3 tw-text-base tw-leading-5 tw-outline-none tw-text-slate-900 tw-text-ellipsis tw-cursor-text tw-transition tw-duration-100"
              value={query}
              autoComplete="off"
              aria-autocomplete="list"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Enter your address"
            />
            <XMarkIcon
              className={mergeClasses(
                "tw-hidden tw-cursor-pointer tw-mr-4 -tw-mt-2 tw-w-5 tw-text-gray-500",
                open && "tw-flex",
              )}
              onClick={() => setQuery("")}
            />
          </div>
        </div>
        <div
          className="tw-relative tw-z-20 tw-w-full"
          ref={refs.setFloating}
          style={floatingStyles}
          {...getFloatingProps()}
        >
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
            <div className="tw-absolute tw-z-20 -tw-mt-3 sm:tw-mt-0 tw-min-w-full tw-max-h-80 tw-overflow-auto tw-rounded-md tw-bg-white tw-py-1 tw-text-sm tw-text-black tw-shadow-lg tw-ring-1 tw-ring-slate-100 sm:tw-text-sm">
              <MapsWrapper loadingClass="tw-h-20">
                <Suggestions
                  query={query}
                  setQuery={setQuery}
                  suggestions={suggestions}
                  setSuggestions={setSuggestions}
                  activeIndex={activeIndex}
                  listRef={listRef}
                  onSubmit={onSelect}
                  getItemProps={getItemProps}
                />
              </MapsWrapper>
            </div>
          </Transition>
        </div>
      </div>
    </div>
  );
};

const useMapSearchState = (initial?: string) => {
  const [query, setQuery] = useState(initial ? initial : "");
  const [open, setOpen] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<Array<HTMLElement | null>>([]);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>(INITIAL_SUGGESTIONS);

  const { refs, floatingStyles, context } = useFloating({
    open: open,
    onOpenChange: setOpen,
    middleware: [offset(10), flip({ fallbackAxisSideDirection: "end" }), shift()],
    whileElementsMounted: autoUpdate,
  });

  const click = useClick(context, {
    toggle: false,
    keyboardHandlers: false,
  });
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: "listbox" });

  const listNav = useListNavigation(context, {
    listRef,
    activeIndex,
    onNavigate: setActiveIndex,
    virtual: true,
    loop: true,
  });

  const { getReferenceProps, getFloatingProps, getItemProps } = useInteractions([click, dismiss, role, listNav]);

  return {
    refs,
    floatingStyles,
    getReferenceProps,
    getFloatingProps,
    getItemProps,
    inputRef,
    listRef,
    query,
    setQuery,
    open,
    setOpen,
    activeIndex,
    suggestions,
    setSuggestions,
  };
};

const Suggestions: React.FC<{
  query: string;
  setQuery: (query: string) => void;
  suggestions: string[];
  setSuggestions: (suggestions: string[]) => void;
  activeIndex: number | null;
  listRef: React.MutableRefObject<Array<HTMLElement | null>>;
  getItemProps: (userProps?: HTMLProps<HTMLElement>) => Record<string, unknown>;
  onSubmit?: (input: string) => void;
}> = ({ query, setQuery, suggestions, setSuggestions, activeIndex, listRef, getItemProps, onSubmit }) => {
  useEffect(() => {
    const autocomplete = new google.maps.places.AutocompleteService();
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
      {suggestions.map((suggestion, idx) => (
        <div
          key={suggestion}
          ref={(node) => (listRef.current[idx] = node)}
          role="option"
          aria-selected={idx === activeIndex}
          className={mergeClasses(
            "tw-relative tw-cursor-pointer tw-select-none tw-py-2.5 tw-pl-4 tw-pr-4",
            idx === activeIndex && "tw-bg-slate-200",
          )}
          {...getItemProps({
            onClick: (e) => {
              e.preventDefault();
              e.stopPropagation();
              setQuery(suggestion);
              onSubmit && onSubmit(suggestion);
            },
          })}
        >
          {suggestion}
        </div>
      ))}
    </>
  );
};

type MapProps = {
  className?: string;
  center?: google.maps.LatLngLiteral;
  zoom?: number;
  marker?: google.maps.LatLngLiteral;
};

export const MapComponent: React.FC<MapProps> = (props) => {
  return (
    <MapsWrapper>
      <MapComponentInner {...props} />
    </MapsWrapper>
  );
};

const MapComponentInner: React.FC<MapProps> = ({ className, center, zoom, marker }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      const map = new google.maps.Map(ref.current, {
        center,
        zoom,
        controlSize: 24,
        disableDefaultUI: true,
        keyboardShortcuts: false,
        mapTypeControl: false,
        streetViewControl: false,
      });

      new google.maps.Marker({
        position: marker,
        map,
      });
    }
  }, [ref, center, zoom, marker]);

  return (
    <div
      className={mergeClasses("tw-rounded-lg tw-h-64 sm:tw-h-80 tw-w-full tw-transition-all", className)}
      ref={ref}
      id="map"
    />
  );
};

export const MapsWrapper: React.FC<{ children: ReactElement; loadingClass?: string }> = ({
  children,
  loadingClass,
}) => {
  const render = (status: Status): ReactElement => {
    if (status === Status.LOADING) return <Loading className={loadingClass} />;
    if (status === Status.FAILURE) return <h3>{status}</h3>;
    return <></>;
  };

  return (
    <Wrapper
      apiKey={isProd() ? PRODUCTION_MAPS_KEY : DEVELOPMENT_MAPS_KEY}
      libraries={["places", "geocoding", "marker"]}
      render={render}
    >
      {children}
    </Wrapper>
  );
};
