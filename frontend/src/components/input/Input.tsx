import {
  autoUpdate,
  flip,
  offset,
  shift,
  size,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
  useRole,
} from "@floating-ui/react";
import { Combobox, Listbox, Transition } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import { AsYouType, CountryCode, getCountryCallingCode } from "libphonenumber-js";
import React, {
  Fragment,
  InputHTMLAttributes,
  TextareaHTMLAttributes,
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { CountryCodes } from "src/components/input/types";
import { Loading } from "src/components/loading/Loading";
import { Tooltip } from "src/components/tooltip/Tooltip";
import { mergeClasses } from "src/utils/twmerge";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  value: string | number; // Need explicit value prop to display label correctly
  label?: string;
  tooltip?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  const { id, disabled, className, label, tooltip, value, onBlur, onFocus, ...other } = props;
  const [focused, setFocused] = useState<boolean>(false);
  let classes = [
    "tw-flex tw-border tw-border-solid tw-border-slate-300 tw-bg-white tw-rounded-md tw-py-[6px] tw-px-3 tw-w-full tw-box-border focus-within:tw-border-slate-400 tw-outline-none",
    !disabled && "hover:tw-border-slate-400 tw-cursor-text",
    disabled && "tw-bg-slate-50 tw-select-none tw-cursor-not-allowed",
    className,
  ];

  const inputRef = useRef<HTMLInputElement | null>(null);
  useImperativeHandle<HTMLInputElement | null, HTMLInputElement | null>(ref, () => inputRef.current, []);

  const onKeydown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    event.stopPropagation();
    if (event.key === "Escape") {
      event.currentTarget.blur();
    }
  };

  const showLabel = focused || inputRef.current?.value || props.value;

  return (
    <div
      className={mergeClasses(...classes)}
      onClick={() => {
        inputRef.current?.focus();
      }}
    >
      <div className={mergeClasses("tw-relative tw-flex tw-flex-col tw-w-full", label && "tw-mt-3.5")}>
        {label && (
          <label
            htmlFor={id}
            className={mergeClasses(
              "tw-absolute -tw-top-1.5 tw-text-base tw-text-slate-600 tw-cursor-[inherit] tw-select-none tw-inline-block tw-transition-all tw-duration-150",
              showLabel && "-tw-top-3.5 tw-text-xs",
            )}
          >
            {label}
          </label>
        )}
        <input
          id={id}
          name={id}
          ref={inputRef}
          autoComplete={id}
          className="tw-w-full tw-mt-0.5 tw-outline-none tw-ring-none tw-text-base disabled:tw-bg-slate-50 disabled:tw-select-none tw-cursor-[inherit] tw-hide-number-wheel"
          onKeyDown={onKeydown}
          onBlur={(e) => {
            setFocused(false);
            onBlur && onBlur(e);
          }}
          onFocus={(e) => {
            setFocused(true);
            onFocus && onFocus(e);
          }}
          onWheel={(e) => e.currentTarget.blur()}
          disabled={disabled}
          {...other}
        />
      </div>
      {tooltip && (
        <Tooltip content={tooltip}>
          <InformationCircleIcon className="tw-w-5 tw-mr-2" />
        </Tooltip>
      )}
    </div>
  );
});

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  tooltip?: string;
}

