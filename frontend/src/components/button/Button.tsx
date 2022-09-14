import classNames from 'classnames';
import { NavLink, NavLinkProps, useNavigate } from 'react-router-dom';
import styles from './button.m.css';

type ButtonProps = {
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
  secondary?: boolean;
};

export const Button: React.FC<ButtonProps> = props => {
  return (
    <button
      className={classNames(styles.button, props.secondary ? styles.secondary : null, props.className)}
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
  return (
    <button
      className={classNames(styles.button, props.className)}
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