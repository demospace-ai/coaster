import { Combobox, Listbox, Transition } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";
import { Fragment, HTMLInputTypeAttribute, InputHTMLAttributes, useRef, useState } from "react";
import { Modifier, usePopper } from "react-popper";
import { Loading } from "src/components/loading/Loading";
import { mergeClasses } from "src/utils/twmerge";

const UNSET: any = { "undefined": true };

export const Input: React.FC<InputProps> = props => {
  const { id, value, placeholder, setValue, className, textarea, type, label, ...other } = props;
  const [focused, setFocused] = useState(false);
  let classes = ['tw-border tw-border-solid tw-border-slate-300 tw-rounded-md tw-py-2.5 tw-px-3 tw-w-full tw-box-border focus:tw-border-slate-700 tw-outline-none', !props.disabled && "hover:tw-border-slate-400", props.className];

  const onKeydown = (event: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    event.stopPropagation();
    if (event.key === 'Escape') {
      event.currentTarget.blur();
    }
  };

  const showLabel = props.label !== undefined && (focused || (props.value !== undefined && (props.value !== "string" || props.value.length > 0)));

  return (
    <div className={mergeClasses("tw-relative", props.label && "tw-mt-4")}>
      <Transition
        show={showLabel}
        enter="tw-transition tw-ease tw-duration-200 tw-transform"
        enterFrom="tw-translate-y-4 tw-opacity-10"
        enterTo="tw-translate-y-0"
        leave="tw-transition tw-ease tw-duration-200 tw-transform"
        leaveFrom="tw-translate-y-0"
        leaveTo="tw-translate-y-4 tw-opacity-10"
      >
        <label
          htmlFor="name"
          className="tw-absolute -tw-top-2 tw-left-2 -tw-mt-px tw-inline-block tw-bg-white tw-px-1 tw-text-xs tw-font-medium tw-text-gray-900"
        >
          {props.label}
        </label>
      </Transition>
      {props.textarea ?
        <textarea
          id={props.id}
          name={props.id}
          autoComplete={props.id}
          placeholder={focused ? undefined : props.placeholder}
          className={mergeClasses(classes)}
          onKeyDown={onKeydown}
          onFocus={() => { setFocused(true); }}
          onChange={e => props.setValue(e.target.value)}
          onBlur={() => { setFocused(false); }}
          value={props.value ? props.value : ""}
        />
        :
        <input
          type={props.type ? props.type : 'text'}
          id={props.id}
          name={props.id}
          autoComplete={props.id}
          placeholder={focused ? undefined : props.placeholder}
          className={mergeClasses(classes)}
          onKeyDown={onKeydown}
          onFocus={() => { setFocused(true); }}
          onChange={e => { e.target.type === 'number' ? props.setValue(parseInt(e.target.value)) : props.setValue(e.target.value); }}
          onBlur={() => { setFocused(false); }}
          value={props.value ? props.value : ""}
          {...other}
        />
      }
    </div>
  );
};

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  placeholder?: string;
  setValue: (value: any) => void;
  className?: string;
  textarea?: boolean;
  type?: HTMLInputTypeAttribute;
  label?: string;
};

