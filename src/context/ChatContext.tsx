
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from './AuthContext';

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  timestamp: Date;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

interface ChatContextType {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  isLoading: boolean;
  createNewConversation: () => void;
  selectConversation: (id: string) => void;
  sendMessage: (content: string) => Promise<void>;
  deleteConversation: (id: string) => void;
  hasActiveNewChat: boolean;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

// Constants
const OLLAMA_API_URL = "http://localhost:11434/api/generate";
const LOCAL_MODEL = "llama3.2:1b";
const STORAGE_KEY = 'chat_conversations';

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasActiveNewChat, setHasActiveNewChat] = useState<boolean>(false);

  // Load conversations from localStorage when user changes
  useEffect(() => {
    if (user) {
      const savedConversations = localStorage.getItem(`${STORAGE_KEY}_${user.id}`);
      
      if (savedConversations) {
        try {
          const parsed = JSON.parse(savedConversations);
          
          // Convert string dates back to Date objects
          const conversationsWithDates = parsed.map((conv: any) => ({
            ...conv,
            createdAt: new Date(conv.createdAt),
            updatedAt: new Date(conv.updatedAt),
            messages: conv.messages.map((msg: any) => ({
              ...msg,
              timestamp: new Date(msg.timestamp)
            }))
          }));
          
          setConversations(conversationsWithDates);
          
          // Set the most recent conversation as current if there is one
          if (conversationsWithDates.length > 0) {
            setCurrentConversation(conversationsWithDates[0]);
          } else {
            createNewConversation();
          }
        } catch (error) {
          console.error("Failed to parse saved conversations:", error);
          createNewConversation();
        }
      } else {
        createNewConversation();
      }
    } else {
      // Clear conversations if user logs out
      setConversations([]);
      setCurrentConversation(null);
    }
  }, [user]);

  // Save conversations to localStorage whenever they change
  useEffect(() => {
    if (user && conversations.length > 0) {
      localStorage.setItem(`${STORAGE_KEY}_${user.id}`, JSON.stringify(conversations));
    }
  }, [conversations, user]);

  const createNewConversation = () => {
    if (!user) return;
    
    // If there's already an active new chat, just select it
    if (hasActiveNewChat && currentConversation && currentConversation.messages.length === 1) {
      return;
    }

    const newConversation: Conversation = {
      id: `conv-${Date.now()}`,
      title: 'New conversation',
      messages: [
        {
          id: `msg-${Date.now()}`,
          content: "Hello! I'm your AI assistant. How can I help you today?",
          role: 'assistant',
          timestamp: new Date()
        }
      ],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setConversations(prev => [newConversation, ...prev]);
    setCurrentConversation(newConversation);
    setHasActiveNewChat(true);
  };

  const selectConversation = (id: string) => {
    const conversation = conversations.find(c => c.id === id);
    if (conversation) {
      setCurrentConversation(conversation);
      
      // Check if this is a new empty chat
      setHasActiveNewChat(conversation.messages.length === 1 && 
                          conversation.messages[0].role === 'assistant');
    }
  };

  const updateConversationTitle = (conversation: Conversation) => {
    // Generate title from first user message if it exists
    const firstUserMessage = conversation.messages.find(m => m.role === 'user');
    if (firstUserMessage) {
      const title = firstUserMessage.content.slice(0, 30) + (firstUserMessage.content.length > 30 ? '...' : '');
      return { ...conversation, title };
    }
    return conversation;
  };

  const sendMessage = async (content: string) => {
    if (!user || !currentConversation) return;

    // Add user message
    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      content,
      role: 'user',
      timestamp: new Date()
    };

    const updatedMessages = [...currentConversation.messages, userMessage];
    const updatedConversation = {
      ...currentConversation,
      messages: updatedMessages,
      updatedAt: new Date()
    };

    // Update the title if this is the first user message
    const conversationWithTitle = updateConversationTitle(updatedConversation);
    
    // Update current conversation and conversation list
    setCurrentConversation(conversationWithTitle);
    setConversations(prev => 
      prev.map(c => c.id === conversationWithTitle.id ? conversationWithTitle : c)
    );

    // No longer a new chat since user has sent a message
    setHasActiveNewChat(false);

    // Now generate AI response
    setIsLoading(true);
    
    try {
      // Try to use Ollama API for response
      let aiResponseText = '';
      
      try {
        const prompt = updatedMessages.map(msg => `${msg.role === 'user' ? 'Human' : 'Assistant'}: ${msg.content}`).join('\n');
        const finalPrompt = `${prompt}\nAssistant:`;
        
        const response = await fetch(OLLAMA_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: LOCAL_MODEL,
            prompt: finalPrompt,
            stream: false
          }),
        });
        
        if (!response.ok) {
          throw new Error(`Ollama API returned ${response.status}`);
        }
        
        const data = await response.json();
        aiResponseText = data.response || "I couldn't generate a response. Please try again.";
      } catch (error) {
        console.error("Failed to get response from Ollama:", error);
        // Fallback response
        aiResponseText = "I'm currently unable to connect to my AI backend. This could be because Ollama is not running locally or there's a connection issue. Please make sure Ollama is running at http://localhost:11434 with the appropriate model installed.";
      }
      
      // Add AI response message
      const aiMessage: Message = {
        id: `msg-${Date.now()}`,
        content: aiResponseText,
        role: 'assistant',
        timestamp: new Date()
      };
      
      const newMessages = [...updatedMessages, aiMessage];
      const finalConversation = {
        ...conversationWithTitle,
        messages: newMessages,
        updatedAt: new Date()
      };
      
      // Update state
      setCurrentConversation(finalConversation);
      setConversations(prev => 
        prev.map(c => c.id === finalConversation.id ? finalConversation : c)
      );
    } catch (error) {
      console.error("Error in chat flow:", error);
      toast({
        title: "Error",
        description: "Failed to process your message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteConversation = (id: string) => {
    setConversations(prev => prev.filter(c => c.id !== id));
    
    if (currentConversation?.id === id) {
      const remaining = conversations.filter(c => c.id !== id);
      if (remaining.length > 0) {
        setCurrentConversation(remaining[0]);
        
        // Check if the new current conversation is a new chat
        const newCurrent = remaining[0];
        setHasActiveNewChat(newCurrent.messages.length === 1 && 
                            newCurrent.messages[0].role === 'assistant');
      } else {
        createNewConversation();
      }
    }
  };

  return (
    <ChatContext.Provider value={{
      conversations,
      currentConversation,
      isLoading,
      createNewConversation,
      selectConversation,
      sendMessage,
      deleteConversation,
      hasActiveNewChat
    }}>
      {children}
    </ChatContext.Provider>
  );
};
