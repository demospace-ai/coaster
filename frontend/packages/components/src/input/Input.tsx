"use client";

import { mergeClasses } from "@coaster/utils/common";
import {
  FloatingFocusManager,
  FloatingPortal,
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
import { Combobox, Listbox, RadioGroup, Transition } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";
import { InformationCircleIcon, MinusCircleIcon, PlusCircleIcon, UserIcon } from "@heroicons/react/24/outline";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import React, {
  Fragment,
  InputHTMLAttributes,
  ReactNode,
  TextareaHTMLAttributes,
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { Loading } from "../loading/Loading";
import { Tooltip } from "../tooltip/Tooltip";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  value: string | number; // Need explicit value prop to display label correctly
  label?: string;
  tooltip?: string;
  icon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  const { id, disabled, className, label, tooltip, value, onBlur, onFocus, ...other } = props;
  const [focused, setFocused] = useState<boolean>(false);
  const classes = [
    "tw-flex tw-border tw-border-solid tw-border-slate-300 tw-bg-white tw-rounded-md tw-py-[6px] tw-px-3 tw-w-full tw-box-border focus-within:tw-border-slate-400 tw-outline-none tw-items-center",
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

  const showLabel = focused || inputRef.current?.value || props.value || props.placeholder;

  return (
    <div
      className={mergeClasses(...classes)}
      onClick={() => {
        inputRef.current?.focus();
      }}
    >
      {props.icon && props.icon}
      <div className={mergeClasses("tw-relative tw-flex tw-w-full tw-flex-col", label && "tw-mt-4 tw-pb-0.5")}>
        {label && (
          <label
            htmlFor={id}
            className={mergeClasses(
              "tw-absolute -tw-top-1.5 tw-inline-block tw-cursor-[inherit] tw-select-none tw-text-base tw-text-slate-600 tw-transition-all tw-duration-150",
              showLabel && "-tw-top-4 tw-text-xs",
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
          className={mergeClasses(
            "tw-ring-none tw-hide-number-wheel tw-w-full tw-cursor-[inherit] tw-text-base tw-outline-none disabled:tw-select-none disabled:tw-bg-slate-50",
            props.label && "tw-mt-0.5",
          )}
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
          <InformationCircleIcon className="tw-mr-2 tw-w-5" />
        </Tooltip>
      )}
    </div>
  );
});

export const RichTextEditor: React.FC<{
  value: string;
  setValue: (value: string) => void;
  onBlur?: () => void;
  label?: string;
  className?: string;
}> = ({ value, setValue, onBlur, label, className }) => {
  const editor = useEditor({
    editorProps: {
      attributes: {
        class:
          "tw-w-full tw-h-full tw-outline-none tw-text-base [&_ul]:tw-list-disc [&_ul]:tw-ml-5 [&_ol]:tw-list-decimal [&_ol]:tw-ml-5",
      },
    },
    extensions: [StarterKit],
    content: value,
    onUpdate: ({ editor }) => {
      if (editor.getText() == "") {
        setValue("");
      } else {
        setValue(editor.getHTML());
      }
    },
    onBlur,
    injectCSS: false,
  });
  const classes = [
    "tw-relative tw-w-full tw-border tw-border-solid tw-border-slate-300 tw-bg-white tw-rounded-md tw-px-3 tw-py-3 focus-within:tw-border-slate-400 tw-resize-y tw-overflow-hidden tw-cursor-text",
    label && "tw-pt-6",
    className,
  ];

  return (
    <div className={mergeClasses(...classes)} onClick={() => editor?.chain().focus()}>
      {label && (
        <label className="tw-absolute tw-top-1.5 tw-inline-block tw-cursor-[inherit] tw-select-none tw-text-xs tw-text-slate-600 tw-transition-all tw-duration-150">
          {label}
        </label>
      )}
      <EditorContent editor={editor} className="tw-h-full tw-w-full tw-overflow-auto" />
    </div>
  );
};

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  tooltip?: string;
}

export const TextArea: React.FC<TextAreaProps> = forwardRef<HTMLTextAreaElement, TextAreaProps>((props, ref) => {
  const { id, value, disabled, className, label, tooltip, onBlur, onFocus, ...other } = props;
  const [focused, setFocused] = useState<boolean>(false);
  const classes = [
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
      <div className={mergeClasses("tw-relative tw-flex tw-w-full tw-flex-col", label && "tw-pt-3")}>
        {label && (
          <label
            htmlFor={id}
            className={mergeClasses(
              "tw-absolute -tw-top-1 tw-inline-block tw-cursor-[inherit] tw-select-none tw-text-base tw-text-slate-600 tw-transition-all tw-duration-150",
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
          className="tw-mt-1 tw-h-full tw-min-h-full tw-w-full tw-cursor-[inherit] tw-text-base tw-outline-none disabled:tw-select-none disabled:tw-bg-slate-50"
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
          <InformationCircleIcon className="tw-mr-4 tw-w-5" />
        </Tooltip>
      )}
    </div>
  );
});

export type DropdownInputProps = {
  options: any[] | undefined;
  value: any;
  onChange: (...event: any[]) => void;
  getElementForDisplay?: (option: any) => string | React.ReactElement;
  loading?: boolean;
  noOptionsString?: string;
  className?: string;
  label?: string;
  dropdownHeight?: string;
  nullable?: boolean;
  valid?: boolean;
  disabled?: boolean;
  multiple?: boolean;
  closeOnSelect?: boolean;
  wrapperClass?: string;
  placeholder?: ReactNode;
};

// TODO: use ref
export const DropdownInput: React.FC<DropdownInputProps> = forwardRef((props, ref) => {
  const [open, setOpen] = useState(false);

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

  const getElementForDisplay = props.getElementForDisplay ? props.getElementForDisplay : (value: any) => value;
  const showLabel = props.label !== undefined && (open || props.value !== undefined);

  return (
    <Listbox
      multiple={props.multiple}
      value={props.value}
      disabled={props.disabled}
      onChange={(e) => {
        !props.multiple && setOpen(false);
        props.onChange(e);
      }}
    >
      <div className={mergeClasses("tw-relative tw-flex", props.wrapperClass)}>
        <Transition
          as={Fragment}
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
            className="tw-absolute tw-left-2 tw-top-5 -tw-mt-px tw-inline-block tw-whitespace-nowrap tw-bg-white tw-px-1 tw-text-xs tw-text-slate-600"
          >
            {props.label}
          </label>
        </Transition>
        <Listbox.Button
          ref={refs.setReference}
          {...getReferenceProps()}
          className={mergeClasses(
            "tw-flex tw-cursor-pointer tw-items-center tw-rounded-md tw-border tw-border-solid tw-border-slate-300 tw-bg-white tw-px-3 tw-py-3.5 tw-text-left tw-transition tw-duration-100",
            !props.disabled && "hover:tw-border-gray-400",
            props.disabled && "tw-cursor-not-allowed tw-bg-slate-100",
            props.className,
            props.valid === false && "tw-border-red-600",
          )}
        >
          <div
            className={mergeClasses(
              "tw-overflow-none tw-inline-block tw-w-[calc(100%-20px)] tw-truncate tw-text-base tw-leading-5",
              showLabel && "-tw-mb-1 tw-mt-3",
            )}
          >
            {getElementForDisplay(props.value)}
          </div>
          <span className="pr-2 tw-pointer-events-none">
            <ChevronUpDownIcon
              className="tw-float-right tw-inline tw-h-5 tw-w-5 tw-text-slate-400"
              aria-hidden="true"
            />
          </span>
        </Listbox.Button>
        <FloatingPortal>
          <div className="tw-relative tw-z-[99]" ref={refs.setFloating} style={floatingStyles} {...getFloatingProps()}>
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
              <Listbox.Options
                className={mergeClasses(
                  "tw-absolute tw-z-20 tw-mt-1 tw-flex tw-max-h-60 tw-min-w-full tw-flex-col tw-gap-1 tw-overflow-auto tw-rounded-md tw-bg-white tw-py-1 tw-text-base tw-shadow-lg tw-ring-1 tw-ring-slate-900 tw-ring-opacity-5 focus:tw-outline-none sm:tw-text-sm",
                  props.dropdownHeight,
                )}
              >
                <DropdownOptions
                  loading={props.loading ? props.loading : false}
                  options={props.options}
                  noOptionsString={props.noOptionsString ? props.noOptionsString : "No options!"}
                  getElementForDisplay={getElementForDisplay}
                />
              </Listbox.Options>
            </Transition>
          </div>
        </FloatingPortal>
      </div>
    </Listbox>
  );
});

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
              `tw-relative tw-cursor-pointer tw-select-none tw-py-2.5 tw-pl-4 tw-pr-4 tw-text-base tw-text-slate-900 
              ${active && "tw-bg-slate-100"}
              ${selected && "tw-bg-slate-200"}`
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
    return <div className="tw-select-none tw-p-2 tw-pl-4">{props.noOptionsString}</div>;
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

// TODO: use ref
export const ComboInput: React.FC<ComboInputProps> = forwardRef((props, ref) => {
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
            className="tw-absolute tw-left-2 tw-top-5 -tw-mt-px tw-inline-block tw-whitespace-nowrap tw-bg-white tw-px-1 tw-text-xs tw-text-slate-600"
          >
            {props.label}
          </label>
        </Transition>
        <div
          ref={refs.setReference}
          {...getReferenceProps()}
          className={mergeClasses(
            "tw-flex tw-cursor-pointer tw-rounded-md tw-border tw-border-solid tw-border-slate-300 tw-bg-white tw-text-left tw-transition tw-duration-100 focus-within:!tw-border-gray-700",
            !props.disabled && "hover:tw-border-gray-400",
            props.disabled && "tw-cursor-not-allowed tw-bg-slate-100",
            props.className,
            props.valid === false && "tw-border-red-600",
          )}
        >
          <div className="tw-flex tw-flex-1 tw-px-3 tw-py-3.5">
            <Combobox.Input
              className={mergeClasses(
                "tw-duration-10 tw-inline tw-w-[calc(100%-20px)] tw-cursor-pointer tw-text-ellipsis tw-border-none tw-bg-transparent tw-text-base tw-leading-5 tw-text-slate-900 tw-outline-none tw-transition-all focus:tw-cursor-text",
                showLabel && "-tw-mb-1 tw-mt-3",
                props.disabled && "tw-cursor-not-allowed tw-bg-slate-100 tw-text-slate-400",
              )}
              onClick={(e) => open && e.stopPropagation()}
              displayValue={(value) => (value ? getElementForDisplay(value) : "")}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={props.placeholder}
            />
            <Combobox.Button className="tw-inline-block tw-h-full" ref={buttonRef}>
              <span className="pr-2 tw-pointer-events-none">
                <ChevronUpDownIcon
                  className="tw-float-right tw-inline tw-h-5 tw-w-5 tw-text-slate-400"
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
                "tw-absolute tw-z-20 tw-mt-1 tw-max-h-60 tw-min-w-full tw-overflow-auto tw-rounded-md tw-bg-white tw-py-1 tw-text-base tw-shadow-lg tw-ring-1 tw-ring-slate-900 tw-ring-opacity-5 focus:tw-outline-none sm:tw-text-sm",
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
});

// TODO: use ref
export const MultiSelect: React.FC<ComboInputProps> = forwardRef((props, ref) => {
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
      multiple
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
            className="tw-absolute tw-left-2 tw-top-5 -tw-mt-px tw-inline-block tw-whitespace-nowrap tw-bg-white tw-px-1 tw-text-xs tw-text-slate-600"
          >
            {props.label}
          </label>
        </Transition>
        <div
          ref={refs.setReference}
          {...getReferenceProps()}
          className={mergeClasses(
            "tw-flex tw-cursor-pointer tw-rounded-md tw-border tw-border-solid tw-border-slate-300 tw-bg-white tw-text-left tw-transition tw-duration-100 focus-within:!tw-border-gray-700",
            !props.disabled && "hover:tw-border-gray-400",
            props.disabled && "tw-cursor-not-allowed tw-bg-slate-100",
            props.className,
            props.valid === false && "tw-border-red-600",
          )}
        >
          <div className="tw-flex tw-flex-1 tw-px-3 tw-py-3.5">
            <Combobox.Input
              className={mergeClasses(
                "tw-duration-10 tw-inline tw-w-[calc(100%-20px)] tw-cursor-pointer tw-text-ellipsis tw-border-none tw-bg-transparent tw-text-base tw-leading-5 tw-text-slate-900 tw-outline-none tw-transition-all focus:tw-cursor-text",
                showLabel && "-tw-mb-1 tw-mt-3",
                props.disabled && "tw-cursor-not-allowed tw-bg-slate-100 tw-text-slate-400",
              )}
              onClick={(e) => open && e.stopPropagation()}
              displayValue={(value) => (value ? getElementForDisplay(value) : "")}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={props.placeholder}
            />
            <Combobox.Button className="tw-inline-block tw-h-full" ref={buttonRef}>
              <span className="pr-2 tw-pointer-events-none">
                <ChevronUpDownIcon
                  className="tw-float-right tw-inline tw-h-5 tw-w-5 tw-text-slate-400"
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
                "tw-absolute tw-z-20 tw-mt-1 tw-max-h-60 tw-min-w-full tw-overflow-auto tw-rounded-md tw-bg-white tw-py-1 tw-text-base tw-shadow-lg tw-ring-1 tw-ring-slate-900 tw-ring-opacity-5 focus:tw-outline-none sm:tw-text-sm",
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
});

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
              `tw-relative tw-cursor-pointer tw-select-none tw-py-2.5 tw-pl-4 tw-pr-4 tw-text-base tw-text-slate-900 
            ${active && "tw-bg-slate-100"}
            ${selected && "tw-bg-slate-200"}`
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
              `tw-relative tw-cursor-pointer tw-select-none tw-py-2.5 tw-pl-4 tw-pr-4 tw-text-base tw-text-slate-900 
            ${active && "tw-bg-slate-100"}
            ${selected && "tw-bg-slate-200"}`
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
          <div className="tw-select-none tw-p-2 tw-pl-4">{props.noOptionsString}</div>
        )}
      </>
    );
  }
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
        "tw-flex tw-w-full tw-cursor-text tw-rounded-md tw-text-base tw-outline tw-outline-1 tw-outline-slate-300 focus-within:tw-outline-slate-400 hover:tw-outline-slate-400",
        className,
      )}
      onClick={() => inputRef.current?.focus()}
    >
      <div className="tw-relative tw-inline-block">
        <div
          className={mergeClasses(
            "tw-flex tw-items-center tw-justify-center tw-px-3 tw-py-4",
            label && "-tw-mb-2 tw-mt-2",
          )}
        >
          ${stringifyPrice(value)}
        </div>
        {label && (
          <label
            htmlFor={id}
            className={mergeClasses(
              "tw-absolute tw-left-3 tw-top-1.5 tw-inline-block tw-cursor-[inherit] tw-select-none tw-text-xs tw-text-slate-600 tw-transition-all tw-duration-150",
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
            "tw-hide-number-wheel tw-absolute tw-right-0 tw-top-0 tw-flex tw-h-full tw-w-full tw-bg-transparent tw-px-3 tw-py-4 tw-text-right tw-text-transparent tw-caret-black tw-outline-0",
            label && "-tw-mb-2 tw-mt-2",
          )}
          onKeyDown={preventMinusAndPeriod}
          {...other}
        />
      </div>
    </div>
  );
});

