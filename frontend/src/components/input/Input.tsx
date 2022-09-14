import { Combobox, Listbox, Transition } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";
import classNames from "classnames";
import { Fragment, useRef, useState } from "react";
import { Loading } from "src/components/loading/Loading";

type ValidatedInputProps = {
  id: string;
  placeholder?: string;
  value: string;
  setValue: (value: string) => void;
  className?: string;
  textarea?: boolean;
};

export const ValidatedInput: React.FC<ValidatedInputProps> = props => {
  const [isValid, setIsValid] = useState(true);
  let classes = ['tw-border tw-border-solid tw-border-gray-300 tw-rounded-md tw-py-2 tw-px-3 tw-w-full tw-box-border tw-my-1 tw-mx-0', props.className];
  if (!isValid) {
    classes.push('tw-border-red-600 tw-outline-none');
  }

  const onKeydown = (event: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    event.stopPropagation();
    if (event.key === 'Escape') {
      event.currentTarget.blur();
    }
  };

  const validateNotEmpty = (value: string): boolean => {
    const valid = value.length > 0;
    setIsValid(valid);
    return valid;
  };

  return (
    <>
      {props.textarea ?
        <textarea
          id={props.id}
          name={props.id}
          autoComplete={props.id}
          placeholder={props.placeholder}
          className={classNames(classes)}
          onKeyDown={onKeydown}
          onFocus={() => setIsValid(true)}
          onChange={e => props.setValue(e.target.value)}
          onBlur={() => validateNotEmpty(props.value)}
          value={props.value}
        />
        :
        <input
          type='text'
          id={props.id}
          name={props.id}
          autoComplete={props.id}
          placeholder={props.placeholder}
          className={classNames(classes)}
          onKeyDown={onKeydown}
          onFocus={() => setIsValid(true)}
          onChange={e => props.setValue(e.target.value)}
          onBlur={() => validateNotEmpty(props.value)}
          value={props.value}
        />
      }
    </>
  );
};

type ValidatedDropdownInputProps = {
  options: any[] | undefined;
  selected: any | null;
  setSelected: (option: any) => void;
  getDisplayName: (option: any) => string;
  loading: boolean;
  placeholder: string;
  noOptionsString: string;
  className?: string;
  validated?: boolean;
};

export const ValidatedDropdownInput: React.FC<ValidatedDropdownInputProps> = props => {
  const [isValid, setIsValid] = useState(true);

  const validateNotNull = (value: number | null): boolean => {
    const valid = value != null;
    setIsValid(valid);
    return valid;
  };

  return (
    <Listbox value={props.selected} onChange={(value: number) => { props.setSelected(value); setIsValid(true); }}>
      {({ open }) =>
        <>
          <Listbox.Button
            className={classNames("tw-w-full tw-rounded-md tw-bg-white tw-py-2 tw-pl-3 tw-pr-3 tw-text-left tw-border tw-border-solid tw-border-gray-300 focus:tw-outline-none", props.className, !open && props.validated && !isValid && 'tw-border-red-600 tw-outline-none')}
            onBlur={() => validateNotNull(props.selected)}>
            <span className={classNames("tw-inline tw-truncate", !props.selected && "tw-text-gray-400")}>{props.selected ? props.getDisplayName(props.selected) : props.placeholder}</span>
            <span className="tw-pointer-events-none pr-2">
              <ChevronUpDownIcon
                className="tw-inline tw-float-right tw-h-5 tw-w-5 tw-text-gray-400"
                aria-hidden="true"
              />
            </span>
          </Listbox.Button>
          <Transition
            as={Fragment}
            enter="tw-transition tw-ease-out tw-duration-100"
            enterFrom="tw-transform tw-opacity-0 tw-scale-95"
            enterTo="tw-transform tw-opacity-100 tw-scale-100"
            leave="tw-transition tw-ease-in tw-duration-75"
            leaveFrom="tw-transform tw-opacity-100 tw-scale-100"
            leaveTo="tw-transform tw-opacity-0 tw-scale-95"
          >
            <div>
              <Listbox.Options className="tw-absolute tw-z-10 tw-mt-1 tw-max-h-60 tw-w-full tw-overflow-auto tw-rounded-md tw-bg-white tw-py-1 tw-text-base tw-shadow-lg tw-ring-1 tw-ring-black tw-ring-opacity-5 focus:tw-outline-none sm:tw-text-sm">
                <DropdownOptions loading={props.loading} options={props.options} noOptionsString={props.noOptionsString} getDisplayName={props.getDisplayName} />
              </Listbox.Options>
            </div>
          </Transition>
        </>
      }
    </Listbox>
  );
};

