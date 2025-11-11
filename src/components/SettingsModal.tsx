import React, { useState, useEffect } from 'react';
import { useConfig } from '../contexts/ConfigContext';
import './SettingsModal.css';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { config, updateConfig, resetConfig } = useConfig();
  
  const [formData, setFormData] = useState({
    azureEndpoint: '',
    clientId: '',
    tenantId: '',
    scopes: '',
    assistantId: '',
  });

  useEffect(() => {
    setFormData({
      azureEndpoint: config.azureEndpoint || '',
      clientId: config.clientId || '',
      tenantId: config.tenantId || '',
      scopes: config.scopes.join(', ') || 'https://ai.azure.com/.default',
      assistantId: config.assistantId || '',
    });
  }, [config, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    updateConfig({
      azureEndpoint: formData.azureEndpoint.trim(),
      clientId: formData.clientId.trim(),
      tenantId: formData.tenantId.trim(),
      scopes: formData.scopes.split(',').map(s => s.trim()).filter(Boolean),
      assistantId: formData.assistantId.trim() || undefined,
    });
    
    onClose();
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all settings?')) {
      resetConfig();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Azure AI Configuration</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="azureEndpoint">
              Azure AI Foundry Endpoint *
              <span className="help-text">e.g., https://your-project.azure-ai.net</span>
            </label>
            <input
              id="azureEndpoint"
              type="url"
              value={formData.azureEndpoint}
              onChange={e => setFormData({ ...formData, azureEndpoint: e.target.value })}
              placeholder="https://your-project.azure-ai.net"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="clientId">
              Entra ID Client ID *
              <span className="help-text">Your app registration client ID</span>
            </label>
            <input
              id="clientId"
              type="text"
              value={formData.clientId}
              onChange={e => setFormData({ ...formData, clientId: e.target.value })}
              placeholder="00000000-0000-0000-0000-000000000000"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="tenantId">
              Tenant ID *
              <span className="help-text">Your Azure AD tenant ID</span>
            </label>
            <input
              id="tenantId"
              type="text"
              value={formData.tenantId}
              onChange={e => setFormData({ ...formData, tenantId: e.target.value })}
              placeholder="00000000-0000-0000-0000-000000000000"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="scopes">
              Scopes *
              <span className="help-text">Comma-separated list of scopes</span>
            </label>
            <input
              id="scopes"
              type="text"
              value={formData.scopes}
              onChange={e => setFormData({ ...formData, scopes: e.target.value })}
              placeholder="https://ai.azure.com/.default"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="assistantId">
              Agent ID (Optional)
              <span className="help-text">The ID of your Azure AI agent</span>
            </label>
            <input
              id="assistantId"
              type="text"
              value={formData.assistantId}
              onChange={e => setFormData({ ...formData, assistantId: e.target.value })}
              placeholder="asst_..."
            />
          </div>

          <div className="form-actions">
            <button type="button" onClick={handleReset} className="button-secondary">
              Reset All
            </button>
            <div className="button-group">
              <button type="button" onClick={onClose} className="button-secondary">
                Cancel
              </button>
              <button type="submit" className="button-primary">
                Save Configuration
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
