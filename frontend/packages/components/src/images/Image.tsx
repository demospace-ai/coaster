"use client";

import { mergeClasses } from "@coaster/utils";
import { ImgHTMLAttributes, useState } from "react";
import { Loading } from "../loading/Loading";

interface ImageProps extends ImgHTMLAttributes<HTMLImageElement> {}

export const Image: React.FC<ImageProps> = (props) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <>
      <Loading
        className={mergeClasses(
          props.className,
          loaded ? "tw-hidden" : "tw-block"
        )}
      />
      <img
        className={mergeClasses(
          loaded ? "tw-block" : "tw-hidden",
          props.className
        )}
        {...props}
        onLoad={() => setLoaded(true)}
      />
    </>
  );
};
