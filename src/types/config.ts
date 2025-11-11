export interface AppConfig {
  azureEndpoint: string;
  clientId: string;
  tenantId: string;
  scopes: string[];
  assistantId?: string;
}

export const DEFAULT_CONFIG: AppConfig = {
  azureEndpoint: '',
  clientId: '',
  tenantId: '',
  scopes: ['https://ai.azure.com/.default'],
  assistantId: '',
};

export const CONFIG_STORAGE_KEY = 'azure-chat-config';
