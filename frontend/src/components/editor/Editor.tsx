import classNames from 'classnames';
import React, { ChangeEvent } from 'react';
import styles from 'src/components/editor/editor.m.css';

type EditorProps = {
  onChange: (value: ChangeEvent<HTMLTextAreaElement>) => void;
  className?: string;
  placeholder?: string;
  value?: string;
};

export const Editor: React.FC<EditorProps> = props => {

  return (
    <textarea className={classNames(styles.editor, props.className)} placeholder={props.placeholder} value={props.value} onChange={props.onChange} />
  );
};

export const Display: React.FC<{ value: string; }> = ({ value }) => {

  return (
    <textarea className={styles.display} value={value} readOnly={true} />
  );
};