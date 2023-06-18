import { Sparkles } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { GoalSetEvent } from '../types/events';

type GoalMessageProps = {
  event: GoalSetEvent;
};

export const GoalMessage: React.FC<GoalMessageProps> = ({ event }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [containerRef.current]);

  return (
    <div ref={containerRef} className="flex w-full gap-2">
      <div className="flex flex-col w-fit ml-auto max-w-[80%] py-3 px-4 rounded-xl rounded-tr-none bg-slate-800 text-slate-50">
        <span className="flex items-center gap-1 text-xs text-slate-300">
          <Sparkles size={14} /> <span className="font-medium">Goal</span>
        </span>

        <p className="text-sm">{event.goal}</p>
      </div>
    </div>
  );
};
