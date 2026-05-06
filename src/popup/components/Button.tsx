import type { ComponentPropsWithoutRef } from "react";
import { cn } from "../../utils";

export const Button: React.FC<ComponentPropsWithoutRef<"button">> = ({
  children,
  className,
  ...props
}) => {
  return (
    <button
      className={cn(
        "border border-stroke bg-[rgba(255,255,255,0.04)] text-text py-2.5 px-3",
        "transition-[transform,background] rounded-xl duration-[0.08s,0.15s] ease-out",
        "cursor-pointer font-[650] hover:bg-white/5 active:translate-y-[1px]",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
