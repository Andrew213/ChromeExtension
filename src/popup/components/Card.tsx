import { ComponentPropsWithoutRef } from "react";
import { cn } from "../../utils";

const Card: React.FC<ComponentPropsWithoutRef<"div">> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div
      className={cn(
        "bg-card-gradient border border-stroke rounded-2xl shadow-card p-3 mb-2.5",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
