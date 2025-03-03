
import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { useChat } from '@/context/ChatContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

export const ChatInput: React.FC = () => {
  const [message, setMessage] = useState('');
  const { sendMessage, isLoading } = useChat();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Focus textarea on mount
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || isLoading) return;
    
    try {
      await sendMessage(message.trim());
      setMessage('');
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Enter without shift
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
    // Allow newline on Shift + Enter (default behavior)
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className="relative flex items-center w-full max-w-4xl mx-auto border bg-card rounded-xl shadow-sm"
    >
      <Textarea
        ref={textareaRef}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Message..."
        className="flex-1 resize-none bg-transparent py-3 px-4 outline-none max-h-[200px] min-h-[52px] border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
        style={{ minHeight: '52px' }}
        disabled={isLoading}
      />
      
      <Button 
        type="submit" 
        size="icon" 
        variant="ghost" 
        className="absolute right-2 rounded-lg text-primary/80 hover:text-primary hover:bg-secondary transition-all"
        disabled={isLoading || !message.trim()}
      >
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <Send className="h-5 w-5" />
        )}
        <span className="sr-only">Send message</span>
      </Button>
    </form>
  );
};
