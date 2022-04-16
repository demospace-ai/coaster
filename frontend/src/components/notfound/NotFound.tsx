import React from "react";
import styles from "./notfound.m.css";
import image from "./travolta.gif";

export const NotFound: React.FC = () => {
  return (
    <>
      <div className={styles.title}>
        <h3>Not Found!</h3>
      </div>
      <div className={styles.body}>
        <img className={styles.image} src={image} alt="loading..." />
      </div>
    </>
  );
}