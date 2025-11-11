import React from 'react';
import { useMsal } from '@azure/msal-react';
import { ChatInterface } from './ChatInterface';

export const AuthenticatedChatInterface: React.FC = () => {
  const { inProgress } = useMsal();

  if (inProgress !== 'none') {
    return (
      <div className="chat-container">
        <div className="empty-state">
          <h3>Loading...</h3>
          <p>Processing authentication...</p>
        </div>
      </div>
    );
  }

  return <ChatInterface />;
};
