import classNames from "classnames";
import { CSSProperties } from "react";
import styles from "./loading.m.css";

type LoadingProps = {
  className?: string;
  style?: CSSProperties;
};

export const Loading: React.FC<LoadingProps> = props => {
  return (
    <div className={classNames(styles.loading, props.className)} style={props.style} />
  );
};