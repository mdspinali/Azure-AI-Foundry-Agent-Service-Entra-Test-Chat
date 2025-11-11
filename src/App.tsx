import { useState } from 'react';
import { ConfigProvider, useConfig } from './contexts/ConfigContext';
import { AuthProvider } from './contexts/AuthContext';
import { ChatProvider } from './contexts/ChatContext';
import { SettingsModal } from './components/SettingsModal';
import { AuthenticatedChatInterface } from './components/AuthenticatedChatInterface';
import './App.css';

function AppContent() {
  const { isConfigured } = useConfig();
  const [showSettings, setShowSettings] = useState(!isConfigured);

  return (
    <>
      <div className="app">
        <header className="app-header">
          <h1>Azure AI Foundry Agent Chat</h1>
          <button
            onClick={() => setShowSettings(true)}
            className="settings-button"
            title="Settings"
          >
            Settings
          </button>
        </header>

        {isConfigured ? (
          <AuthProvider>
            <ChatProvider>
              <AuthenticatedChatInterface />
            </ChatProvider>
          </AuthProvider>
        ) : (
          <div className="setup-required">
            <h2>Configuration Required</h2>
            <p>Please configure your Azure AI settings to get started.</p>
            <button onClick={() => setShowSettings(true)} className="button-primary">
              Open Settings
            </button>
          </div>
        )}
      </div>

      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </>
  );
}

function App() {
  return (
    <ConfigProvider>
      <AppContent />
    </ConfigProvider>
  );
}

export default App;