export const TextArea: React.FC<TextAreaProps> = forwardRef<HTMLTextAreaElement, TextAreaProps>((props, ref) => {
  const { id, value, disabled, className, label, tooltip, onBlur, onFocus, ...other } = props;
  const [focused, setFocused] = useState<boolean>(false);
  let classes = [
    "tw-flex tw-border tw-border-solid tw-border-slate-300 tw-bg-white tw-rounded-md tw-py-2.5 tw-px-3 tw-w-full tw-box-border focus-within:tw-border-slate-400 tw-outline-none",
    !disabled && "hover:tw-border-slate-400 tw-cursor-text",
    disabled && "tw-bg-slate-50 tw-select-none tw-cursor-not-allowed",
    className,
  ];

  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);
  useImperativeHandle<HTMLTextAreaElement | null, HTMLTextAreaElement | null>(ref, () => textAreaRef.current, []);

  const onKeydown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    event.stopPropagation();
    if (event.key === "Escape") {
      event.currentTarget.blur();
    }
  };

  const showLabel = focused || textAreaRef.current?.value || props.value;

  return (
    <div
      className={mergeClasses(...classes)}
      onClick={() => {
        textAreaRef.current?.focus();
      }}
    >
      <div className={mergeClasses("tw-relative tw-flex tw-flex-col tw-w-full", label && "tw-pt-3")}>
        {label && (
          <label
            htmlFor={id}
            className={mergeClasses(
              "tw-absolute -tw-top-1 tw-text-base tw-text-slate-600 tw-cursor-[inherit] tw-select-none tw-inline-block tw-transition-all tw-duration-150",
              showLabel && "-tw-top-1 tw-text-xs",
            )}
          >
            {label}
          </label>
        )}
        <textarea
          id={id}
          name={id}
          ref={textAreaRef}
          autoComplete={id}
          className="tw-w-full tw-outline-none tw-text-base tw-mt-1 disabled:tw-bg-slate-50 disabled:tw-select-none tw-cursor-[inherit]"
          onKeyDown={onKeydown}
          value={value ? value : ""}
          onBlur={(e) => {
            setFocused(false);
            onBlur && onBlur(e);
          }}
          onFocus={(e) => {
            setFocused(true);
            onFocus && onFocus(e);
          }}
          disabled={disabled}
          {...other}
        />
      </div>
      {tooltip && (
        <Tooltip content={tooltip}>
          <InformationCircleIcon className="tw-w-5 tw-mr-4" />
        </Tooltip>
      )}
    </div>
  );
});

export type ValidatedDropdownInputProps = {
  id?: string;
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
  valid?: boolean;
  disabled?: boolean;
};

export const ValidatedDropdownInput: React.FC<ValidatedDropdownInputProps> = (props) => {
  const [computedValid, setComputedValid] = useState<boolean>(true);
  const [focused, setFocused] = useState(false);

  const { refs, floatingStyles, context } = useFloating({
    open: focused,
    onOpenChange: setFocused,
    middleware: [offset(10), flip({ fallbackAxisSideDirection: "end" }), shift()],
    whileElementsMounted: autoUpdate,
  });
  const click = useClick(context, {
    keyboardHandlers: false,
  });
  const dismiss = useDismiss(context);
  const role = useRole(context);
  const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss, role]);

  const validateNotUndefined = (value: number | undefined): boolean => {
    const valid = value !== undefined;
    setComputedValid(valid);
    return valid;
  };

  const getElementForDisplay = props.getElementForDisplay ? props.getElementForDisplay : (value: any) => value;
  const getElementForDropdown = props.getElementForDropdown ? props.getElementForDropdown : getElementForDisplay;
  const showLabel = props.label !== undefined && (focused || props.selected !== undefined);

  // An undefined value will cause the input to be uncontrolled, so change to null
  const value = props.selected === undefined ? null : props.selected;

  // Allow explicitly passing the valid property to override the computed value
  const valid = props.valid !== undefined ? props.valid : computedValid;

  return (
    <Listbox
      value={value}
      disabled={props.disabled}
      onChange={(value) => {
        props.setSelected(value);
        setComputedValid(true);
      }}
    >
      <div className="tw-relative">
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
            className="tw-absolute -tw-top-2 tw-left-2 -tw-mt-px tw-inline-block tw-bg-white tw-px-1 tw-text-xs tw-font-medium tw-text-primary"
          >
            {props.label}
          </label>
        </Transition>
        <Listbox.Button
          ref={refs.setReference}
          className={mergeClasses(
            "tw-flex tw-justify-center tw-items-center tw-w-96 tw-mt-5 tw-rounded-md tw-py-2.5 tw-px-3 tw-text-left tw-border tw-border-solid tw-border-slate-300 aria-expanded:tw-border-primary",
            !props.disabled && "hover:tw-border-primary-hover",
            props.disabled && "tw-bg-slate-100 tw-text-slate-400 tw-cursor-not-allowed",
            props.className,
            props.validated && !valid && "tw-border-red-600",
          )}
          {...getReferenceProps()}
        >
          <div
            className={mergeClasses(
              "tw-inline-block tw-w-[calc(100%-20px)] tw-truncate tw-overflow-none",
              !props.selected && "tw-text-slate-400",
            )}
          >
            {value ? getElementForDisplay(props.selected) : props.placeholder}
          </div>
          {!props.noCaret && (
            <span className="tw-pointer-events-none pr-2">
              <ChevronUpDownIcon
                className="tw-inline tw-float-right tw-h-5 tw-w-5 tw-text-slate-400"
                aria-hidden="true"
              />
            </span>
          )}
        </Listbox.Button>
        <div className="tw-relative tw-z-10" ref={refs.setFloating} style={floatingStyles} {...getFloatingProps()}>
          <Transition
            as={Fragment}
            enter="tw-transition tw-ease-out tw-duration-100"
            enterFrom="tw-transform tw-opacity-0 tw-scale-95"
            enterTo="tw-transform tw-opacity-100 tw-scale-100"
            leave="tw-transition tw-ease-in tw-duration-100"
            leaveFrom="tw-transform tw-opacity-100 tw-scale-100"
            leaveTo="tw-transform tw-opacity-0 tw-scale-95"
            beforeEnter={() => setFocused(true)}
            afterLeave={() => {
              validateNotUndefined(props.selected);
              setFocused(false);
            }}
          >
            <Listbox.Options
              className={mergeClasses(
                "tw-absolute tw-z-20 tw-mt-1 tw-max-h-60 tw-min-w-full tw-overflow-auto tw-rounded-md tw-bg-white tw-py-1 tw-text-base tw-shadow-lg tw-ring-1 tw-ring-slate-900 tw-ring-opacity-5 focus:tw-outline-none sm:tw-text-sm",
                props.dropdownHeight,
              )}
            >
              <DropdownOptions
                loading={props.loading}
                options={props.options}
                noOptionsString={props.noOptionsString}
                getElementForDisplay={getElementForDropdown}
              />
            </Listbox.Options>
          </Transition>
        </div>
      </div>
    </Listbox>
  );
};

