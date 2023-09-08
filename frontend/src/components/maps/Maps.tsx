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
import { Status, Wrapper } from "@googlemaps/react-wrapper";
import { Transition } from "@headlessui/react";
import { MagnifyingGlassIcon, MapPinIcon } from "@heroicons/react/24/outline";
import { FormEvent, Fragment, ReactElement, useEffect, useRef, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { Loading } from "src/components/loading/Loading";
import { isProd } from "src/utils/env";
import { mergeClasses } from "src/utils/twmerge";

const PRODUCTION_MAPS_KEY = "AIzaSyC5eBlci7ImDnJ0TRhT5uUq1LsKdxJOZP8";
const DEVELOPMENT_MAPS_KEY = "AIzaSyD5BH5C_jcdkqpt3PnzEbgRfTv_0Lx6Huw";

export const MapSearch: React.FC<{ onSubmit?: (input: string) => void }> = (props) => {
  const urlPath = useLocation();
  const [searchParams] = useSearchParams();

  const [query, setQuery] = useState("");
  const [active, setActive] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  const { refs, floatingStyles, context } = useFloating({
    open: active,
    onOpenChange: setActive,
    middleware: [offset(10), flip({ fallbackAxisSideDirection: "end" }), shift()],
    whileElementsMounted: autoUpdate,
  });

  const click = useClick(context, {
    toggle: false,
    keyboardHandlers: false,
  });
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
        className="tw-flex sm:tw-hidden tw-cursor-pointer tw-ml-3 tw-w-6 tw-text-gray-500"
        onClick={() => {
          setActive(true);
          inputRef.current?.focus();
        }}
      />
      <div
        className={mergeClasses(
          "tw-absolute tw-z-10 tw-left-0 tw-top-0 tw-w-[100vw] tw-h-[100vh] tw-bg-black/10 tw-backdrop-blur-sm tw-invisible tw-transition-all tw-duration-100",
          active && "tw-visible",
        )}
      />
      <form
        ref={refs.setReference}
        className={mergeClasses(
          "tw-hidden sm:tw-flex tw-left-0 sm:tw-left-[unset] tw-absolute tw-w-full sm:tw-w-fit tw-p-5 sm:tw-p-0 tw-mt-4 sm:tw-mt-0",
          active && "tw-flex",
        )}
        onSubmit={(e: FormEvent) => {
          e.preventDefault();
          onSubmit(query);
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
              onSubmit(query);
              inputRef.current?.blur();
            }
          },
        })}
      >
        <div
          className={mergeClasses(
            "tw-flex tw-w-0 tw-rounded-[50px] tw-bg-white tw-ring-1 tw-ring-slate-300 tw-relative tw-z-20 sm:tw-w-[25vw] tw-transition-all tw-duration-100",
            active && "tw-w-full sm:tw-w-[50vw] tw-rounded-lg",
          )}
        >
          <MagnifyingGlassIcon className="tw-cursor-pointer tw-ml-3 tw-w-5 tw-text-gray-500" />
          <input
            ref={inputRef}
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
            <div className="tw-absolute tw-z-20 tw-mt-[-10px] sm:tw-mt-0 tw-min-w-full tw-max-h-80 tw-overflow-auto tw-rounded-md tw-bg-white tw-py-1 tw-text-sm tw-text-black tw-shadow-lg tw-ring-1 tw-ring-slate-300 sm:tw-text-sm">
              <MapsWrapper loadingClass="tw-h-20">
                <Suggestions query={query} setQuery={setQuery} onSubmit={onSubmit} />
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
  const [query, setQuery] = useState(props.initial ? props.initial : "");
  const [active, setActive] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  const { refs, floatingStyles, context } = useFloating({
    open: active,
    onOpenChange: setActive,
    middleware: [offset(10), flip({ fallbackAxisSideDirection: "end" }), shift()],
    whileElementsMounted: autoUpdate,
  });

  const click = useClick(context, {
    toggle: false,
    keyboardHandlers: false,
  });
  const dismiss = useDismiss(context);
  const role = useRole(context);

  const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss, role]);

  const onSelect = (input: string) => {
    props.onSelect && props.onSelect(input);
    setActive(false);
  };

  const showLabel = active || inputRef.current?.value || props.initial;

  return (
    <div
      className={mergeClasses(
        "tw-flex tw-justify-center tw-items-center tw-relative tw-w-full tw-mb-4",
        props.className,
      )}
    >
      <form
        ref={refs.setReference}
        className="tw-flex tw-w-full tw-p-0 sm:tw-mt-0"
        onSubmit={(e: FormEvent) => {
          e.preventDefault();
          onSelect(query);
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
              // Don't allow enter to submit. User must select from dropdown
              event.preventDefault();
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
              ref={inputRef}
              className="tw-inline tw-placeholder-gray-600 tw-w-full tw-bg-transparent tw-py-3 tw-px-3 tw-text-base tw-leading-5 tw-outline-none tw-text-slate-900 tw-text-ellipsis tw-cursor-text tw-transition tw-duration-100"
              value={query}
              autoComplete="off"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Enter your address"
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
            show={active}
            enter="tw-transition tw-ease-out tw-duration-100"
            enterFrom="tw-transform tw-opacity-0 tw-scale-80"
            enterTo="tw-transform tw-opacity-100 tw-scale-100"
            leave="tw-transition tw-ease-in tw-duration-100"
            leaveFrom="tw-transform tw-opacity-100 tw-scale-100"
            leaveTo="tw-transform tw-opacity-0 tw-scale-0"
          >
            <div className="tw-absolute tw-z-20 tw-mt-0 tw-min-w-full tw-max-h-80 tw-overflow-auto tw-rounded-md tw-bg-white tw-py-1 tw-text-sm tw-text-black tw-shadow-lg tw-border tw-border-solid tw-border-slate-300">
              <MapsWrapper loadingClass="tw-h-20">
                <Suggestions query={query} setQuery={setQuery} onSubmit={onSelect} />
              </MapsWrapper>
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