interface TimeInputProps extends InputHTMLAttributes<HTMLInputElement> {
  date: Date; // Need explicit value prop to display label correctly
  onDateChange: (date: Date) => void;
  label?: string;
  tooltip?: string;
}

export const TimeInput = forwardRef<HTMLInputElement, TimeInputProps>((props, ref) => {
  const date = props.date;
  const [period, setPeriod] = useState<"AM" | "PM">(date.getHours() < 12 ? "AM" : "PM");

  return (
    <div className={mergeClasses("tw-flex tw-items-center tw-gap-1", props.className)}>
      <select
        className="tw-rounded-lg tw-border tw-border-solid tw-border-gray-300 tw-p-1 tw-outline-none"
        value={date.getHours() % 12}
        onChange={(e) => {
          if (period === "AM") {
            if (e.target.value === "12") {
              date.setHours(0);
            } else {
              date.setHours(parseInt(e.target.value));
            }
          } else {
            if (e.target.value === "12") {
              date.setHours(12);
            } else {
              date.setHours(parseInt(e.target.value) + 12);
            }
          }
          props.onDateChange(date);
        }}
      >
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((hour) => (
          <option key={hour} value={hour % 12}>
            {hour}
          </option>
        ))}
      </select>
      :
      <select
        className="tw-rounded-lg tw-border tw-border-solid tw-border-gray-300 tw-p-1 tw-outline-none"
        value={date.getMinutes()}
        onChange={(e) => {
          date.setMinutes(parseInt(e.target.value));
          props.onDateChange(date);
        }}
      >
        {Array.from(Array(12).keys()).map((minute) => (
          <option key={minute}>
            {(minute * 5).toLocaleString("en-US", {
              minimumIntegerDigits: 2,
              useGrouping: false,
            })}
          </option>
        ))}
      </select>
      <select
        className="tw-rounded-lg tw-border tw-border-solid tw-border-gray-300 tw-p-1 tw-outline-none"
        value={period}
        onChange={(e) => {
          if (e.target.value === "AM") {
            setPeriod("AM");
            date.setHours(date.getHours() % 12);
          } else {
            setPeriod("PM");
            date.setHours((date.getHours() % 12) + 12);
          }
          props.onDateChange(date);
        }}
      >
        <option>AM</option>
        <option>PM</option>
      </select>
    </div>
  );
});

