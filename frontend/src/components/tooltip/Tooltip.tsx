import Tippy, { TippyProps } from '@tippyjs/react';
import React from 'react';

type Place = 'top' | 'right' | 'bottom' | 'left';

export interface TooltipProps extends TippyProps {
  children: React.ReactElement;
  label?: React.ReactElement | string;
  place?: Place;
};

export const Tooltip: React.FC<TooltipProps> = props => {
  const { place, label, ...other } = props;
  const placement = props.place ? props.place : "bottom";

  return (
    <>
      <Tippy content={props.label} placement={placement} delay={0} duration={100} {...other}>
        <div>
          {props.children}
        </div>
      </Tippy>
    </>
  );
};