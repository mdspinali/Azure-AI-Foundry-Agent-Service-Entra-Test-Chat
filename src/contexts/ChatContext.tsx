import React, { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import OpenAI from 'openai';
import { useConfig } from './ConfigContext';
import { useAzureToken } from './AuthContext';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatContextType {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  clearMessages: () => void;
  threadId: string | null;
  assistantId: string | null;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within ChatProvider');
  }
  return context;
};

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const { config } = useConfig();
  const { getToken } = useAzureToken();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [threadId, setThreadId] = useState<string | null>(null);
  const assistantId = config.assistantId || null;

  const getOpenAIClient = useCallback(async (): Promise<OpenAI | null> => {
    const token = await getToken();
    if (!token) {
      setError('Failed to get authentication token');
      return null;
    }

    // Configure OpenAI SDK for Azure AI Foundry
    const client = new OpenAI({
      baseURL: `${config.azureEndpoint}`,
      apiKey: token, // Using token as API key
      defaultHeaders: {
        'Authorization': `Bearer ${token}`,
        'Ocp-Apim-Trace': 'true'
      },
      defaultQuery: {
        'api-version': '2025-05-01',
      },
      dangerouslyAllowBrowser: true,
    });

    return client;
  }, [config.azureEndpoint, getToken]);

  const ensureThread = useCallback(async (client: OpenAI): Promise<string> => {
    if (threadId) {
      return threadId;
    }

    // Create a new thread
    const thread = await client.beta.threads.create();
    setThreadId(thread.id);
    return thread.id;
  }, [threadId]);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const client = await getOpenAIClient();
      if (!client) {
        throw new Error('Failed to initialize OpenAI client');
      }

      if (!assistantId) {
        throw new Error('Assistant ID not configured');
      }

      // Add user message to UI
      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, userMessage]);

      // Get or create thread
      const currentThreadId = await ensureThread(client);

      // Add message to thread
      await client.beta.threads.messages.create(currentThreadId, {
        role: 'user',
        content,
      });

      // Run the assistant
      const run = await client.beta.threads.runs.create(currentThreadId, {
        assistant_id: assistantId,
      });

      // Poll for completion
      const runId = run.id;
      let runStatus = await client.beta.threads.runs.retrieve(runId, { thread_id: currentThreadId });
      
      while (runStatus.status === 'queued' || runStatus.status === 'in_progress') {
        await new Promise(resolve => setTimeout(resolve, 1000));
        runStatus = await client.beta.threads.runs.retrieve(runId, { thread_id: currentThreadId });
      }

      if (runStatus.status === 'completed') {
        // Get the assistant's messages
        const threadMessages = await client.beta.threads.messages.list(currentThreadId);
        
        // Find the latest assistant message
        const assistantMessage = threadMessages.data.find(
          msg => msg.role === 'assistant' && msg.run_id === run.id
        );

        if (assistantMessage && assistantMessage.content[0].type === 'text') {
          const assistantReply: Message = {
            id: assistantMessage.id,
            role: 'assistant',
            content: assistantMessage.content[0].text.value,
            timestamp: new Date(assistantMessage.created_at * 1000),
          };
          setMessages(prev => [...prev, assistantReply]);
        }
      } else {
        throw new Error(`Run failed with status: ${runStatus.status}`);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      console.error('Chat error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [assistantId, getOpenAIClient, ensureThread]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setThreadId(null);
    setError(null);
  }, []);

  return (
    <ChatContext.Provider
      value={{
        messages,
        isLoading,
        error,
        sendMessage,
        clearMessages,
        threadId,
        assistantId,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
