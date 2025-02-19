import React, { useState } from 'react';
import {
  Plug,
  Search,
  Filter,
  Plus,
  Phone,
  Mail,
  MessageSquare,
  Share2,
  TicketCheck,
  MessagesSquare,
  Users,
  Lock,
  AlertCircle,
  Settings2,
  X,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  Building2,
  Clock,
  Network
} from 'lucide-react';

interface ConfigField {
  key: string;
  label: string;
  type: 'text' | 'password' | 'url' | 'select';
  placeholder?: string;
  options?: { value: string; label: string }[];
  required?: boolean;
  validation?: (value: string) => string | undefined;
}

interface Integration {
  id: string;
  name: string;
  description: string;
  category: string;
  status: 'connected' | 'error' | 'pending';
  icon_url: string;
  config?: {
    fields: ConfigField[];
  };
}

export function IntegrationsPanel() {
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [configValues, setConfigValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  const integrations: Integration[] = [
    {
      id: 'twilio',
      name: 'Twilio',
      description: 'Cloud communications platform for voice, SMS, and video',
      category: 'phone',
      status: 'pending',
      icon_url: 'https://api.dicebear.com/7.x/shapes/svg?seed=twilio',
      config: {
        fields: [
          {
            key: 'account_sid',
            label: 'Account SID',
            type: 'text',
            required: true
          },
          {
            key: 'auth_token',
            label: 'Auth Token',
            type: 'password',
            required: true
          },
          {
            key: 'phone_number',
            label: 'Phone Number',
            type: 'text',
            required: true,
            placeholder: '+1234567890'
          }
        ]
      }
    },
    {
      id: 'intercom',
      name: 'Intercom',
      description: 'Customer messaging and engagement platform',
      category: 'chat',
      status: 'connected',
      icon_url: 'https://api.dicebear.com/7.x/shapes/svg?seed=intercom',
      config: {
        fields: [
          {
            key: 'access_token',
            label: 'Access Token',
            type: 'password',
            required: true
          },
          {
            key: 'workspace_id',
            label: 'Workspace ID',
            type: 'text',
            required: true
          }
        ]
      }
    },
    {
      id: 'livechat',
      name: 'LiveChat',
      description: 'Live chat and customer service platform',
      category: 'chat',
      status: 'connected',
      icon_url: 'https://api.dicebear.com/7.x/shapes/svg?seed=livechat',
      config: {
        fields: [
          {
            key: 'api_key',
            label: 'API Key',
            type: 'password',
            required: true
          }
        ]
      }
    },
    {
      id: 'zendesk',
      name: 'Zendesk',
      description: 'Customer service and engagement',
      category: 'ticketing',
      status: 'connected',
      icon_url: 'https://api.dicebear.com/7.x/shapes/svg?seed=zendesk',
      config: {
        fields: [
          {
            key: 'subdomain',
            label: 'Subdomain',
            type: 'text',
            required: true
          },
          {
            key: 'api_token',
            label: 'API Token',
            type: 'password',
            required: true
          }
        ]
      }
    },
    {
      id: 'slack',
      name: 'Slack',
      description: 'Team communication and collaboration',
      category: 'communication',
      status: 'connected',
      icon_url: 'https://api.dicebear.com/7.x/shapes/svg?seed=slack',
      config: {
        fields: [
          {
            key: 'bot_token',
            label: 'Bot Token',
            type: 'password',
            required: true
          },
          {
            key: 'signing_secret',
            label: 'Signing Secret',
            type: 'password',
            required: true
          }
        ]
      }
    },
    {
      id: 'teams',
      name: 'Microsoft Teams',
      description: 'Team collaboration and meetings',
      category: 'communication',
      status: 'connected',
      icon_url: 'https://api.dicebear.com/7.x/shapes/svg?seed=msteams',
      config: {
        fields: [
          {
            key: 'client_id',
            label: 'Client ID',
            type: 'text',
            required: true
          },
          {
            key: 'client_secret',
            label: 'Client Secret',
            type: 'password',
            required: true
          }
        ]
      }
    },
    {
      id: 'zoom',
      name: 'Zoom',
      description: 'Video conferencing and meetings',
      category: 'communication',
      status: 'connected',
      icon_url: 'https://api.dicebear.com/7.x/shapes/svg?seed=zoom',
      config: {
        fields: [
          {
            key: 'api_key',
            label: 'API Key',
            type: 'text',
            required: true
          },
          {
            key: 'api_secret',
            label: 'API Secret',
            type: 'password',
            required: true
          }
        ]
      }
    },
    {
      id: 'ovh',
      name: 'OVH',
      description: 'Enterprise-grade telephony and cloud communications',
      category: 'phone',
      status: 'connected',
      icon_url: 'https://api.dicebear.com/7.x/shapes/svg?seed=ovh',
      config: {
        fields: [
          {
            key: 'application_key',
            label: 'Application Key',
            type: 'text',
            required: true
          },
          {
            key: 'application_secret',
            label: 'Application Secret',
            type: 'password',
            required: true
          },
          {
            key: 'consumer_key',
            label: 'Consumer Key',
            type: 'password',
            required: true
          }
        ]
      }
    },
    {
      id: 'zoho-crm',
      name: 'Zoho CRM',
      description: 'Customer relationship management and sales automation',
      category: 'crm',
      status: 'connected',
      icon_url: 'https://api.dicebear.com/7.x/shapes/svg?seed=zohocrm',
      config: {
        fields: [
          {
            key: 'client_id',
            label: 'Client ID',
            type: 'text',
            required: true
          },
          {
            key: 'client_secret',
            label: 'Client Secret',
            type: 'password',
            required: true
          },
          {
            key: 'refresh_token',
            label: 'Refresh Token',
            type: 'password',
            required: true
          }
        ]
      }
    },
    {
      id: 'zoho-mail',
      name: 'Zoho Mail',
      description: 'Professional email and collaboration platform',
      category: 'email',
      status: 'connected',
      icon_url: 'https://api.dicebear.com/7.x/shapes/svg?seed=zohomail',
      config: {
        fields: [
          {
            key: 'client_id',
            label: 'Client ID',
            type: 'text',
            required: true
          },
          {
            key: 'client_secret',
            label: 'Client Secret',
            type: 'password',
            required: true
          }
        ]
      }
    },
    {
      id: 'gmail',
      name: 'Gmail',
      description: 'Google email and messaging platform with OAuth2 integration',
      category: 'email',
      status: 'connected',
      icon_url: 'https://api.dicebear.com/7.x/shapes/svg?seed=gmail',
      config: {
        fields: [
          {
            key: 'client_id',
            label: 'Client ID',
            type: 'text',
            required: true
          },
          {
            key: 'client_secret',
            label: 'Client Secret',
            type: 'password',
            required: true
          }
        ]
      }
    },
    {
      id: 'azure-ad',
      name: 'Microsoft Azure AD',
      description: 'Enterprise identity and access management',
      category: 'authentication',
      status: 'connected',
      icon_url: 'https://api.dicebear.com/7.x/shapes/svg?seed=azuread',
      config: {
        fields: [
          {
            key: 'tenant_id',
            label: 'Tenant ID',
            type: 'text',
            required: true
          },
          {
            key: 'client_id',
            label: 'Client ID',
            type: 'text',
            required: true
          },
          {
            key: 'client_secret',
            label: 'Client Secret',
            type: 'password',
            required: true
          }
        ]
      }
    },
    {
      id: 'aws-ses',
      name: 'AWS SES',
      description: 'Amazon Simple Email Service for scalable email communication',
      category: 'email',
      status: 'connected',
      icon_url: 'https://api.dicebear.com/7.x/shapes/svg?seed=awsses',
      config: {
        fields: [
          {
            key: 'access_key_id',
            label: 'Access Key ID',
            type: 'text',
            required: true
          },
          {
            key: 'secret_access_key',
            label: 'Secret Access Key',
            type: 'password',
            required: true
          },
          {
            key: 'region',
            label: 'Region',
            type: 'text',
            required: true
          }
        ]
      }
    },
    {
      id: 'aws-connect',
      name: 'AWS Connect',
      description: 'Amazon Connect cloud contact center service',
      category: 'phone',
      status: 'connected',
      icon_url: 'https://api.dicebear.com/7.x/shapes/svg?seed=awsconnect',
      config: {
        fields: [
          {
            key: 'access_key_id',
            label: 'Access Key ID',
            type: 'text',
            required: true
          },
          {
            key: 'secret_access_key',
            label: 'Secret Access Key',
            type: 'password',
            required: true
          },
          {
            key: 'instance_id',
            label: 'Instance ID',
            type: 'text',
            required: true
          }
        ]
      }
    }
  ];

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'crm', label: 'CRM' },
    { id: 'chat', label: 'Chat' },
    { id: 'communication', label: 'Communication' },
    { id: 'phone', label: 'Phone' },
    { id: 'email', label: 'Email' },
    { id: 'ticketing', label: 'Ticketing' },
    { id: 'authentication', label: 'Authentication' }
  ];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'chat':
        return <MessagesSquare className="w-5 h-5" />;
      case 'communication':
        return <Users className="w-5 h-5" />;
      case 'phone':
        return <Phone className="w-5 h-5" />;
      case 'email':
        return <Mail className="w-5 h-5" />;
      case 'ticketing':
        return <TicketCheck className="w-5 h-5" />;
      case 'authentication':
        return <Lock className="w-5 h-5" />;
      case 'crm':
        return <Building2 className="w-5 h-5" />;
      default:
        return <Network className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'bg-green-100 text-green-600';
      case 'error':
        return 'bg-red-100 text-red-600';
      default:
        return 'bg-blue-100 text-blue-600';
    }
  };

  const validateField = (field: ConfigField, value: string): string | undefined => {
    if (field.required && !value) {
      return `${field.label} is required`;
    }
    return field.validation?.(value);
  };

  const validateForm = (): boolean => {
    if (!selectedIntegration?.config?.fields) return false;

    const fields = selectedIntegration.config.fields;
    const newErrors: Record<string, string> = {};
    let hasErrors = false;

    fields.forEach(field => {
      const error = validateField(field, configValues[field.key] || '');
      if (error) {
        newErrors[field.key] = error;
        hasErrors = true;
      }
    });

    setErrors(newErrors);
    return !hasErrors;
  };

  const handleConnect = async (integration: Integration) => {
    try {
      setLoading(integration.id);
      setError(null);
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to connect integration');
    } finally {
      setLoading(null);
    }
  };

  const handleDisconnect = async (integration: Integration) => {
    try {
      setLoading(integration.id);
      setError(null);
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to disconnect integration');
    } finally {
      setLoading(null);
    }
  };

  const handleConfigure = (integration: Integration) => {
    setSelectedIntegration(integration);
    setErrors({});
    setError(null);
    
    const existingConfig = {
      api_key: '********',
      region: 'us'
    };
    setConfigValues(existingConfig);
  };

  const handleFieldChange = (key: string, value: string) => {
    setConfigValues(prev => ({ ...prev, [key]: value }));
    
    if (errors[key]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }
  };

  const handleSaveConfig = async () => {
    if (!selectedIntegration) return;

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(selectedIntegration.id);
      setError(null);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSelectedIntegration(null);
      setConfigValues({});
      setErrors({});
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to save configuration');
    } finally {
      setLoading(null);
    }
  };

  const filteredIntegrations = integrations.filter(integration => {
    if (activeFilter !== 'all' && integration.category !== activeFilter) return false;
    if (searchTerm && !integration.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const stats = {
    total: integrations.length,
    connected: integrations.filter(i => i.status === 'connected').length,
    active: integrations.filter(i => i.status === 'connected').length,
    error: integrations.filter(i => i.status === 'error').length
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-cyan-100 rounded-lg">
              <Plug className="w-6 h-6 text-cyan-600" />
            </div>
            <h2 className="text-xl font-semibold">Integrations</h2>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Plug className="w-5 h-5 text-blue-600" />
              <span className="font-medium">Total Integrations</span>
            </div>
            <div className="text-2xl font-bold">{stats.total}</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <span className="font-medium">Connected</span>
            </div>
            <div className="text-2xl font-bold">{stats.connected}</div>
            <div className="text-sm text-green-600 flex items-center gap-1">
              <ArrowUpRight className="w-4 h-4" />
              Active
            </div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-yellow-600" />
              <span className="font-medium">Active</span>
            </div>
            <div className="text-2xl font-bold">{stats.active}</div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span className="font-medium">Errors</span>
            </div>
            <div className="text-2xl font-bold">{stats.error}</div>
            <div className="text-sm text-red-600 flex items-center gap-1">
              <ArrowDownRight className="w-4 h-4" />
              Needs attention
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-600">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search integrations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
            <Filter className="w-5 h-5 text-gray-400" />
          </div>

          <div className="flex gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveFilter(category.id)}
                className={`px-4 py-2 rounded-lg ${
                  activeFilter === category.id
                    ? 'bg-cyan-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {filteredIntegrations.map((integration) => (
            <div
              key={integration.id}
              className="border rounded-lg p-4 hover:border-cyan-500 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <img
                    src={integration.icon_url}
                    alt={integration.name}
                    className="w-8 h-8"
                  />
                  <div>
                    <h3 className="font-semibold">{integration.name}</h3>
                    <p className="text-sm text-gray-500">{integration.description}</p>
                  </div>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs ${getStatusColor(
                    integration.status
                  )}`}
                >
                  {integration.status}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                {getCategoryIcon(integration.category)}
                <span className="capitalize">{integration.category}</span>
              </div>
              <div className="flex gap-2">
                {integration.status === 'connected' ? (
                  <>
                    <button
                      onClick={() => handleConfigure(integration)}
                      className="flex-1 px-3 py-1.5 border border-cyan-600 text-cyan-600 rounded-lg hover:bg-cyan-50"
                    >
                      Configure
                    </button>
                    <button
                      onClick={() => handleDisconnect(integration)}
                      className="px-3 py-1.5 border border-red-600 text-red-600 rounded-lg hover:bg-red-50"
                    >
                      Disconnect
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleConnect(integration)}
                    disabled={loading === integration.id}
                    className="flex-1 px-3 py-1.5 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:bg-cyan-300"
                  >
                    {loading === integration.id ? 'Connecting...' : 'Connect'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedIntegration && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <img
                  src={selectedIntegration.icon_url}
                  alt={selectedIntegration.name}
                  className="w-8 h-8"
                />
                <h3 className="text-lg font-semibold">{selectedIntegration.name} Settings</h3>
              </div>
              <button
                onClick={() => setSelectedIntegration(null)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-600">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-4">
              {selectedIntegration.config?.fields?.map((field) => (
                <div key={field.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  {field.type === 'select' ? (
                    <select
                      value={configValues[field.key] || ''}
                      onChange={e => handleFieldChange(field.key, e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                        errors[field.key] ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select...</option>
                      {field.options?.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={field.type}
                      value={configValues[field.key] || ''}
                      onChange={e => handleFieldChange(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                        errors[field.key] ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                  )}
                  {errors[field.key] && (
                    <p className="mt-1 text-sm text-red-500">{errors[field.key]}</p>
                  )}
                </div>
              ))}
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setSelectedIntegration(null)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveConfig}
                  disabled={loading === selectedIntegration.id}
                  className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:bg-cyan-300"
                >
                  {loading === selectedIntegration.id ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default IntegrationsPanel;