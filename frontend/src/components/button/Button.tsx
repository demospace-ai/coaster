import classNames from 'classnames';
import { useNavigate } from 'react-router-dom';
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
      onClick={props.onClick}>
      {props.children}
    </button>
  );
};

type FormButtonProps = {
  value: string;
  className?: string;
};

export const FormButton: React.FC<FormButtonProps> = props => {
  return (
    <input
      className={classNames(styles.button, props.className)}
      type='submit'
      value={props.value}>
    </input>
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
    <div className={classNames(props.className, styles.backButton)} onClick={onClick}>{String.fromCharCode(8592)} Back</div>
  );
};