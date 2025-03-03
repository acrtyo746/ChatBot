
import React from 'react';
import { Sidebar } from '@/components/Sidebar';
import { ChatContainer } from '@/components/ChatContainer';
import { ChatInput } from '@/components/ChatInput';

export const MainLayout: React.FC = () => {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      
      <main className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto chat-scrollbar">
          <ChatContainer />
        </div>
        
        <div className="p-4 border-t bg-card shadow-sm">
          <ChatInput />
        </div>
      </main>
    </div>
  );
};
