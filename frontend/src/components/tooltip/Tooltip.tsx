import Tippy from '@tippyjs/react';
import React from 'react';

type Place = 'top' | 'right' | 'bottom' | 'left';

type TooltipProps = {
  children: React.ReactElement;
  label?: React.ReactElement | string;
  place?: Place;
  disabled?: boolean;
  className?: string;
  hideOnClick?: boolean;
};

export const Tooltip: React.FC<TooltipProps> = props => {
  const place = props.place ? props.place : "bottom";

  return (
    <>
      <Tippy className={props.className} content={props.label} placement={place} delay={0} duration={100} disabled={props.disabled} hideOnClick={props.hideOnClick}>
        {props.children}
      </Tippy>
    </>
  );
};