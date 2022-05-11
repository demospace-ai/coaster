import classNames from 'classnames';
import styles from './button.m.css';

type ButtonProps = {
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}

export const Button: React.FC<ButtonProps> = props => {
  return (
    <button
      className={classNames(styles.button, props.className)}
      type='button'
      onClick={props.onClick}>{props.children}
    </button>
  )
}