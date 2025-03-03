
import React, { useRef, useEffect } from 'react';
import { Message } from '@/components/Message';
import { ChatInput } from '@/components/ChatInput';
import { useChat } from '@/context/ChatContext';
import { Loader2 } from 'lucide-react';

export const ChatContainer: React.FC = () => {
  const { currentConversation, isLoading } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentConversation?.messages]);

  if (!currentConversation) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-muted-foreground text-center">No conversation selected or create a new one.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto chat-scrollbar">
        {currentConversation.messages.map((message) => (
          <Message key={message.id} message={message} />
        ))}
        
        {isLoading && (
          <div className="py-6 bg-secondary/50 animate-pulse">
            <div className="container max-w-4xl mx-auto flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-md flex items-center justify-center bg-primary/10 text-primary">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
              <div className="flex-1">
                <div className="h-4 w-24 bg-muted rounded animate-pulse mb-2"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4 animate-pulse"></div>
                  <div className="h-4 bg-muted rounded w-1/2 animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};
