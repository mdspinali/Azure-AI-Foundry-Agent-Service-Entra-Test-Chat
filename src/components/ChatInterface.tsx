import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../contexts/ChatContext';
import { useAzureToken } from '../contexts/AuthContext';
import { useConfig } from '../contexts/ConfigContext';
import './ChatInterface.css';

export const ChatInterface: React.FC = () => {
  const { messages, isLoading, error, sendMessage, clearMessages } = useChat();
  const { isAuthenticated, account, login, logout } = useAzureToken();
  const { config } = useConfig();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    console.log('Auth state:', { isAuthenticated, account: account?.username });
  }, [isAuthenticated, account]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const message = input;
    setInput('');
    await sendMessage(message);
  };

  if (!config.assistantId) {
    return (
      <div className="chat-container">
        <div className="empty-state">
          <h3>Agent ID Required</h3>
          <p>Please configure your Agent ID in settings to start chatting.</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="chat-container">
        <div className="empty-state">
          <h3>Authentication Required</h3>
          <p>Please sign in with your Entra ID account to start chatting.</p>
          <button onClick={login} className="button-primary">
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="chat-info">
          <span className="user-info">
            Signed in as: <strong>{account?.username}</strong>
          </span>
        </div>
        <div className="header-actions">
          <button onClick={clearMessages} className="button-secondary" title="Clear chat">
            Clear
          </button>
          <button onClick={logout} className="button-secondary">
            Sign Out
          </button>
        </div>
      </div>

      {error && (
        <div className="error-banner">
          <strong>Error:</strong> {error}
        </div>
      )}

      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="empty-state">
            <h3>Welcome</h3>
            <p>Start a conversation with your Azure AI Agent.</p>
          </div>
        ) : (
          messages.map((message) => (
            <div key={message.id} className={`message message-${message.role}`}>
              <div className="message-content">
                <div className="message-text">{message.content}</div>
                <div className="message-timestamp">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="message message-assistant">
            <div className="message-content">
              <div className="message-text loading">
                <span className="loading-dot">.</span>
                <span className="loading-dot">.</span>
                <span className="loading-dot">.</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="input-form">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          disabled={isLoading}
          className="message-input"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="send-button"
        >
          Send
        </button>
      </form>
    </div>
  );
};
