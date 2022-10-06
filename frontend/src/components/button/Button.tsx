import { Menu, Transition } from '@headlessui/react';
import { EllipsisHorizontalIcon } from '@heroicons/react/24/outline';
import classNames from 'classnames';
import { Fragment, MouseEvent } from 'react';
import { NavLink, NavLinkProps, useNavigate } from 'react-router-dom';

type ButtonProps = {
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
  secondary?: boolean;
};

export const Button: React.FC<ButtonProps> = props => {
  const buttonStyle = classNames(
    props.className,
    'tw-text-white tw-bg-fabra hover:tw-bg-primary-highlight',
    'tw-py-1 tw-px-4 tw-cursor-pointer tw-font-bold tw-shadow-none tw-rounded-md tw-tracking-[1px] tw-transition tw-select-none',
    'tw-border tw-border-green-border tw-border-solid',
    props.secondary && 'tw-bg-white tw-text-primary-text tw-font-normal',
  );
  return (
    <button
      className={buttonStyle}
      type='button'
      onClick={props.onClick}
    >
      {props.children}
    </button >
  );
};

type FormButtonProps = {
  className?: string;
  children: React.ReactNode;
};

export const FormButton: React.FC<FormButtonProps> = props => {
  const buttonStyle = classNames(
    'tw-text-white tw-bg-fabra hover:tw-bg-primary-highlight',
    'tw-py-1 tw-px-4 tw-cursor-pointer tw-font-bold tw-shadow-none tw-rounded-md tw-tracking-[1px] tw-transition tw-select-none',
    'tw-border tw-border-green-border tw-border-solid',
    props.className
  );
  return (
    <button
      className={buttonStyle}
      type='submit'
    >
      {props.children}
    </button>
  );
};

export const BackButton: React.FC<Partial<ButtonProps>> = props => {
  const navigate = useNavigate();

  const onClick = () => {
    if (props.onClick) {
      props.onClick();
    } else {
      navigate(-1);
    }
  };

  return (
    <div className={classNames('tw-cursor-pointer tw-select-none tw-text-sm tw-font-[500] hover:tw-text-primary-highlight', props.className)} onClick={onClick}>{String.fromCharCode(8592)} Back</div>
  );
};

export const NavButton: React.FC<NavLinkProps> = props => {
  return (
    <NavLink
      className={classNames(props.className, 'tw-bg-fabra tw-text-white tw-rounded-md tw-block tw-px-4 tw-py-2 tw-text-sm tw-cursor-pointer tw-font-bold tw-text-center tw-transition-colors hover:tw-bg-primary-highlight tw-border tw-border-solid tw-border-[#508368]')}
      to={props.to}>
      {props.children}
    </NavLink>
  );
};

export const MoreOptionsButton: React.FC<{ className?: string; showModal: () => void; }> = props => {
  return (
    <Menu as="div" className={classNames("tw-relative tw-inline", props.className)}>
      <Menu.Button onClick={(e: MouseEvent) => e.stopPropagation()} className='tw-z-0 tw-w-8 tw-h-8 tw-rounded-md tw-bg-white tw-border tw-border-gray-400 tw-text-primary-text hover:tw-bg-gray-200'>
        <EllipsisHorizontalIcon className='tw-inline tw-h-5 tw-stroke-2' />
      </Menu.Button>
      <Transition
        as={Fragment}
        enter="tw-transition tw-ease-out tw-duration-100"
        enterFrom="tw-transform tw-opacity-0 tw-scale-95"
        enterTo="tw-transform tw-opacity-100 tw-scale-100"
        leave="tw-transition tw-ease-in tw-duration-75"
        leaveFrom="tw-transform tw-opacity-100 tw-scale-100"
        leaveTo="tw-transform tw-opacity-0 tw-scale-95"
      >
        <Menu.Items className="tw-z-10 tw-absolute tw-origin-top-right tw-right-0 tw-top-10 tw-w-fit tw-rounded-md tw-shadow-lg tw-bg-white tw-ring-1 tw-ring-black tw-ring-opacity-5 focus:tw-outline-none" onClick={(e: MouseEvent) => e.stopPropagation()}>
          <div className="tw-py-1">
            <Menu.Item>
              {({ active }) => (
                <div onClick={(e: MouseEvent) => { e.stopPropagation(); props.showModal(); }} className={classNames(
                  active ? 'tw-bg-gray-100 tw-text-gray-900' : 'tw-text-gray-700',
                  'tw-flex tw-px-4 tw-py-2 tw-text-sm tw-cursor-pointer tw-select-none tw-w-full tw-whitespace-nowrap'
                )}>
                  Configure
                </div>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};