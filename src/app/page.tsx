import { ExtractedDataProvider } from '@/context/ExtractedDataContext';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { ValueBoard } from '@/components/board/ValueBoard';

export default function Dashboard() {
  return (
    <ExtractedDataProvider>
      <div className="flex h-screen">
        {/* Left: Chat Interface - 60% */}
        <div className="w-3/5 border-r border-terminal-border">
          <ChatInterface />
        </div>

        {/* Right: Value Board - 40% */}
        <div className="w-2/5 overflow-auto">
          <ValueBoard />
        </div>
      </div>
    </ExtractedDataProvider>
  );
}
