import React, { useId } from 'react';
import ReactTooltip from 'react-tooltip';

type Place = 'top' | 'right' | 'bottom' | 'left';

type TooltipProps = {
  children: React.ReactElement;
  label?: string;
  place?: Place;
  delayHide?: number;
};

export const Tooltip: React.FC<TooltipProps> = props => {
  const id = useId();
  const place = props.place ? props.place : "bottom";

  return (
    <>
      {React.cloneElement(props.children, { "data-tip": "", "data-for": id })}
      <ReactTooltip id={id} place={place} effect="solid" className="!tw-select-none !tw-rounded-lg !tw-bg-gray-900 !tw-opacity-100 after:!tw-bg-gray-900" delayHide={props.delayHide}>
        {props.label}
      </ReactTooltip>
    </>
  );
};