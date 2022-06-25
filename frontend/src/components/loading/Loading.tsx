import classNames from "classnames";
import styles from "./loading.m.css";

type LoadingProps = {
  className?: string;
};

export const Loading: React.FC<LoadingProps> = props => {
  return (
    <div className={classNames(styles.loading, props.className)} />
  );
};