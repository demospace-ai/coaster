import { mergeClasses } from "@coaster/utils";

export function FormError({ message, className }: { message: string | undefined; className?: string }) {
  return <div className={mergeClasses("tw-text-red-500", className)}>{message}</div>;
}
