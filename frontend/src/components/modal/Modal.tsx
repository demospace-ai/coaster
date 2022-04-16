import classNames from 'classnames';
import { useEffect } from 'react';
import styles from './modal.m.css';

interface ModalProps {
  show: boolean;
  close: () => void;
}

export const Modal: React.FC<ModalProps> = props => {
  useEffect(() => {
    const escFunction = (event: KeyboardEvent) => {
      if(event.key === "Escape") {
        props.close();
        document.removeEventListener("keydown", escFunction);
      }
    };

    document.addEventListener("keydown", escFunction);
  })

  const showHideClassName = props.show ? styles.displayBlock : styles.displayNone;

  return (
    <div className={classNames(styles.modal, showHideClassName)} onClick={props.close}>
      <section className={styles.modalMain} onClick={e => e.stopPropagation()}>
        {props.children}
        <div className={styles.center}>
          <button className={styles.closeButton} onClick={props.close}>close</button>
        </div>
      </section>
    </div>
  );
};