export type RadioInputProps = {
  options: any[] | undefined;
  value: any;
  onChange: (...event: any[]) => void;
  getElementForDisplay?: (option: any) => string | React.ReactElement;
  getElementForDetail?: (option: any) => string | React.ReactElement;
  className?: string;
  valid?: boolean;
  disabled?: boolean;
  noBullet?: boolean;
  useCheckmark?: boolean;
};
export const RadioInput = forwardRef<HTMLDivElement, RadioInputProps>((props, ref) => {
  if (!props.options) {
    return <Loading />;
  }

  return (
    <RadioGroup value={props.value} onChange={props.onChange}>
      <RadioGroup.Label className="tw-sr-only">Server size</RadioGroup.Label>
      <div className="tw-space-y-2">
        {props.options.map((option) => (
          <RadioGroup.Option
            key={option}
            value={option}
            className={({ checked }) =>
              `${checked ? "tw-bg-slate-100" : "tw-bg-white"}
              tw-relative tw-flex tw-cursor-pointer tw-rounded-lg tw-border tw-border-solid tw-border-slate-200 tw-px-3 tw-py-4 tw-outline-none sm:tw-px-5`
            }
          >
            {({ checked }) => (
              <>
                <div className="tw-flex tw-w-full tw-items-center tw-justify-between">
                  <div className="tw-flex tw-items-center">
                    {props.noBullet || (
                      <span
                        className={mergeClasses(
                          checked ? "tw-border-transparent tw-bg-slate-600" : "tw-border-gray-300 tw-bg-white",
                          "tw-mr-3 tw-mt-0.5 tw-flex tw-h-4 tw-w-4 tw-shrink-0 tw-cursor-pointer tw-items-center tw-justify-center tw-rounded-full tw-border sm:tw-mr-5",
                        )}
                        aria-hidden="true"
                      >
                        <span className="tw-h-1.5 tw-w-1.5 tw-rounded-full tw-bg-white" />
                      </span>
                    )}
                    <div className="tw-text-sm">
                      <RadioGroup.Label as="p" className="tw-font-semibold tw-text-gray-900">
                        {props.getElementForDisplay ? props.getElementForDisplay(option) : option}
                      </RadioGroup.Label>
                      {props.getElementForDetail && (
                        <RadioGroup.Description as="span" className="tw-text-gray-900">
                          {props.getElementForDetail(option)}
                        </RadioGroup.Description>
                      )}
                    </div>
                  </div>
                  {checked && props.useCheckmark && (
                    <div className="tw-text-black">
                      <CheckIcon className="tw-h-5 tw-w-5" />
                    </div>
                  )}
                </div>
              </>
            )}
          </RadioGroup.Option>
        ))}
      </div>
    </RadioGroup>
  );
});

