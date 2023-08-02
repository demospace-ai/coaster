import { Wrapper } from "@googlemaps/react-wrapper";
import { Transition } from "@headlessui/react";
import { Fragment, useEffect, useState } from "react";
import { Modifier, usePopper } from "react-popper";
import { isProd } from "src/utils/env";

const PRODUCTION_MAPS_KEY = "AIzaSyC5eBlci7ImDnJ0TRhT5uUq1LsKdxJOZP8";
const DEVELOPMENT_MAPS_KEY = "AIzaSyD5BH5C_jcdkqpt3PnzEbgRfTv_0Lx6Huw";

export const MapSearch: React.FC = () => {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);

  const [referenceElement, setReferenceElement] = useState<HTMLDivElement | null>(null);
  const [popperElement, setPopperElement] = useState<HTMLDivElement | null>(null);
  const { styles, attributes } = usePopper(referenceElement, popperElement, {
    strategy: "fixed",
    modifiers: [sameWidth],
  });

  return (
    <div>
      <div className="tw-relative">
        <div ref={setReferenceElement} className="tw-flex tw-w-96 tw-mt-5">
          <input
            className="tw-inline tw-placeholder-gray-700 tw-w-full tw-rounded-md tw-bg-white tw-border tw-border-solid tw-border-slate-300 focus-within:!tw-border-primary tw-py-2.5 tw-px-3 tw-text-sm tw-leading-5 tw-text-slate-900 tw-outline-none tw-text-ellipsis tw-cursor-pointer focus:tw-cursor-text tw-transition tw-duration-100"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="Where to?"
          ></input>
        </div>
        <div className="tw-relative tw-z-10" ref={setPopperElement} style={styles.popper} {...attributes.popper}>
          <Transition
            as={Fragment}
            show={focused}
            enter="tw-transition tw-ease-out tw-duration-100"
            enterFrom="tw-transform tw-opacity-0 tw-scale-95"
            enterTo="tw-transform tw-opacity-100 tw-scale-100"
            leave="tw-transition tw-ease-in tw-duration-100"
            leaveFrom="tw-transform tw-opacity-100 tw-scale-100"
            leaveTo="tw-transform tw-opacity-0 tw-scale-95"
          >
            <div className="tw-absolute tw-z-20 tw-mt-1 tw-min-w-full tw-max-h-64 tw-overflow-auto tw-rounded-md tw-bg-white tw-py-1 tw-text-base tw-shadow-lg tw-ring-1 tw-ring-slate-900 tw-ring-opacity-5 focus:tw-outline-none sm:tw-text-sm">
              <Wrapper apiKey={isProd() ? PRODUCTION_MAPS_KEY : DEVELOPMENT_MAPS_KEY} libraries={["places"]}>
                <Suggestions query={query} setQuery={setQuery} />
              </Wrapper>
            </div>
          </Transition>
        </div>
      </div>
    </div>
  );
};

const Suggestions: React.FC<{ query: string; setQuery: (query: string) => void }> = ({ query, setQuery }) => {
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
          onClick={() => setQuery(suggestion)}
        >
          {suggestion}
        </div>
      ))}
    </>
  );
};

const sameWidth: Modifier<"sameWidth"> = {
  name: "sameWidth",
  enabled: true,
  phase: "beforeWrite",
  requires: ["computeStyles"],
  fn: ({ state }) => {
    state.styles.popper.width = `${state.rects.reference.width}px`;
  },
  effect: ({ state }) => {
    state.elements.popper.style.width = `${state.elements.reference.getBoundingClientRect().width}px`;
  },
};