export const ValidatedInput: React.FC<InputProps> = props => {
  const { id, value, placeholder, setValue, className, textarea, type, label, ...other } = props;
  const [isValid, setIsValid] = useState(true);
  const [focused, setFocused] = useState(false);
  let classes = ['tw-border tw-border-solid tw-border-slate-300 tw-rounded-md tw-py-2.5 tw-px-3 tw-w-full tw-box-border hover:tw-border-slate-400 focus:tw-border-slate-700 tw-outline-none', className];
  if (!isValid) {
    classes.push('tw-border-red-600');
  }

  const onKeydown = (event: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    event.stopPropagation();
    if (event.key === 'Escape') {
      event.currentTarget.blur();
    }
  };

  const validateNotEmpty = (value: string | number | readonly string[] | undefined): boolean => {
    if (typeof value === "number") {
      return true;
    }

    const valid = value !== undefined && value.length > 0;
    setIsValid(valid);
    return valid;
  };

  const showLabel = label !== undefined && (focused || (value !== undefined && (value !== "string" || value.length > 0)));

  return (
    <div className={mergeClasses("tw-relative", label && "tw-mt-4")}>
      <Transition
        show={showLabel}
        enter="tw-transition tw-ease tw-duration-200 tw-transform"
        enterFrom="tw-translate-y-4 tw-opacity-10"
        enterTo="tw-translate-y-0"
        leave="tw-transition tw-ease tw-duration-200 tw-transform"
        leaveFrom="tw-translate-y-0"
        leaveTo="tw-translate-y-4 tw-opacity-10"
      >
        <label
          htmlFor="name"
          className="tw-absolute -tw-top-2 tw-left-2 -tw-mt-px tw-inline-block tw-bg-white tw-px-1 tw-text-xs tw-font-medium tw-text-gray-900"
        >
          {label}
        </label>
      </Transition>
      {textarea ?
        <textarea
          id={id}
          name={id}
          autoComplete={id}
          placeholder={focused ? undefined : placeholder}
          className={mergeClasses(classes)}
          onKeyDown={onKeydown}
          onFocus={() => { setIsValid(true); setFocused(true); }}
          onChange={e => setValue(e.target.value)}
          onBlur={() => { validateNotEmpty(value); setFocused(false); }}
          value={value ? value : ""}
        />
        :
        <input
          type={type ? type : 'text'}
          name={id}
          autoComplete={id}
          placeholder={focused ? undefined : placeholder}
          className={mergeClasses(classes)}
          onKeyDown={onKeydown}
          onFocus={() => { setIsValid(true); setFocused(true); }}
          onChange={e => { e.target.type === 'number' ? props.setValue(parseInt(e.target.value)) : props.setValue(e.target.value); }}
          onBlur={() => { validateNotEmpty(value); setFocused(false); }}
          {...other}
        />
      }
    </div>
  );
};

type ValidatedDropdownInputProps = {
  by?: string;
  options: any[] | undefined;
  selected: any | undefined;
  setSelected: (option: any) => void;
  getElementForDisplay?: (option: any) => string | React.ReactElement;
  getElementForDropdown?: (option: any) => string | React.ReactElement;
  loading: boolean;
  placeholder: string;
  noOptionsString: string;
  className?: string;
  validated?: boolean;
  noCaret?: boolean;
  label?: string;
  dropdownHeight?: string;
};

