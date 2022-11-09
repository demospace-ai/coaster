import classNames from 'classnames';
import React from 'react';
import { NavLink, NavLinkProps, useNavigate } from 'react-router-dom';

type ButtonProps = {
  onClick: () => void;
  className?: string;
  secondary?: boolean;
  children: React.ReactNode;
};

export const Button: React.FC<ButtonProps> = props => {
  const { onClick, className, children, secondary, ...remaining } = props;

  const buttonStyle = classNames(
    props.className,
    'tw-text-white tw-bg-fabra-green-500 hover:tw-bg-fabra-green-600',
    'tw-py-1 tw-px-4 tw-cursor-pointer tw-font-bold tw-shadow-none tw-rounded-md tw-tracking-[1px] tw-transition tw-select-none',
    'tw-border tw-border-fabra-green-400 tw-border-solid',
    props.secondary && 'tw-bg-white tw-text-gray-800 tw-font-normal',
  );
  return (
    <button
      className={buttonStyle}
      type='button'
      onClick={props.onClick}
      {...remaining}
    >
      {props.children}
    </button>
  );
};

type FormButtonProps = {
  className?: string;
  children: React.ReactNode;
};

export const FormButton: React.FC<FormButtonProps> = props => {
  const buttonStyle = classNames(
    'tw-text-white tw-bg-fabra-green-500 hover:tw-bg-fabra-green-600',
    'tw-py-1 tw-px-4 tw-cursor-pointer tw-font-bold tw-shadow-none tw-rounded-md tw-tracking-[1px] tw-transition tw-select-none',
    'tw-border tw-border-fabra-green-400 tw-border-solid',
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
    <div className={classNames('tw-cursor-pointer tw-select-none tw-text-sm tw-font-[500] hover:tw-text-fabra-green-600 tw-w-fit', props.className)} onClick={onClick}>{String.fromCharCode(8592)} Back</div>
  );
};

export const NavButton: React.FC<NavLinkProps> = props => {
  return (
    <NavLink
      className={classNames(props.className, 'tw-bg-fabra-green-500 tw-text-white tw-rounded-md tw-block tw-px-4 tw-py-2 tw-text-sm tw-cursor-pointer tw-font-bold tw-text-center tw-transition-colors hover:tw-bg-fabra-green-600 tw-border tw-border-solid tw-border-[#508368]')}
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