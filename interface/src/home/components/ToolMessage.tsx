import { Wrench } from 'lucide-react';
import { ToolEvent } from '../types/events';

type ToolMessageProps = {
  event: ToolEvent;
};

export const ToolMessage: React.FC<ToolMessageProps> = ({ event }) => {
  return (
    <div
      key={event.id}
      className="flex flex-col bg-slate-100 w-fit max-w-[80%] py-3 pb-4 px-4 rounded-xl rounded-tl-none"
    >
      <span className="flex items-center gap-1 text-xs text-slate-700">
        <Wrench size={14} /> <span className="font-medium">Tool</span>
      </span>

      <div className="flex flex-col gap-2 mt-2">{JSON.stringify(event)}</div>
    </div>
  );
};