export const ValidatedDropdownInput: React.FC<ValidatedDropdownInputProps> = props => {
  const [isValid, setIsValid] = useState(true);
  const [focused, setFocused] = useState(false);
  const [referenceElement, setReferenceElement] = useState<HTMLButtonElement | null>(null);
  const [popperElement, setPopperElement] = useState<HTMLDivElement | null>(null);
  const { styles, attributes } = usePopper(referenceElement, popperElement, {
    strategy: 'fixed',
    modifiers: [sameWidth],
  });

  const validateNotUndefined = (value: number | undefined): boolean => {
    const valid = value !== undefined;
    setIsValid(valid);
    return valid;
  };

  const getElementForDisplay = props.getElementForDisplay ? props.getElementForDisplay : (value: any) => value;
  const getElementForDropdown = props.getElementForDropdown ? props.getElementForDropdown : getElementForDisplay;
  const showLabel = props.label !== undefined && (focused || (props.selected !== undefined));

  // TODO: Hack because Headless UI does not handle undefined correctly
  const value = props.selected === undefined ? UNSET : props.selected;

  return (
    <Listbox as="div" className="tw-flex tw-w-fit" by={props.by} value={value} onChange={value => { props.setSelected(value); setIsValid(true); }}>
      <div className="tw-relative tw-w-fit">
        <Transition
          show={showLabel}
          enter="tw-transition tw-ease tw-duration-200 tw-transform"
          enterFrom="tw-translate-y-4 tw-opacity-10"
          enterTo="tw-translate-y-0"
          leave="tw-transition tw-ease tw-duration-200 tw-transform"
          leaveFrom="tw-translate-y-0"
          leaveTo="tw-translate-y-4 tw-opacity-10"
        >
          <label
            htmlFor="name"
            className="tw-absolute tw-top-3 tw-left-2 -tw-mt-px tw-inline-block tw-bg-white tw-px-1 tw-text-xs tw-font-medium tw-text-gray-900"
          >
            {props.label}
          </label>
        </Transition>
        <Listbox.Button
          ref={setReferenceElement}
          className={mergeClasses("tw-flex tw-justify-center tw-items-center tw-w-96 tw-mt-5 tw-rounded-md tw-py-2.5 tw-px-3 tw-text-left tw-border tw-border-solid tw-border-slate-300 hover:tw-border-slate-400 aria-expanded:tw-border-slate-700", props.className, props.validated && !isValid && 'tw-border-red-600')}
        >
          <div className={mergeClasses("tw-inline-block tw-w-[calc(100%-20px)] tw-truncate tw-overflow-none", !props.selected && "tw-text-slate-400")}>
            {value !== UNSET ? getElementForDisplay(props.selected) : props.placeholder}
          </div>
          {!props.noCaret &&
            <span className="tw-pointer-events-none pr-2">
              <ChevronUpDownIcon
                className="tw-inline tw-float-right tw-h-5 tw-w-5 tw-text-slate-400"
                aria-hidden="true"
              />
            </span>}
        </Listbox.Button>
        <div className="tw-relative tw-z-10" ref={setPopperElement} style={styles.popper} {...attributes.popper}>
          <Transition
            as={Fragment}
            enter="tw-transition tw-ease-out tw-duration-100"
            enterFrom="tw-transform tw-opacity-0 tw-scale-95"
            enterTo="tw-transform tw-opacity-100 tw-scale-100"
            leave="tw-transition tw-ease-in tw-duration-100"
            leaveFrom="tw-transform tw-opacity-100 tw-scale-100"
            leaveTo="tw-transform tw-opacity-0 tw-scale-95"
            beforeEnter={() => setFocused(true)}
            afterLeave={() => { validateNotUndefined(props.selected); setFocused(false); }}
          >
            <Listbox.Options className={mergeClasses("tw-absolute tw-z-20 tw-mt-1 tw-max-h-60 tw-min-w-full tw-overflow-auto tw-rounded-md tw-bg-white tw-py-1 tw-text-base tw-shadow-lg tw-ring-1 tw-ring-slate-900 tw-ring-opacity-5 focus:tw-outline-none sm:tw-text-sm", props.dropdownHeight)}>
              <DropdownOptions loading={props.loading} options={props.options} noOptionsString={props.noOptionsString} getElementForDisplay={getElementForDropdown} />
            </Listbox.Options>
          </Transition>
        </div>
      </div>
    </Listbox>
  );
};

type DropdownOptionsProps = {
  loading: boolean,
  options: any[] | undefined,
  noOptionsString: string,
  getElementForDisplay: (value: any) => string | React.ReactElement,
};

const DropdownOptions: React.FC<DropdownOptionsProps> = props => {
  if (props.loading) {
    return (
      <div className="tw-p-2">
        <Loading className="tw-m-auto tw-block" />
      </div>
    );
  }

  if (props.options && props.options.length > 0) {
    return (
      <>
        {props.options!.map((option: any, index: number) => (
          <Listbox.Option key={index} value={option} className={({ active, selected }) =>
            `tw-relative tw-cursor-pointer tw-select-none tw-py-2.5 tw-pl-4 tw-pr-4 ${(active || selected) ? 'tw-bg-slate-100 tw-text-slate-900' : 'tw-text-slate-900'
            }`
          }>
            {({ selected }) => (
              <>
                <span className={`tw-block tw-truncate ${selected ? 'tw-font-medium' : 'tw-font-normal'}`}>
                  {props.getElementForDisplay(option)}
                </span>
                {selected ? (
                  <span className="tw-absolute tw-inset-y-0 tw-right-0 tw-flex tw-items-center tw-pr-3 tw-text-slate-600">
                    <CheckIcon className="tw-h-5 tw-w-5" aria-hidden="true" />
                  </span>
                ) : null}
              </>
            )}
          </Listbox.Option>
        ))
        }
      </>
    );
  } else {
    return (
      <div className="tw-p-2 tw-pl-4 tw-select-none">{props.noOptionsString}</div>
    );
  }
};


