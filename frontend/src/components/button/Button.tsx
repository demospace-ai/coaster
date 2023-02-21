import { Menu, Transition } from '@headlessui/react';
import { EllipsisHorizontalIcon } from '@heroicons/react/24/outline';
import classNames from 'classnames';
import React, { forwardRef, Fragment, MouseEvent, useState } from 'react';
import { NavLink, NavLinkProps, useNavigate } from 'react-router-dom';
import { Tooltip } from 'src/components/tooltip/Tooltip';

type ButtonProps = {
  onClick: () => void;
  className?: string;
  secondary?: boolean;
  children: React.ReactNode;
};

export const Button: React.FC<ButtonProps> = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
  const { onClick, className, children, secondary, ...remaining } = props;

  const buttonStyle = classNames(
    props.className,
    'tw-text-white tw-bg-slate-600 hover:tw-bg-slate-800',
    'tw-py-1 tw-px-4 tw-cursor-pointer tw-font-bold tw-shadow-none tw-rounded-md tw-tracking-[1px] tw-transition tw-select-none',
    props.secondary && 'tw-bg-white tw-text-slate-800 tw-font-normal',
  );
  return (
    <button
      className={buttonStyle}
      type='button'
      ref={ref}
      onClick={props.onClick}
      {...remaining}
    >
      {props.children}
    </button>
  );
});

type LinkButtonProps = {
  href: string;
  className?: string;
  children: React.ReactNode;
};

export const LinkButton: React.FC<LinkButtonProps> = forwardRef<HTMLAnchorElement, LinkButtonProps>((props, ref) => {
  const { href, className, children, ...remaining } = props;

  const buttonStyle = classNames(
    props.className,
    'tw-text-white tw-bg-slate-600 hover:tw-bg-slate-800',
    'tw-py-1 tw-px-4 tw-cursor-pointer tw-font-bold tw-shadow-none tw-rounded-md tw-tracking-[1px] tw-transition tw-select-none',
  );
  return (
    <a
      className={buttonStyle}
      ref={ref}
      href={props.href}
      {...remaining}
    >
      {props.children}
    </a>
  );
});

type FormButtonProps = {
  className?: string;
  children: React.ReactNode;
};

export const FormButton: React.FC<FormButtonProps> = props => {
  const buttonStyle = classNames(
    'tw-text-white tw-bg-slate-600 hover:tw-bg-slate-800',
    'tw-py-1 tw-px-4 tw-cursor-pointer tw-font-bold tw-shadow-none tw-rounded-md tw-tracking-[1px] tw-transition tw-select-none',
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
    <div className={classNames('tw-cursor-pointer tw-select-none tw-text-sm tw-font-[500] hover:tw-text-slate-600 tw-w-fit', props.className)} onClick={onClick}>{String.fromCharCode(8592)} Back</div>
  );
};

export const NavButton: React.FC<NavLinkProps> = props => {
  return (
    <NavLink
      className={classNames('tw-bg-slate-600 tw-text-white tw-rounded-md tw-block tw-px-4 tw-py-2 tw-text-sm tw-cursor-pointer tw-font-bold tw-text-center tw-transition-colors hover:tw-bg-slate-800 tw-border tw-border-solid tw-border-slate-800', props.className as string)}
      to={props.to}>
      {props.children}
    </NavLink>
  );
};

export const DivButton: React.FC<ButtonProps> = props => {
  return (
    <div className={props.className} tabIndex={0} onClick={props.onClick} onKeyDown={(event: React.KeyboardEvent<HTMLDivElement>) => { if (event.key === "Enter") props.onClick(); }}>{props.children}</div>
  );
};

export const MoreOptionsButton: React.FC<{ id: string; className?: string; showConfigureModal: () => void; showDeleteModal: () => void; }> = props => {
  const [tooltipDisabled, setTooltipDisabled] = useState<boolean>(false);
  const menuItem = 'tw-flex tw-items-center tw-px-4 tw-py-2 tw-text-sm tw-cursor-pointer tw-select-none tw-rounded';
  return (
    <Menu as="div" className="tw-relative tw-flex tw-justify-center tw-mx-1 tw-w-8 tw-h-8">
      <Tooltip label="More options" disabled={tooltipDisabled}>
        <Menu.Button onClick={(e: MouseEvent) => e.stopPropagation()} className='tw-z-0 tw-w-8 tw-h-8 tw-rounded-md tw-bg-white tw-text-slate-800 hover:tw-bg-slate-200'>
          <EllipsisHorizontalIcon className='tw-h-6 tw-inline' strokeWidth="2" />
        </Menu.Button>
      </Tooltip>
      <Transition
        as={Fragment}
        enter="tw-transition tw-ease-out tw-duration-100"
        enterFrom="tw-transform tw-opacity-0 tw-scale-95"
        enterTo="tw-transform tw-opacity-100 tw-scale-100"
        leave="tw-transition tw-ease-in tw-duration-75"
        leaveFrom="tw-transform tw-opacity-100 tw-scale-100"
        leaveTo="tw-transform tw-opacity-0 tw-scale-95"
        beforeEnter={() => setTooltipDisabled(true)}
        beforeLeave={() => setTooltipDisabled(false)}
      >
        <Menu.Items className="tw-z-10 tw-absolute tw-origin-top-right tw-right-0 tw-top-10 tw-w-fit tw-rounded-md tw-shadow-lg tw-bg-white tw-ring-1 tw-ring-slate-900 tw-ring-opacity-5 focus:tw-outline-none" onClick={(e: MouseEvent) => e.stopPropagation()}>
          <div className="tw-m-1">
            <Menu.Item>
              {({ active }) => (
                <div onClick={(e: MouseEvent) => { e.stopPropagation(); props.showConfigureModal(); }} className={classNames(
                  active ? 'tw-bg-slate-200 tw-text-slate-900' : 'tw-text-slate-700',
                  menuItem
                )}>
                  Configure
                </div>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <div onClick={(e: MouseEvent) => { e.stopPropagation(); props.showDeleteModal(); }} className={classNames(
                  active ? 'tw-bg-slate-200 tw-text-slate-900' : 'tw-text-slate-700',
                  menuItem
                )}>
                  Delete
                </div>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};
