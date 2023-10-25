"use client";

import { mergeClasses } from "@coaster/utils";
import { TrashIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import React, {
  InputHTMLAttributes,
  MouseEvent,
  MouseEventHandler,
  Ref,
  forwardRef,
} from "react";

interface ButtonProps extends InputHTMLAttributes<HTMLButtonElement> {
  onClick?: MouseEventHandler<HTMLButtonElement> | (() => void);
  type?: "button" | "submit" | "reset";
}

export const Button: React.FC<ButtonProps & { ref?: Ref<HTMLButtonElement> }> =
  forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
    const {
      onClick,
      type = "button",
      className,
      children,
      ...remaining
    } = props;

    const buttonStyle = mergeClasses(
      "tw-text-white tw-bg-blue-950 hover:tw-bg-blue-900",
      "tw-py-1 tw-px-4 tw-cursor-pointer tw-font-semibold tw-shadow-none tw-rounded-md tw-tracking-[1px] tw-transition tw-select-none",
      props.disabled &&
        "tw-text-slate-600 tw-bg-slate-300 hover:tw-bg-slate-300 tw-cursor-not-allowed",
      props.className
    );
    return (
      <button
        className={buttonStyle}
        type={type}
        ref={ref}
        onClick={props.onClick}
        {...remaining}
      >
        {props.children}
      </button>
    );
  });

type LinkButtonProps = {
  href: string;
  className?: string;
  children: React.ReactNode;
};

export const LinkButton: React.FC<LinkButtonProps> = forwardRef<
  HTMLAnchorElement,
  LinkButtonProps
>((props, ref) => {
  const { href, className, children, ...remaining } = props;

  const buttonStyle = mergeClasses(
    "tw-flex tw-items-center tw-justify-center tw-text-white tw-bg-blue-950 hover:tw-bg-blue-900tw-tracking-[1px] tw-py-1 tw-px-4 tw-cursor-pointer tw-font-bold tw-shadow-none tw-rounded-md tw-transition tw-select-none",
    props.className
  );
  return (
    <a className={buttonStyle} ref={ref} href={props.href} {...remaining}>
      {props.children}
    </a>
  );
});

type FormButtonProps = {
  className?: string;
  children: React.ReactNode;
};

export const FormButton: React.FC<FormButtonProps> = (props) => {
  const buttonStyle = mergeClasses(
    "tw-text-white tw-bg-blue-950 hover:tw-bg-blue-900 tw-py-1 tw-px-4 tw-cursor-pointer tw-font-bold tw-shadow-none tw-rounded-md tw-tracking-[1px] tw-transition tw-select-none",
    props.className
  );
  return (
    <button className={buttonStyle} type="submit">
      {props.children}
    </button>
  );
};

export const BackButton: React.FC<InputHTMLAttributes<HTMLDivElement>> = (
  props
) => {
  const router = useRouter();

  const onClick = (e: MouseEvent<HTMLDivElement>) => {
    if (props.onClick) {
      props.onClick(e);
    } else {
      router.back();
    }
  };

  return (
    <div
      className={mergeClasses(
        "tw-cursor-pointer tw-select-none tw-text-sm tw-font-[500] hover:tw-text-slate-600 tw-w-fit",
        props.className
      )}
      onClick={onClick}
    >
      {String.fromCharCode(8592)} Back
    </div>
  );
};

type IconButtonProps = {
  onClick: () => void;
  icon: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
  disabled?: boolean;
};
export const IconButton: React.FC<IconButtonProps> = forwardRef<
  HTMLButtonElement,
  IconButtonProps
>((props, ref) => {
  const { onClick, className, children, ...remaining } = props;
  const buttonStyle = mergeClasses(
    "tw-font-semibold tw-flex ",
    "tw-py-1 tw-px-4 tw-cursor-pointer tw-font-bold tw-shadow-none tw-rounded-md tw-tracking-[1px] tw-transition tw-select-none",
    !props.disabled && "hover:tw-bg-slate-100",
    props.disabled && "tw-text-slate-400 tw-cursor-not-allowed",
    props.className
  );
  return (
    <button
      className={buttonStyle}
      type="button"
      ref={ref}
      disabled={props.disabled}
      onClick={props.onClick}
      {...remaining}
    >
      {props.icon}
      {props.children}
    </button>
  );
});

export const DeleteButton = (props: Omit<IconButtonProps, "icon">) => (
  <IconButton {...props} icon={<TrashIcon className="tw-w-5 tw-h-5" />} />
);