type ValidatedComboInputProps = {
  by?: string;
  options: any[] | undefined;
  selected: any | undefined;
  setSelected: (option: any) => void;
  getElementForDisplay?: (option: any) => string | React.ReactElement;
  loading: boolean;
  placeholder: string;
  noOptionsString: string;
  className?: string;
  validated?: boolean;
  allowCustom?: boolean;
  label?: string;
  dropdownHeight?: string;
};

export const ValidatedComboInput: React.FC<ValidatedComboInputProps> = props => {
  const [isValid, setIsValid] = useState(true);
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [referenceElement, setReferenceElement] = useState<HTMLDivElement | null>(null);
  const [popperElement, setPopperElement] = useState<HTMLDivElement | null>(null);
  const { styles, attributes } = usePopper(referenceElement, popperElement, {
    strategy: 'fixed',
    modifiers: [sameWidth],
  });

  const getFilteredOptions = () => {
    if (query === '') {
      return props.options;
    }

    if (props.options) {
      return props.options.filter((option) => {
        const displayValue = props.getElementForDisplay ? props.getElementForDisplay(option) : option;
        if (typeof displayValue === "string") {
          return displayValue.toLowerCase().includes(query.toLowerCase());
        } else {
          return true; // TODO: figure out how to do this for elements
        }
      });
    }

    return [];
  };
  const filteredOptions = getFilteredOptions();
  const getElementForDisplay = props.getElementForDisplay ? props.getElementForDisplay : (value: any) => value;
  const showLabel = props.label !== undefined && (focused || (props.selected !== undefined));

  const validateNotUndefined = (value: number | undefined): boolean => {
    const valid = value !== undefined;
    setIsValid(valid);
    return valid;
  };

  // TODO: Hack because Headless UI does not handle undefined correctly
  const value = props.selected === undefined ? UNSET : props.selected;

  return (
    <Combobox as="div" className="tw-flex tw-w-fit" by={props.by} value={value} onChange={(value: number) => { props.setSelected(value); setIsValid(true); }}>
      <div className="tw-relative tw-w-fit">
        <Transition
          show={showLabel}
          enter="tw-transition tw-ease tw-duration-200 tw-transform"
          enterFrom="tw-translate-y-4 tw-opacity-10"
          enterTo="tw-translate-y-0"
          leave="tw-transition tw-ease tw-duration-200 tw-transform"
          leaveFrom="tw-translate-y-0"
          leaveTo="tw-translate-y-4 tw-opacity-10"
        >
          <label
            htmlFor="name"
            className="tw-absolute tw-top-3 tw-left-2 -tw-mt-px tw-inline-block tw-bg-white tw-px-1 tw-text-xs tw-font-medium tw-text-gray-900"
          >
            {props.label}
          </label>
        </Transition>
        <div ref={setReferenceElement} className={mergeClasses("tw-flex tw-w-96 tw-mt-5 tw-rounded-md tw-bg-white tw-py-2.5 tw-px-3 tw-text-left tw-border tw-border-solid tw-border-slate-300 hover:tw-border-slate-400 focus-within:!tw-border-slate-700", props.className, props.validated && !isValid && 'tw-border-red-600')}>
          <Combobox.Input
            className={"tw-inline tw-bg-transparent tw-w-[calc(100%-20px)] tw-border-none tw-text-sm tw-leading-5 tw-text-slate-900 tw-outline-none tw-text-ellipsis tw-cursor-pointer focus:tw-cursor-text"}
            displayValue={selected => selected !== UNSET ? getElementForDisplay(selected) : ""}
            onChange={event => setQuery(event.target.value)}
            placeholder={props.placeholder}
            onClick={() => buttonRef.current?.click()}
          >
          </Combobox.Input>
          <Combobox.Button className="tw-inline-block tw-h-full" ref={buttonRef}>
            <span className="tw-pointer-events-none pr-2">
              <ChevronUpDownIcon
                className="tw-inline tw-float-right tw-h-5 tw-w-5 tw-text-slate-400"
                aria-hidden="true"
              />
            </span>
          </Combobox.Button>
        </div>
        <div className="tw-relative tw-z-10" ref={setPopperElement} style={styles.popper} {...attributes.popper}>
          <Transition
            as={Fragment}
            enter="tw-transition tw-ease-out tw-duration-100"
            enterFrom="tw-transform tw-opacity-0 tw-scale-95"
            enterTo="tw-transform tw-opacity-100 tw-scale-100"
            leave="tw-transition tw-ease-in tw-duration-100"
            leaveFrom="tw-transform tw-opacity-100 tw-scale-100"
            leaveTo="tw-transform tw-opacity-0 tw-scale-95"
            beforeEnter={() => setFocused(true)}
            afterLeave={() => { validateNotUndefined(props.selected); setQuery(''); setFocused(false); }}
          >
            <Combobox.Options className={mergeClasses("tw-absolute tw-z-20 tw-mt-1 tw-min-w-full tw-max-h-60 tw-overflow-auto tw-rounded-md tw-bg-white tw-py-1 tw-text-base tw-shadow-lg tw-ring-1 tw-ring-slate-900 tw-ring-opacity-5 focus:tw-outline-none sm:tw-text-sm", props.dropdownHeight)}>
              <ComboOptions loading={props.loading} options={filteredOptions} noOptionsString={props.noOptionsString} getElementForDisplay={getElementForDisplay} query={query} allowCustom={props.allowCustom} />
            </Combobox.Options>
          </Transition>
        </div>
      </div>
    </Combobox >
  );
};