type DropdownOptionsProps = {
  loading: boolean;
  options: any[] | undefined;
  noOptionsString: string;
  getElementForDisplay: (value: any) => string | React.ReactElement;
};

const DropdownOptions: React.FC<DropdownOptionsProps> = (props) => {
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
          <Listbox.Option
            key={index}
            value={option}
            className={({ active, selected }) =>
              `tw-relative tw-cursor-pointer tw-select-none tw-py-2.5 tw-pl-4 tw-pr-4 ${
                active || selected ? "tw-bg-slate-100 tw-text-slate-900" : "tw-text-slate-900"
              }`
            }
          >
            {({ selected }) => (
              <>
                <span className={`tw-block tw-truncate ${selected ? "tw-font-medium" : "tw-font-normal"}`}>
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
        ))}
      </>
    );
  } else {
    return <div className="tw-p-2 tw-pl-4 tw-select-none">{props.noOptionsString}</div>;
  }
};

export type ComboInputProps = {
  options: any[] | undefined;
  value: any;
  onChange: (...event: any[]) => void;
  getElementForDisplay?: (option: any) => string | React.ReactElement;
  loading?: boolean;
  placeholder: string;
  noOptionsString?: string;
  className?: string;
  allowCustom?: boolean;
  label?: string;
  dropdownHeight?: string;
  nullable?: boolean;
  valid?: boolean;
  disabled?: boolean;
};

