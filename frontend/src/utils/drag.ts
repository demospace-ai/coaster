import { RefObject } from "react";

export const createResizeFunction = <T extends HTMLElement>(ref: RefObject<T>) => {
  const createOnDrag = (startHeight: number, startY: number) => {
    return (e: MouseEvent) => {
      if (ref.current) {
        const newHeight = startHeight + (e.clientY - startY);
        ref.current.style.height = newHeight + "px";
        ref.current.scrollTop = 0;
      }
    };
  };

  const createStopDrag = (onDrag: (e: MouseEvent) => void) => {
    const stopDrag = () => {
      document.documentElement.removeEventListener('mousemove', onDrag, false);
      document.documentElement.removeEventListener('mouseup', stopDrag, false);
    };

    return stopDrag;
  };

  return (e: React.MouseEvent) => {
    const startHeight = ref.current!.clientHeight;
    const startY = e.clientY;
    const onDrag = createOnDrag(startHeight, startY);
    const stopDrag = createStopDrag(onDrag);
    document.documentElement.addEventListener('mousemove', onDrag, false);
    document.documentElement.addEventListener('mouseup', stopDrag, false);
  };
};