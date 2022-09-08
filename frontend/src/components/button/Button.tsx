import classNames from 'classnames';
import { useNavigate } from 'react-router-dom';
import styles from './button.m.css';

type ButtonProps = {
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
  secondary?: boolean;
  tooltip?: string;
};

export const Button: React.FC<ButtonProps> = props => {
  return (
    <>
      <button
        className={classNames(styles.button, props.secondary ? styles.secondary : null, props.className, "tw-group")}
        type='button'
        onClick={props.onClick}>
        {props.children}
        {props.tooltip &&
          <div className="tw-relative tw-bottom-[64px] tw-invisible group-hover:tw-visible">
            <div className="tw-absolute tw-left-1/2">
              <span style={{
                boxShadow: "3px 3px 7px #00000012",
                transform: "translateY(-6.53553391px) rotate(45deg)",
                background: "#323232",
                width: "5px",
                height: "5px",
                display: "block",
                position: "absolute",
                top: "36px"
              }} />
            </div>
            <div className="tw-bg-[#323232] tw-text-xs tw-py-2 tw-text-white tw-rounded-md tw-text-center" role="tooltip" >{props.tooltip}</div>
          </div>
        }
      </button>
    </>
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
    <div className={classNames(props.className, styles.backButton)} onClick={onClick}>{String.fromCharCode(8592)} Back</div>
  );
};