import { CheckIcon } from "@heroicons/react/24/outline";
import * as RadixCheckbox from "@radix-ui/react-checkbox";
import classNames from "classnames";

export const Checkbox: React.FC<{ className: string; checked: boolean; onCheckedChange: (checked: boolean) => void; }> = ({ className, checked, onCheckedChange }) => {
  return (
    <RadixCheckbox.Root checked={checked} onCheckedChange={onCheckedChange} className={classNames("tw-bg-white tw-border-[1.2px] tw-border-slate-800 tw-rounded", checked && "tw-bg-slate-100", className)}>
      <RadixCheckbox.Indicator>
        <CheckIcon className="tw-stroke-[2]" />
      </RadixCheckbox.Indicator>
    </RadixCheckbox.Root>
  );
};