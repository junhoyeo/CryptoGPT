import { Loader } from 'lucide-react';
import { useEffect, useRef } from 'react';

export const ThinkingMessage: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [containerRef.current]);

  return (
    <div ref={containerRef} className="flex w-full gap-2">
      <img src="/assets/agent.png" className="w-8 h-8 rounded" />
      <div className="flex flex-col bg-slate-100 w-fit max-w-[80%] py-3 px-4 rounded-xl rounded-tl-none">
        <span className="flex items-center gap-1 text-xs text-slate-700">
          <Loader size={14} className="animate-spin" /> <span className="font-medium">Thinking...</span>
        </span>
      </div>
    </div>
  );
};
