import classNames from 'classnames';
import { useEffect } from 'react';
import styles from './modal.m.css';

interface ModalProps {
  show: boolean;
  close?: () => void;
  children?: React.ReactNode;
  title?: string;
  titleStyle?: string;
  clickToEscape?: boolean;
}

export const Modal: React.FC<ModalProps> = props => {
  useEffect(() => {
    const escFunction = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (props.close) {
          props.close();
        }
        document.removeEventListener('keydown', escFunction);
      }
    };

    document.addEventListener('keydown', escFunction);
  });

  const showHideClassName = props.show ? styles.displayBlock : styles.displayNone;

  return (
    <div className={classNames(styles.modal, showHideClassName)} onClick={props.clickToEscape ? props.close : undefined}>
      <section className={styles.modalMain} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex" }}>
          <div className={classNames(styles.title, props.titleStyle)}>
            {props.title}
          </div>
          <button className={styles.closeButton} onClick={props.close}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M5.1875 15.6875L4.3125 14.8125L9.125 10L4.3125 5.1875L5.1875 4.3125L10 9.125L14.8125 4.3125L15.6875 5.1875L10.875 10L15.6875 14.8125L14.8125 15.6875L10 10.875L5.1875 15.6875Z" fill="black" />
            </svg>
          </button>
        </div>
        {props.children}
      </section>
    </div>
  );
};