import type { ComponentPropsWithoutRef } from "react";

type RangeProps = ComponentPropsWithoutRef<"input">;

const Range = (props: RangeProps) => {
  return (
    <div className="flex items-center gap-2.5">
      <input type="range" min="1" max="5" {...props} />
      <div className="flex justify-between w-full text-[12px] text-muted">
        <span className="text-[12px] text-muted">Медленно</span>
        <span className="font-bold">{props.value}</span>
        <span className="text-[12px] text-muted">Быстро</span>
      </div>
    </div>
  );
};

export default Range;
