
import React, { useState } from 'react';
import { useChat } from '@/context/ChatContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PlusCircle, MessageSquare, LogOut, Menu, X, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { formatDistanceToNow } from 'date-fns';
import { ThemeToggle } from './ThemeToggle';

export const Sidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);
  const { conversations, currentConversation, createNewConversation, selectConversation, deleteConversation, hasActiveNewChat } = useChat();
  const { user, logout } = useAuth();

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Mobile toggle button - always visible */}
      <Button
        variant="outline"
        size="icon"
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-50 md:hidden rounded-full shadow-md bg-background border-border"
      >
        {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </Button>

      {/* Sidebar backdrop for mobile - only when open */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden transition-all"
          onClick={toggleSidebar}
        />
      )}
      
      {/* Actual sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-80 border-r bg-card transition-transform duration-300 ease-in-out",
          isOpen ? "transform-none" : "-translate-x-full",
          "md:relative md:z-0 md:transform-none",
          !isOpen && "md:w-20"
        )}
      >
        {/* Desktop toggle button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="absolute right-4 top-4 hidden md:flex rounded-full"
        >
          {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>

        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="px-6 py-6 flex justify-between items-center">
            {isOpen ? (
              <h1 className="text-xl font-semibold tracking-tight">ChatAI</h1>
            ) : (
              <div className="flex justify-center w-full">
                <MessageSquare className="h-6 w-6" />
              </div>
            )}
          </div>
          
          {/* New chat button */}
          <div className="px-4 mb-4">
            <Button 
              variant="outline" 
              className={cn(
                "w-full justify-start gap-2 bg-background hover:bg-secondary text-primary transition-all border-muted",
                hasActiveNewChat && "opacity-70 cursor-not-allowed"
              )}
              onClick={createNewConversation}
              disabled={hasActiveNewChat}
            >
              <PlusCircle className="h-4 w-4" />
              {isOpen && <span>New Chat</span>}
            </Button>
          </div>
          
          {/* Conversations list */}
          <ScrollArea className="flex-1 px-4 sidebar-scrollbar">
            <div className="space-y-1 pr-2">
              {conversations.map((conversation) => (
                <Button
                  key={conversation.id}
                  variant="ghost"
                  className={cn(
                    "w-full justify-start py-2 px-3 text-left font-normal transition-all text-muted-foreground hover:text-foreground",
                    currentConversation?.id === conversation.id && "bg-secondary text-foreground"
                  )}
                  onClick={() => selectConversation(conversation.id)}
                >
                  <div className="flex items-center gap-2 max-w-full">
                    <MessageSquare className="h-4 w-4 flex-shrink-0" />
                    {isOpen && (
                      <div className="flex flex-col space-y-1 overflow-hidden">
                        <span className="truncate">{conversation.title}</span>
                        <span className="text-xs text-muted-foreground truncate">
                          {formatDistanceToNow(conversation.updatedAt, { addSuffix: true })}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {isOpen && currentConversation?.id !== conversation.id && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="ml-auto opacity-0 group-hover:opacity-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteConversation(conversation.id);
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  )}
                </Button>
              ))}
            </div>
          </ScrollArea>
          
          {/* User info and logout */}
          <div className="mt-auto p-4">
            <Separator className="my-2" />
            
            {/* Theme toggle button - placed above user profile */}
            <div className="flex justify-end mb-4">
              <ThemeToggle />
            </div>
            
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-xs font-medium">{user?.name?.charAt(0) || '?'}</span>
                </div>
                {isOpen && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{user?.name || 'User'}</p>
                    {user?.isGuest && (
                      <p className="text-xs text-muted-foreground">Guest User</p>
                    )}
                  </div>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={logout}
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
                <span className="sr-only">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
