import { ImgHTMLAttributes, useState } from "react";
import { Loading } from "src/components/loading/Loading";

interface ImageProps extends ImgHTMLAttributes<HTMLImageElement> {}

export const Image: React.FC<ImageProps> = (props) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <>
      <Loading className={props.className} style={{ display: loaded ? "none" : "block" }} />
      <img {...props} onLoad={() => setLoaded(true)} style={{ display: loaded ? "block" : "none" }} />
    </>
  );
};