type ComboOptionsProps = {
  loading: boolean,
  options: any[] | undefined,
  noOptionsString: string,
  getElementForDisplay: (value: any) => string | React.ReactElement,
  query: string,
  allowCustom?: boolean,
};

const ComboOptions: React.FC<ComboOptionsProps> = props => {
  if (props.loading) {
    return (
      <div className="tw-p-2">
        <Loading className="tw-m-auto tw-block" />
      </div>
    );
  }

  if (props.options && props.options.length > 0) {
    return (
      <>
        {props.allowCustom && props.query.length > 0 && (
          <Combobox.Option value={props.query} className={({ active, selected }) =>
            `tw-relative tw-cursor-pointer tw-select-none tw-py-2.5 tw-pl-4 tw-pr-4 ${(active || selected) ? 'tw-bg-slate-100 tw-text-slate-900' : 'tw-text-slate-900'
            }`
          }>
            Custom: "{props.query}"
          </Combobox.Option>
        )}
        {props.options!.map((option: any, index: number) => (
          <Combobox.Option key={index} value={option} className={({ active, selected }) =>
            `tw-relative tw-cursor-pointer tw-select-none tw-py-2.5 tw-pl-4 tw-pr-4 ${(active || selected) ? 'tw-bg-slate-100 tw-text-slate-900' : 'tw-text-slate-900'
            }`
          }>
            {({ selected }) => (
              <>
                <span className={`tw-block tw-truncate ${selected ? 'tw-font-medium' : 'tw-font-normal'}`}>
                  {props.getElementForDisplay(option)}
                </span>
                {selected ? (
                  <span className="tw-absolute tw-inset-y-0 tw-right-0 tw-flex tw-items-center tw-pr-3 tw-text-slate-600">
                    <CheckIcon className="tw-h-5 tw-w-5" aria-hidden="true" />
                  </span>
                ) : null}
              </>
            )}
          </Combobox.Option>
        ))
        }
      </>
    );
  } else {
    return (
      <>
        {props.allowCustom ?
          props.allowCustom && props.query.length > 0 && (
            <Combobox.Option value={props.query} className={({ active, selected }) =>
              `tw-relative tw-cursor-pointer tw-select-none tw-py-2.5 tw-pl-4 tw-pr-4 ${(active || selected) ? 'tw-bg-slate-100 tw-text-slate-900' : 'tw-text-slate-900'
              }`
            }>
              Custom: "{props.query}"
            </Combobox.Option>
          )
          :
          <div className="tw-p-2 tw-pl-4 tw-select-none">{props.noOptionsString}</div>
        }
      </>
    );
  }
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
  }
};