export const ComboInput: React.FC<ComboInputProps> = (props) => {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const { refs, floatingStyles, context } = useFloating<HTMLDivElement>({
    open,
    onOpenChange: setOpen,
    middleware: [
      offset(4),
      shift(),
      size({
        apply({ rects, availableHeight, elements }) {
          Object.assign(elements.floating.style, {
            width: `${rects.reference.width}px`,
            maxHeight: `${availableHeight}px`,
          });
        },
        padding: 10,
      }),
    ],
    whileElementsMounted: autoUpdate,
  });
  const click = useClick(context, {
    keyboardHandlers: false,
  });
  const dismiss = useDismiss(context);
  const role = useRole(context);
  const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss, role]);

  const getFilteredOptions = () => {
    if (query === "") {
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
  const showLabel = props.label !== undefined && (open || props.value !== undefined);

  // An undefined value will cause the input to be uncontrolled, so change to null
  const value = props.value === undefined ? null : props.value;

  return (
    <Combobox
      value={value}
      disabled={props.disabled}
      onChange={(e) => {
        setOpen(false);
        props.onChange(e);
      }}
    >
      <div className="tw-relative tw-flex">
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
            className="tw-absolute tw-top-5 tw-left-2 -tw-mt-px tw-inline-block tw-bg-white tw-px-1 tw-text-xs tw-text-slate-600"
          >
            {props.label}
          </label>
        </Transition>
        <div
          ref={refs.setReference}
          {...getReferenceProps()}
          className={mergeClasses(
            "tw-flex tw-rounded-md tw-bg-white tw-text-left tw-border tw-border-solid tw-border-slate-300 focus-within:!tw-border-gray-700 tw-transition tw-duration-100 tw-cursor-pointer",
            !props.disabled && "hover:tw-border-gray-400",
            props.disabled && "tw-bg-slate-100 tw-cursor-not-allowed",
            props.className,
            props.valid === false && "tw-border-red-600",
          )}
        >
          <div className="tw-py-4 tw-px-3 tw-flex tw-flex-1">
            <Combobox.Input
              className={mergeClasses(
                "tw-inline tw-bg-transparent tw-w-[calc(100%-20px)] tw-border-none tw-text-base tw-leading-5 tw-text-slate-900 tw-outline-none tw-text-ellipsis tw-cursor-pointer focus:tw-cursor-text tw-transition-all tw-duration-10",
                showLabel && "tw-mt-3 -tw-mb-1",
                props.disabled && "tw-bg-slate-100 tw-text-slate-400 tw-cursor-not-allowed",
              )}
              onClick={(e) => open && e.stopPropagation()}
              displayValue={(value) => (value ? getElementForDisplay(value) : "")}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={props.placeholder}
            />
            <Combobox.Button className="tw-inline-block tw-h-full" ref={buttonRef}>
              <span className="tw-pointer-events-none pr-2">
                <ChevronUpDownIcon
                  className="tw-inline tw-float-right tw-h-5 tw-w-5 tw-text-slate-400"
                  aria-hidden="true"
                />
              </span>
            </Combobox.Button>
          </div>
        </div>
        <div className="tw-relative tw-z-10" ref={refs.setFloating} style={floatingStyles} {...getFloatingProps()}>
          <Transition
            as={Fragment}
            show={open}
            enter="tw-transition tw-ease-out tw-duration-100"
            enterFrom="tw-transform tw-opacity-0 tw-scale-95"
            enterTo="tw-transform tw-opacity-100 tw-scale-100"
            leave="tw-transition tw-ease-in tw-duration-100"
            leaveFrom="tw-transform tw-opacity-100 tw-scale-100"
            leaveTo="tw-transform tw-opacity-0 tw-scale-95"
            afterLeave={() => {
              setQuery("");
            }}
          >
            <Combobox.Options
              static
              className={mergeClasses(
                "tw-absolute tw-z-20 tw-mt-1 tw-min-w-full tw-max-h-60 tw-overflow-auto tw-rounded-md tw-bg-white tw-py-1 tw-text-base tw-shadow-lg tw-ring-1 tw-ring-slate-900 tw-ring-opacity-5 focus:tw-outline-none sm:tw-text-sm",
                props.dropdownHeight,
              )}
            >
              <ComboOptions
                loading={props.loading ? props.loading : false}
                options={filteredOptions}
                noOptionsString={props.noOptionsString ? props.noOptionsString : "No options!"}
                getElementForDisplay={getElementForDisplay}
                query={query}
                allowCustom={props.allowCustom}
              />
            </Combobox.Options>
          </Transition>
        </div>
      </div>
    </Combobox>
  );
};

type ComboOptionsProps = {
  loading: boolean;
  options: any[] | undefined;
  noOptionsString: string;
  getElementForDisplay: (value: any) => string | React.ReactElement;
  query: string;
  allowCustom?: boolean;
};

const ComboOptions: React.FC<ComboOptionsProps> = (props) => {
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
          <Combobox.Option
            value={props.query}
            className={({ active, selected }) =>
              `tw-relative tw-cursor-pointer tw-select-none tw-text-base tw-py-2.5 tw-pl-4 tw-pr-4 ${
                active || selected ? "tw-bg-slate-100 tw-text-slate-900" : "tw-text-slate-900"
              }`
            }
          >
            Custom: "{props.query}"
          </Combobox.Option>
        )}
        {props.options!.map((option: any, index: number) => (
          <Combobox.Option
            key={index}
            value={option}
            className={({ active, selected }) =>
              `tw-relative tw-cursor-pointer tw-select-none tw-text-base tw-py-2.5 tw-pl-4 tw-pr-4 ${
                active || selected ? "tw-bg-slate-100 tw-text-slate-900" : "tw-text-slate-900"
              }`
            }
          >
            {({ selected }) => (
              <>
                <span className={`tw-block tw-truncate ${selected ? "tw-font-medium" : "tw-font-normal"}`}>
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
        ))}
      </>
    );
  } else {
    return (
      <>
        {props.allowCustom ? (
          props.allowCustom &&
          props.query.length > 0 && (
            <Combobox.Option
              value={props.query}
              className={({ active, selected }) =>
                `tw-relative tw-cursor-pointer tw-select-none tw-py-2.5 tw-pl-4 tw-pr-4 ${
                  active || selected ? "tw-bg-slate-100 tw-text-slate-900" : "tw-text-slate-900"
                }`
              }
            >
              Custom: "{props.query}"
            </Combobox.Option>
          )
        ) : (
          <div className="tw-p-2 tw-pl-4 tw-select-none">{props.noOptionsString}</div>
        )}
      </>
    );
  }
};