export const GuestNumberInput: React.FC<{
  value: number;
  setValue: (value: number) => void;
  maxGuests?: number;
  className?: string;
}> = ({ value, setValue, maxGuests = 99, className }) => {
  const [open, setOpen] = useState(false);

  const { refs, floatingStyles, context } = useFloating({
    open: open,
    onOpenChange: setOpen,
    middleware: [offset(10), shift()],
    whileElementsMounted: autoUpdate,
    placement: "bottom-end",
  });

  const click = useClick(context);
  const dismiss = useDismiss(context);
  const role = useRole(context);

  const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss, role]);

  return (
    <>
      <button
        ref={refs.setReference}
        {...getReferenceProps()}
        className={mergeClasses(
          "tw-flex tw-cursor-pointer tw-items-center tw-rounded-lg tw-border tw-border-solid tw-border-gray-300 tw-px-4",
          className,
        )}
      >
        <UserIcon className="tw-mr-1 tw-w-5" />
        <span className="tw-flex tw-flex-grow tw-select-none tw-justify-center">{value}</span>
      </button>
      <Transition
        show={open}
        enter="tw-transition tw-ease-out tw-duration-100"
        enterFrom="tw-transform tw-opacity-0 tw-scale-95"
        enterTo="tw-transform tw-opacity-100 tw-scale-100"
        leave="tw-transition tw-ease-in tw-duration-75"
        leaveFrom="tw-transform tw-opacity-100 tw-scale-97"
        leaveTo="tw-transform tw-opacity-0 tw-scale-95"
      >
        <FloatingFocusManager context={context}>
          <div
            ref={refs.setFloating}
            style={floatingStyles}
            {...getFloatingProps()}
            className="tw-w-56 tw-rounded-lg tw-border tw-border-solid tw-border-gray-200 tw-bg-white tw-p-5 tw-shadow-md"
          >
            <div className="tw-flex tw-justify-between">
              <span className="tw-select-none tw-whitespace-nowrap">Adults</span>
              <div className="tw-flex tw-gap-3">
                <button
                  onClick={() => {
                    setValue(Math.max(1, value - 1));
                  }}
                >
                  <MinusCircleIcon
                    className={mergeClasses(
                      "tw-w-6 tw-cursor-pointer tw-stroke-gray-500 hover:tw-stroke-black",
                      value === 1 && "tw-cursor-not-allowed !tw-stroke-gray-300",
                    )}
                  />
                </button>
                <span className="tw-flex tw-w-3 tw-select-none tw-justify-center">{value}</span>
                <button
                  onClick={() => {
                    setValue(Math.min(maxGuests, value + 1));
                  }}
                >
                  <PlusCircleIcon
                    className={mergeClasses(
                      "tw-w-6 tw-cursor-pointer tw-stroke-gray-500 hover:tw-stroke-black",
                      value === maxGuests && "tw-cursor-not-allowed !tw-stroke-gray-300",
                    )}
                  />
                </button>
              </div>
            </div>
          </div>
        </FloatingFocusManager>
      </Transition>
    </>
  );
};
