import { Combobox, Listbox, Transition } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";
import classNames from "classnames";
import { Fragment, useRef, useState } from "react";
import { Loading } from "src/components/loading/Loading";

type ValidatedInputProps = {
  id: string;
  placeholder?: string;
  value: string | null;
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

  const validateNotEmpty = (value: string | null): boolean => {
    const valid = value != null && value.length > 0;
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
          value={props.value ? props.value : ""}
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
          value={props.value ? props.value : ""}
        />
      }
    </>
  );
};

type ValidatedDropdownInputProps = {
  by?: string;
  options: any[] | undefined;
  selected: any | null;
  setSelected: (option: any) => void;
  getElementForDisplay?: (option: any) => string | React.ReactElement;
  getElementForDropdown?: (option: any) => string | React.ReactElement;
  loading: boolean;
  placeholder: string;
  noOptionsString: string;
  className?: string;
  validated?: boolean;
  noCaret?: boolean;
};

export const ValidatedDropdownInput: React.FC<ValidatedDropdownInputProps> = props => {
  const [isValid, setIsValid] = useState(true);

  const validateNotNull = (value: number | null): boolean => {
    const valid = value != null;
    setIsValid(valid);
    return valid;
  };

  const getElementForDisplay = props.getElementForDisplay ? props.getElementForDisplay : (value: any) => value;
  const getElementForDropdown = props.getElementForDropdown ? props.getElementForDropdown : getElementForDisplay;

  return (
    <Listbox by={props.by} value={props.selected} onChange={value => { props.setSelected(value); setIsValid(true); }}>
      <Listbox.Button
        className={classNames("tw-flex tw-justify-center tw-w-full tw-rounded-md tw-py-2 tw-pl-3 tw-pr-3 tw-text-left tw-border tw-border-solid tw-border-gray-300 focus:tw-outline-none", props.className, props.validated && !isValid && 'tw-border-red-600 tw-outline-none')}
      >
        <div className={classNames("tw-inline-block tw-w-[calc(100%-20px)] tw-truncate tw-overflow-none", !props.selected && "tw-text-gray-400")}>
          {props.selected ? getElementForDisplay(props.selected) : props.placeholder}
        </div>
        {!props.noCaret &&
          <span className="tw-pointer-events-none pr-2">
            <ChevronUpDownIcon
              className="tw-inline tw-float-right tw-h-5 tw-w-5 tw-text-gray-400"
              aria-hidden="true"
            />
          </span>}
      </Listbox.Button>
      <Transition
        as={Fragment}
        enter="tw-transition tw-ease-out tw-duration-100"
        enterFrom="tw-transform tw-opacity-0 tw-scale-95"
        enterTo="tw-transform tw-opacity-100 tw-scale-100"
        leave="tw-transition tw-ease-in tw-duration-75"
        leaveFrom="tw-transform tw-opacity-100 tw-scale-100"
        leaveTo="tw-transform tw-opacity-0 tw-scale-95"
        afterLeave={() => validateNotNull(props.selected)}
      >
        <div className="tw-relative tw-z-10">
          <Listbox.Options className="tw-absolute tw-z-20 tw-mt-1 tw-max-h-60 tw-min-w-full tw-overflow-auto tw-rounded-md tw-bg-white tw-py-1 tw-text-base tw-shadow-lg tw-ring-1 tw-ring-black tw-ring-opacity-5 focus:tw-outline-none sm:tw-text-sm">
            <DropdownOptions loading={props.loading} options={props.options} noOptionsString={props.noOptionsString} getElementForDisplay={getElementForDropdown} />
          </Listbox.Options>
        </div>
      </Transition>
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
            `tw-relative tw-cursor-pointer tw-select-none tw-py-2 tw-pl-4 tw-pr-4 ${(active || selected) ? 'tw-bg-green-100 tw-text-green-900' : 'tw-text-gray-900'
            }`
          }>
            {({ selected }) => (
              <>
                <span className={`tw-block tw-truncate ${selected ? 'tw-font-medium' : 'tw-font-normal'}`}>
                  {props.getElementForDisplay(option)}
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
  by?: string;
  options: any[] | undefined;
  selected: any | null;
  setSelected: (option: any) => void;
  getElementForDisplay?: (option: any) => string | React.ReactElement;
  loading: boolean;
  placeholder: string;
  noOptionsString: string;
  className?: string;
  validated?: boolean;
  allowCustom?: boolean;
};

export const ValidatedComboInput: React.FC<ValidatedComboInputProps> = props => {
  const [isValid, setIsValid] = useState(true);
  const [query, setQuery] = useState('');
  const buttonRef = useRef<HTMLButtonElement>(null);

  const getFilteredOptions = () => {
    if (query === '') {
      return props.options;
    }

    if (props.options) {
      return props.options.filter((option) => {
        const displayName = props.getElementForDisplay ? props.getElementForDisplay(option) : option;
        return displayName.toLowerCase().includes(query.toLowerCase());
      });
    }

    return [];
  };
  const filteredOptions = getFilteredOptions();

  const getElementForDisplay = props.getElementForDisplay ? props.getElementForDisplay : (value: any) => value;

  const validateNotNull = (value: number | null): boolean => {
    const valid = value != null;
    setIsValid(valid);
    return valid;
  };

  return (
    <Combobox as="div" className="tw-flex tw-w-full" by={props.by} value={props.selected} onChange={(value: number) => { props.setSelected(value); setIsValid(true); }}>
      <div className="tw-relative tw-w-full">
        <div className={classNames("tw-flex tw-h-10 tw-w-full tw-rounded-md tw-bg-white tw-pl-2 tw-pr-2 tw-text-left tw-border tw-border-solid tw-border-gray-300", props.className, props.validated && !isValid && 'tw-border-red-600 tw-outline-none')}>
          <Combobox.Input
            className={"tw-inline tw-bg-transparent tw-w-[calc(100%-20px)] tw-border-none tw-pr-10 tw-text-sm tw-leading-5 tw-text-gray-900 tw-outline-none tw-text-ellipsis"}
            displayValue={selected => selected ? getElementForDisplay(selected) : ""}
            onChange={event => setQuery(event.target.value)}
            placeholder={props.placeholder}
            onClick={() => buttonRef.current?.click()}
          >
          </Combobox.Input>
          <Combobox.Button className="tw-inline-block tw-h-full" ref={buttonRef}>
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
          afterLeave={() => { validateNotNull(props.selected); setQuery(''); }}
        >
          <div className="tw-relative tw-z-10">
            <Combobox.Options className="tw-absolute tw-z-20 tw-mt-1 tw-min-w-full tw-max-h-60 tw-overflow-auto tw-rounded-md tw-bg-white tw-py-1 tw-text-base tw-shadow-lg tw-ring-1 tw-ring-black tw-ring-opacity-5 focus:tw-outline-none sm:tw-text-sm">
              <ComboOptions loading={props.loading} options={filteredOptions} noOptionsString={props.noOptionsString} getElementForDisplay={getElementForDisplay} query={query} allowCustom={props.allowCustom} />
            </Combobox.Options>
          </div>
        </Transition>
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
          <Combobox.Option value={{ id: null, name: props.query }} className={({ active, selected }) =>
            `tw-relative tw-cursor-pointer tw-select-none tw-py-2 tw-pl-4 tw-pr-4 ${(active || selected) ? 'tw-bg-green-100 tw-text-green-900' : 'tw-text-gray-900'
            }`
          }>
            Custom: "{props.query}"
          </Combobox.Option>
        )}
        {props.options!.map((option: any, index: number) => (
          <Combobox.Option key={index} value={option} className={({ active, selected }) =>
            `tw-relative tw-cursor-pointer tw-select-none tw-py-2 tw-pl-4 tw-pr-4 ${(active || selected) ? 'tw-bg-green-100 tw-text-green-900' : 'tw-text-gray-900'
            }`
          }>
            {({ selected }) => (
              <>
                <span className={`tw-block tw-truncate ${selected ? 'tw-font-medium' : 'tw-font-normal'}`}>
                  {props.getElementForDisplay(option)}
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
      <>
        {props.allowCustom ?
          props.allowCustom && props.query.length > 0 && (
            <Combobox.Option value={{ id: null, name: props.query }} className={({ active, selected }) =>
              `tw-relative tw-cursor-pointer tw-select-none tw-py-2 tw-pl-4 tw-pr-4 ${(active || selected) ? 'tw-bg-green-100 tw-text-green-900' : 'tw-text-gray-900'
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