const getFormatted = (code: CountryCode, value: string | undefined) => {
  const ayt = new AsYouType(code);
  ayt.input(value ? (value as string) : "");
  const national = ayt.getNationalNumber();

  return new AsYouType(code).input(national);
};

const isLetterKey = (key: string) => {
  if (key.length > 1) return false;
  const lower = key.toLowerCase();
  return lower >= "a" && lower <= "z";
};

export const PhoneInput = forwardRef<HTMLInputElement, InputProps & { wrapperClass: string }>((props, ref) => {
  const { onChange, type, wrapperClass, value, ...other } = props;
  const [code, setCode] = useState<CountryCode>("US");

  const updatePhoneNumber = (event: React.ChangeEvent<HTMLInputElement>) => {
    const phoneNumber = event.target.value;
    const asyoutype = new AsYouType(code);
    asyoutype.input(phoneNumber);
    const formatted = String(asyoutype.getNumberValue());
    onChange && onChange({ ...event, target: { ...event.target, value: formatted } });
  };

  const formatted = getFormatted(code, value as string | undefined);

  return (
    <div className={mergeClasses("tw-flex", wrapperClass)}>
      <CountryCodePicker currentCode={code} setCode={setCode} />
      <Input
        ref={ref}
        type="tel"
        {...other}
        value={formatted}
        onChange={updatePhoneNumber}
        onKeyDown={(e) => {
          if (isLetterKey(e.key) && !e.metaKey) {
            e.preventDefault();
          }
        }}
      />
    </div>
  );
});

