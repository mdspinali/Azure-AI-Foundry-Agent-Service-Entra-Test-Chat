import React, { useState } from 'react';
import type { ReactNode } from 'react';
import { MsalProvider, useMsal } from '@azure/msal-react';
import { PublicClientApplication } from '@azure/msal-browser';
import type { Configuration } from '@azure/msal-browser';
import { useConfig } from './ConfigContext';

interface AuthProviderProps {
  children: ReactNode;
}

let msalInstanceCache: PublicClientApplication | null = null;

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const { config, isConfigured } = useConfig();
  const [isReady, setIsReady] = useState(false);

  // If not configured, show children without MSAL (they'll show config UI)
  if (!isConfigured) {
    return <>{children}</>;
  }

  // Create MSAL instance with current config
  if (!msalInstanceCache) {
    const msalConfig: Configuration = {
      auth: {
        clientId: config.clientId,
        authority: `https://login.microsoftonline.com/${config.tenantId}`,
        redirectUri: window.location.origin,
        postLogoutRedirectUri: window.location.origin,
      },
      cache: {
        cacheLocation: 'localStorage',
        storeAuthStateInCookie: false,
      },
    };

    msalInstanceCache = new PublicClientApplication(msalConfig);

    // Handle redirect promise on initialization
    msalInstanceCache.initialize().then(() => {
      msalInstanceCache!.handleRedirectPromise()
        .then(() => {
          setIsReady(true);
        })
        .catch((error) => {
          console.error('Redirect error:', error);
          setIsReady(true);
        });
    });
  }

  if (!isReady) {
    return (
      <div className="chat-container">
        <div className="empty-state">
          <h3>Loading...</h3>
          <p>Initializing authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <MsalProvider instance={msalInstanceCache}>
      {children}
    </MsalProvider>
  );
};

// Hook to get access token for Azure AI services
export const useAzureToken = () => {
  const { instance, accounts, inProgress } = useMsal();
  const { config } = useConfig();

  const getToken = async (): Promise<string | null> => {
    if (!accounts || accounts.length === 0) {
      return null;
    }

    try {
      const response = await instance.acquireTokenSilent({
        scopes: config.scopes,
        account: accounts[0],
      });
      return response.accessToken;
    } catch (error) {
      console.error('Silent token acquisition failed:', error);
      // If silent fails, trigger redirect
      if (inProgress === 'none') {
        await instance.acquireTokenRedirect({
          scopes: config.scopes,
          account: accounts[0],
        });
      }
      return null;
    }
  };

  const login = async () => {
    try {
      await instance.loginRedirect({
        scopes: config.scopes,
      });
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = () => {
    instance.logoutRedirect();
  };

  return {
    getToken,
    login,
    logout,
    isAuthenticated: accounts && accounts.length > 0,
    account: accounts?.[0],
  };
};