type DropdownOptionsProps = {
  loading: boolean,
  options: any[] | undefined,
  noOptionsString: string,
  getDisplayName: (value: any) => string,
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
            `tw-relative tw-cursor-pointer tw-select-none tw-py-2 tw-pl-4 tw-pr-4 ${(active || selected) ? 'tw-bg-green-100 tw-text-green-900' : 'tw-text-gray-900'
            }`
          }>
            {({ selected }) => (
              <>
                <span
                  className={`tw-block tw-truncate ${selected ? 'tw-font-medium' : 'tw-font-normal'
                    }`}
                >
                  {props.getDisplayName(option)}
                </span>
                {selected ? (
                  <span className="tw-absolute tw-inset-y-0 tw-right-0 tw-flex tw-items-center tw-pr-3 tw-text-green-600">
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
  options: any[] | undefined;
  selected: any | null;
  setSelected: (option: any) => void;
  getDisplayName: (option: any) => string;
  loading: boolean;
  placeholder: string;
  noOptionsString: string;
  className?: string;
  validated?: boolean;
};

export const ValidatedComboInput: React.FC<ValidatedComboInputProps> = props => {
  const [isValid, setIsValid] = useState(true);
  const [query, setQuery] = useState('');
  const buttonRef = useRef<HTMLButtonElement>(null);

  const filteredOptions =
    query === ''
      ? props.options
      : props.options
        ? props.options.filter((option) => {
          return props.getDisplayName(option).toLowerCase().includes(query.toLowerCase());
        })
        : [];

  const validateNotNull = (value: number | null): boolean => {
    const valid = value != null;
    setIsValid(valid);
    return valid;
  };

  return (
    <Combobox value={props.selected} onChange={(value: number) => { props.setSelected(value); setIsValid(true); }}>
      {({ open }) =>
        <>
          <div className={classNames("tw-flex tw-h-10 tw-w-full tw-rounded-md tw-bg-white tw-pl-3 tw-pr-3 tw-text-left tw-border tw-border-solid tw-border-gray-300", props.className, !open && props.validated && !isValid && 'tw-border-red-600 tw-outline-none')}>
            <Combobox.Input
              className={"tw-inline tw-w-[calc(100%-20px)] tw-border-none tw-pr-10 tw-text-sm tw-leading-5 tw-text-gray-900 tw-outline-none"}
              displayValue={(selected) => selected ? props.getDisplayName(selected) : ""}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={props.placeholder}
              onBlur={() => validateNotNull(props.selected)}
              onClick={() => { buttonRef.current?.click(); }}
            >
            </Combobox.Input>
            <Combobox.Button className="tw-inline-block tw-h-full" onBlur={() => validateNotNull(props.selected)} ref={buttonRef}>
              <span className="tw-pointer-events-none pr-2">
                <ChevronUpDownIcon
                  className="tw-inline tw-float-right tw-h-5 tw-w-5 tw-text-gray-400"
                  aria-hidden="true"
                />
              </span>
            </Combobox.Button>
          </div>
          <Transition
            as={Fragment}
            enter="tw-transition tw-ease-out tw-duration-100"
            enterFrom="tw-transform tw-opacity-0 tw-scale-95"
            enterTo="tw-transform tw-opacity-100 tw-scale-100"
            leave="tw-transition tw-ease-in tw-duration-75"
            leaveFrom="tw-transform tw-opacity-100 tw-scale-100"
            leaveTo="tw-transform tw-opacity-0 tw-scale-95"
          >
            <div>
              <Combobox.Options className="tw-absolute tw-z-10 tw-mt-1 tw-max-h-60 tw-w-full tw-overflow-auto tw-rounded-md tw-bg-white tw-py-1 tw-text-base tw-shadow-lg tw-ring-1 tw-ring-black tw-ring-opacity-5 focus:tw-outline-none sm:tw-text-sm">
                <ComboOptions loading={props.loading} options={filteredOptions} noOptionsString={props.noOptionsString} getDisplayName={props.getDisplayName} />
              </Combobox.Options>
            </div>
          </Transition>
        </>
      }
    </Combobox>
  );
};

type ComboOptionsProps = {
  loading: boolean,
  options: any[] | undefined,
  noOptionsString: string,
  getDisplayName: (value: any) => string,
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
        {props.options!.map((option: any, index: number) => (
          <Combobox.Option key={index} value={option} className={({ active, selected }) =>
            `tw-relative tw-cursor-pointer tw-select-none tw-py-2 tw-pl-4 tw-pr-4 ${(active || selected) ? 'tw-bg-green-100 tw-text-green-900' : 'tw-text-gray-900'
            }`
          }>
            {({ selected }) => (
              <>
                <span
                  className={`tw-block tw-truncate ${selected ? 'tw-font-medium' : 'tw-font-normal'
                    }`}
                >
                  {props.getDisplayName(option)}
                </span>
                {selected ? (
                  <span className="tw-absolute tw-inset-y-0 tw-right-0 tw-flex tw-items-center tw-pr-3 tw-text-green-600">
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
      <div className="tw-p-2 tw-pl-4 tw-select-none">{props.noOptionsString}</div>
    );
  }
};;;