export const CountryCodePicker: React.FC<{ currentCode: CountryCode; setCode: (code: CountryCode) => void }> = ({
  currentCode,
  setCode,
}) => {
  const [open, setOpen] = useState(false);
  const { refs, floatingStyles, context } = useFloating({
    open: open,
    onOpenChange: setOpen,
    middleware: [offset(4)],
    whileElementsMounted: autoUpdate,
  });
  const click = useClick(context, {
    keyboardHandlers: false,
  });
  const dismiss = useDismiss(context);
  const role = useRole(context);
  const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss, role]);

  return (
    <Listbox value={currentCode} onChange={setCode}>
      <Listbox.Button
        className="tw-flex tw-whitespace-normal tw-items-center tw-py-[6px] tw-px-4 tw-mr-1 tw-border tw-border-solid tw-border-slate-300 tw-cursor-pointer tw-select-none tw-rounded-md"
        onClick={() => setOpen(!open)}
        ref={refs.setReference}
        {...getReferenceProps()}
      >
        +{getCountryCallingCode(currentCode)}
      </Listbox.Button>
      <div ref={refs.setFloating} style={floatingStyles} {...getFloatingProps()}>
        <Transition
          as={Fragment}
          enter="tw-transition tw-ease-out tw-duration-100"
          enterFrom="tw-transform tw-opacity-0 tw-scale-95"
          enterTo="tw-transform tw-opacity-100 tw-scale-100"
          leave="tw-transition tw-ease-in tw-duration-75"
          leaveFrom="tw-transform tw-opacity-100 tw-scale-97"
          leaveTo="tw-transform tw-opacity-0 tw-scale-95"
        >
          <Listbox.Options
            as="div"
            className="tw-max-h-64 tw-overflow-scroll tw-bg-white tw-border tw-border-solid tw-border-slate-300 tw-rounded-md"
          >
            {CountryCodes.map((countryCode) => (
              <Listbox.Option
                as="div"
                key={countryCode}
                className="tw-flex tw-items-center tw-justify-center hover:tw-bg-slate-100 tw-py-2 tw-px-3 tw-cursor-pointer tw-gap-2"
                value={countryCode}
              >
                <CheckIcon className="tw-hidden ui-selected:tw-flex tw-h-4" />
                <div className="tw-flex tw-justify-center tw-items-center">
                  {countryCode} (+{getCountryCallingCode(countryCode)})
                </div>
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  );
};

export const PriceInput = forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  const { id, disabled, className, label, tooltip, value, ...other } = props;

  const inputRef = useRef<HTMLInputElement | null>(null);
  useImperativeHandle<HTMLInputElement | null, HTMLInputElement | null>(ref, () => inputRef.current, []);

  const preventMinusAndPeriod = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.code === "Minus" || e.code === "Period") {
      e.preventDefault();
    }
  };

  const stringifyPrice = (price: number | undefined | string | readonly string[]): string => {
    return price === undefined || price === null || Number.isNaN(price) ? "" : price.toString();
  };

  return (
    <div
      className={mergeClasses(
        "tw-flex tw-w-full tw-rounded-md tw-outline tw-outline-1 tw-outline-slate-300 focus-within:tw-outline-slate-400 hover:tw-outline-slate-400 tw-text-base tw-cursor-text",
        className,
      )}
      onClick={() => inputRef.current?.focus()}
    >
      <div className="tw-inline-block tw-relative">
        <div
          className={mergeClasses(
            "tw-flex tw-justify-center tw-items-center tw-py-4 tw-px-3",
            label && "tw-mt-2 -tw-mb-2",
          )}
        >
          ${stringifyPrice(value)}
        </div>
        {label && (
          <label
            htmlFor={id}
            className={mergeClasses(
              "tw-absolute tw-top-1.5 tw-left-3 tw-text-xs tw-text-slate-600 tw-cursor-[inherit] tw-select-none tw-inline-block tw-transition-all tw-duration-150",
            )}
          >
            {label}
          </label>
        )}
        <input
          id={id}
          ref={inputRef}
          type="number"
          value={value ? value : ""}
          onWheel={(e) => e.currentTarget.blur()}
          className={mergeClasses(
            "tw-flex tw-h-full tw-top-0 tw-right-0 tw-bg-transparent tw-absolute tw-text-right tw-text-inherit tw-py-4 tw-px-3 tw-w-full tw-outline-0 tw-hide-number-wheel",
            label && "tw-mt-2 -tw-mb-2",
          )}
          onKeyDown={preventMinusAndPeriod}
          {...other}
        />
      </div>
    </div>
  );
});
