
import React from 'react';
import { Bot, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Message as MessageType } from '@/context/ChatContext';
import { formatDistanceToNow } from 'date-fns';

interface MessageProps {
  message: MessageType;
}

export const Message: React.FC<MessageProps> = ({ message }) => {
  const isUser = message.role === 'user';
  
  return (
    <div className={cn(
      "py-6 animate-in fade-in",
      isUser ? "bg-background" : "bg-secondary/50"
    )}>
      <div className="container max-w-4xl mx-auto flex gap-4">
        <div className={cn(
          "flex-shrink-0 w-8 h-8 rounded-md flex items-center justify-center",
          isUser ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"
        )}>
          {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
        </div>
        
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">
              {isUser ? 'You' : 'AI Assistant'}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(message.timestamp, { addSuffix: true })}
            </span>
          </div>
          
          <div className="prose prose-sm max-w-none">
            {message.content.split('\n').map((paragraph, i) => (
              <p key={i} className={paragraph.trim() === '' ? 'h-4' : ''}>
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
