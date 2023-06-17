import { Loader } from 'lucide-react';

export const ThinkingMessage: React.FC = () => {
  return (
    <div className="flex w-full gap-2">
      <img src="/assets/agent.png" className="w-8 h-8 rounded" />
      <div className="flex flex-col bg-slate-100 w-fit max-w-[80%] py-3 px-4 rounded-xl rounded-tl-none">
        <span className="flex items-center gap-1 text-xs text-slate-700">
          <Loader size={14} className="animate-spin" /> <span className="font-medium">Thinking...</span>
        </span>
      </div>
    </div>
  );
};
