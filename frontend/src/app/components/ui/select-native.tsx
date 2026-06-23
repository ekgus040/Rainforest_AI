import * as React from "react";
import { cn } from "./utils";

export interface SelectNativeProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
}

const SelectNative = React.forwardRef<HTMLSelectElement, SelectNativeProps>(
  ({ className, label, children, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label className="text-sm font-medium text-gray-700 block">
            {label}
          </label>
        )}
        <select
          className={cn(
            "flex h-10 w-full rounded-md border border-[#E5E7EB] bg-white px-3 py-2 text-sm",
            "focus:outline-none focus:ring-2 focus:ring-[#2F5D50] focus:border-transparent",
            "disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          ref={ref}
          {...props}
        >
          {children}
        </select>
      </div>
    );
  }
);

SelectNative.displayName = "SelectNative";

export { SelectNative };
