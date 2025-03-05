import React, { useState, useEffect  } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
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
  status: 'connected' | 'error' | 'pending' | 'disconnected';
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

  const [integrations,setIntegrations] = useState( [
    // CRM
    { id: 'salesforce', name: 'Salesforce', description: 'Customer relationship management platform', category: 'crm', status: 'pending', icon_url: 'https://api.dicebear.com/7.x/shapes/svg?seed=salesforce', config: { fields: [ { key: 'client_id', label: 'Client ID', type: 'text', required: true }, { key: 'client_secret', label: 'Client Secret', type: 'password', required: true }, { key: 'refresh_token', label: 'Refresh Token', type: 'password', required: true } ] } },
    { id: 'hubspot', name: 'HubSpot', description: 'Inbound marketing, sales, and customer service platform', category: 'crm', status: 'pending', icon_url: 'https://api.dicebear.com/7.x/shapes/svg?seed=hubspot', config: { fields: [ { key: 'api_key', label: 'API Key', type: 'password', required: true } ] } },
    { id: 'zoho-crm', name: 'Zoho CRM', description: 'Cloud-based customer relationship management platform', category: 'crm', status: 'pending', icon_url: 'https://api.dicebear.com/7.x/shapes/svg?seed=zohocrm', config: { fields: [ { key: 'client_id', label: 'Client ID', type: 'text', required: true }, { key: 'client_secret', label: 'Client Secret', type: 'password', required: true } ] } },
  
    // Communication
    { id: 'twilio', name: 'Twilio', description: 'Cloud communications platform for voice, SMS, and video', category: 'communication', status: 'pending', icon_url: 'https://api.dicebear.com/7.x/shapes/svg?seed=twilio', config: { fields: [ { key: 'account_sid', label: 'Account SID', type: 'text', required: true }, { key: 'auth_token', label: 'Auth Token', type: 'password', required: true }, { key: 'phone_number', label: 'Phone Number', type: 'text', required: true, placeholder: '+1234567890' } ] } },
    { id: 'ringcentral', name: 'RingCentral', description: 'Cloud-based communication and collaboration platform', category: 'communication', status: 'pending', icon_url: 'https://api.dicebear.com/7.x/shapes/svg?seed=ringcentral', config: { fields: [ { key: 'client_id', label: 'Client ID', type: 'text', required: true }, { key: 'client_secret', label: 'Client Secret', type: 'password', required: true } ] } },
    { id: 'microsoft-teams', name: 'Microsoft Teams', description: 'Collaborative communication platform', category: 'communication', status: 'pending', icon_url: 'https://api.dicebear.com/7.x/shapes/svg?seed=microsoftteams', config: { fields: [ { key: 'client_id', label: 'Client ID', type: 'text', required: true }, { key: 'client_secret', label: 'Client Secret', type: 'password', required: true } ] } },
    { id: 'zoom', name: 'Zoom', description: 'Video conferencing and webinar platform', category: 'communication', status: 'pending', icon_url: 'https://api.dicebear.com/7.x/shapes/svg?seed=zoom', config: { fields: [ { key: 'api_key', label: 'API Key', type: 'text', required: true }, { key: 'api_secret', label: 'API Secret', type: 'password', required: true } ] } },
  
    // Chat
    { id: 'telegram', name: 'Telegram', description: 'Cloud-based instant messaging and voice service', category: 'chat', status: 'pending', icon_url: 'https://api.dicebear.com/7.x/shapes/svg?seed=telegram', config: { fields: [ { key: 'api_token', label: 'API Token', type: 'password', required: true }, { key: 'chat_id', label: 'Chat ID', type: 'text', required: true } ] } },
    { id: 'slack', name: 'Slack', description: 'Collaboration hub for team communication', category: 'chat', status: 'pending', icon_url: 'https://api.dicebear.com/7.x/shapes/svg?seed=slack', config: { fields: [ { key: 'workspace', label: 'Workspace Domain', type: 'text', required: true }, { key: 'api_token', label: 'API Token', type: 'password', required: true } ] } },
    { id: 'whatsapp', name: 'WhatsApp', description: 'Messaging and voice calling service', category: 'chat', status: 'pending', icon_url: 'https://api.dicebear.com/7.x/shapes/svg?seed=whatsapp', config: { fields: [ { key: 'phone_number', label: 'Phone Number', type: 'text', required: true }, { key: 'api_token', label: 'API Token', type: 'password', required: true } ,{ key: 'phoneNumberId', label: 'Phone Number ID', type: 'text', required: true }] } },
  
    // Email
    { id: 'gmail', name: 'Gmail', description: 'Email service by Google', category: 'email', status: 'pending', icon_url: 'https://api.dicebear.com/7.x/shapes/svg?seed=gmail', config: { fields: [ { key: 'client_id', label: 'Client ID', type: 'text', required: true }, { key: 'client_secret', label: 'Client Secret', type: 'password', required: true } ] } },
    { id: 'microsoft-outlook', name: 'Microsoft Outlook', description: 'Email and personal information manager', category: 'email', status: 'pending', icon_url: 'https://api.dicebear.com/7.x/shapes/svg?seed=microsoftoutlook', config: { fields: [ { key: 'client_id', label: 'Client ID', type: 'text', required: true }, { key: 'tenant_id', label: 'Tenant ID', type: 'text', required: true }, { key: 'client_secret', label: 'Client Secret', type: 'password', required: true } ] } },
    { id: 'zoho-mail', name: 'Zoho Mail', description: 'Email hosting and collaboration suite', category: 'email', status: 'pending', icon_url: 'https://api.dicebear.com/7.x/shapes/svg?seed=zohomail', config: { fields: [ { key: 'email', label: 'Email Address', type: 'text', required: true }, { key: 'api_key', label: 'API Key', type: 'password', required: true } ] } },
    { id: 'aws-ses', name: 'AWS SES', description: 'Amazon Simple Email Service', category: 'email', status: 'pending', icon_url: 'https://api.dicebear.com/7.x/shapes/svg?seed=awsses', config: { fields: [ { key: 'access_key', label: 'Access Key ID', type: 'text', required: true }, { key: 'secret_key', label: 'Secret Access Key', type: 'password', required: true }, { key: 'region', label: 'AWS Region', type: 'text', required: true } ] } },
    { id: 'sendgrid', name: 'SendGrid', description: 'Email delivery service for transactional and marketing emails', category: 'email', status: 'pending', icon_url: 'https://api.dicebear.com/7.x/shapes/svg?seed=sendgrid', config: { fields: [ { key: 'api_key', label: 'API Key', type: 'password', required: true } ] } },
    { id: 'mailchimp', name: 'Mailchimp', description: 'Marketing automation and email marketing platform', category: 'email', status: 'pending', icon_url: 'https://api.dicebear.com/7.x/shapes/svg?seed=mailchimp', config: { fields: [ { key: 'api_key', label: 'API Key', type: 'password', required: true }, { key: 'server_prefix', label: 'Server Prefix', type: 'text', required: true } ] } },
  
    // Ticketing
    { id: 'freshdesk', name: 'Freshdesk', description: 'Cloud-based customer support software', category: 'ticketing', status: 'pending', icon_url: 'https://api.dicebear.com/7.x/shapes/svg?seed=freshdesk', config: { fields: [ { key: 'domain', label: 'Domain', type: 'text', required: true, placeholder: 'yourcompany.freshdesk.com' }, { key: 'api_key', label: 'API Key', type: 'password', required: true } ] } },
    { id: 'zendesk', name: 'Zendesk', description: 'Customer service platform and support ticketing system', category: 'ticketing', status: 'pending', icon_url: 'https://api.dicebear.com/7.x/shapes/svg?seed=zendesk', config: { fields: [ { key: 'subdomain', label: 'Subdomain', type: 'text', required: true }, { key: 'email', label: 'Account Email', type: 'text', required: true }, { key: 'api_token', label: 'API Token', type: 'password', required: true } ] } },
    { id: 'servicenow', name: 'ServiceNow', description: 'Cloud computing platform for IT service management', category: 'ticketing', status: 'pending', icon_url: 'https://api.dicebear.com/7.x/shapes/svg?seed=servicenow', config: { fields: [ { key: 'instance_url', label: 'Instance URL', type: 'text', required: true }, { key: 'username', label: 'Username', type: 'text', required: true }, { key: 'password', label: 'Password', type: 'password', required: true } ] } },
  
    // Authentication
    { id: 'microsoft-azure-ad', name: 'Microsoft Azure AD', description: 'Enterprise identity service', category: 'authentication', status: 'pending', icon_url: 'https://api.dicebear.com/7.x/shapes/svg?seed=microsoftazuread', config: { fields: [ { key: 'tenant_id', label: 'Tenant ID', type: 'text', required: true }, { key: 'client_id', label: 'Client ID', type: 'text', required: true }, { key: 'client_secret', label: 'Client Secret', type: 'password', required: true } ] } },
  
    // Phone
    { id: 'aws-connect', name: 'AWS Connect', description: 'Cloud contact center service', category: 'phone', status: 'pending', icon_url: 'https://api.dicebear.com/7.x/shapes/svg?seed=awsconnect', config: { fields: [ { key: 'access_key', label: 'Access Key ID', type: 'text', required: true }, { key: 'secret_key', label: 'Secret Access Key', type: 'password', required: true }, { key: 'instance_id', label: 'Instance ID', type: 'text', required: true } ] } },
  
    // Default (Network)
    { id: 'google-analytics', name: 'Google Analytics', description: 'Web analytics service by Google', category: 'analytics', status: 'pending', icon_url: 'https://api.dicebear.com/7.x/shapes/svg?seed=googleanalytics', config: { fields: [ { key: 'tracking_id', label: 'Tracking ID', type: 'text', required: true } ] } },
    { id: 'jira', name: 'Jira', description: 'Project and issue tracking platform', category: 'project-management', status: 'pending', icon_url: 'https://api.dicebear.com/7.x/shapes/svg?seed=jira', config: { fields: [ { key: 'domain', label: 'Jira Domain', type: 'text', required: true }, { key: 'api_token', label: 'API Token', type: 'password', required: true } ] } },
    { id: 'intercom', name: 'Intercom', description: 'Customer messaging platform for live chat and support', category: 'support', status: 'pending', icon_url: 'https://api.dicebear.com/7.x/shapes/svg?seed=intercom', config: { fields: [ { key: 'api_key', label: 'API Key', type: 'password', required: true }, { key: 'app_id', label: 'App ID', type: 'text', required: true } ] } },
    { id: 'livechat', name: 'LiveChat', description: 'Live chat software for customer service', category: 'support', status: 'pending', icon_url: 'https://api.dicebear.com/7.x/shapes/svg?seed=livechat', config: { fields: [ { key: 'license_id', label: 'License ID', type: 'text', required: true }, { key: 'api_key', label: 'API Key', type: 'password', required: true } ] } },
    { id: 'ovh', name: 'OVH', description: 'Cloud hosting and web services provider', category: 'cloud', status: 'pending', icon_url: 'https://api.dicebear.com/7.x/shapes/svg?seed=ovh', config: { fields: [ { key: 'api_key', label: 'API Key', type: 'password', required: true }, { key: 'application_secret', label: 'Application Secret', type: 'password', required: true } ] } },
    { id: 'aws-sns', name: 'AWS SNS', description: 'Amazon Simple Notification Service', category: 'cloud', status: 'pending', icon_url: 'https://api.dicebear.com/7.x/shapes/svg?seed=awssns', config: { fields: [ { key: 'access_key', label: 'Access Key ID', type: 'text', required: true }, { key: 'secret_key', label: 'Secret Access Key', type: 'password', required: true }, { key: 'region', label: 'AWS Region', type: 'text', required: true } ] } },
    { id: 'facebook', name: 'Facebook', description: 'Social media platform', category: 'social', status: 'pending', icon_url: 'https://api.dicebear.com/7.x/shapes/svg?seed=facebook', config: { fields: [ { key: 'app_id', label: 'App ID', type: 'text', required: true }, { key: 'app_secret', label: 'App Secret', type: 'password', required: true } ] } },
    { id: 'twitter', name: 'Twitter', description: 'Social media platform', category: 'social', status: 'pending', icon_url: 'https://api.dicebear.com/7.x/shapes/svg?seed=twitter', config: { fields: [ { key: 'api_key', label: 'API Key', type: 'password', required: true }, { key: 'api_secret', label: 'API Secret', type: 'password', required: true } ] } },
    { id: 'instagram', name: 'Instagram', description: 'Social media platform', category: 'social', status: 'pending', icon_url: 'https://api.dicebear.com/7.x/shapes/svg?seed=instagram', config: { fields: [ { key: 'app_id', label: 'App ID', type: 'text', required: true }, { key: 'app_secret', label: 'App Secret', type: 'password', required: true } ] } }
  ],);

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
  const userId = "65d2b8f4e45a3c5a12e8f123"; // Use dynamic user ID if needed

  // ✅ Fetch the integration status when the component mounts
  useEffect(() => {
    const fetchIntegrationStatus = async () => {
        try {
            setLoading(true);
            
            const integrationEndpoints = [
                { id: "twilio", url: `http://localhost:5009/api/twilio/twilio-status?userId=${userId}` },
                { id: "gmail", url: `http://localhost:5009/api/gmail/status?userId=${userId}` },
                { id: "whatsapp", url: `http://localhost:5009/api/whatsapp/status?userId=${userId}` },
                { id : 'telegram', url: `http://localhost:5009/api/telegram/status?userId=${userId}`}
                //{ id: "slack", url: `http://localhost:5009/api/slack/status?userId=${userId}` }
                // Add more integrations here
            ];
            
            const responses = await Promise.all(
                integrationEndpoints.map(integration => 
                    axios.get(integration.url).catch(err => ({ id: integration.id, error: err }))
                )
            );
            
            setIntegrations(prevIntegrations =>
                prevIntegrations.map(integration => {
                    const response = responses.find(res => res.id === integration.id || (res.data && res.data.success && res.config.url.includes(integration.id)));
                    
                    if (response && response.data && response.data.success) {
                        return { ...integration, status: response.data.status };
                    } else {
                        return { ...integration, status: "error" };
                    }
                })
            );
        } catch (err) {
            console.error("Error fetching integration status:", err);
            setError("Failed to load integration statuses.");
        } finally {
            setLoading(false);
        }
    };
    
    fetchIntegrationStatus();
}, [userId]); // Runs on mount and whenever `userId` changes


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
  const handleConnectClick = (integration) => {
    setSelectedIntegration(integration);
    console.log("you selected", integration.name);
  };
  const handleConnect = async () => {
    if (!selectedIntegration) return;
    
    if (selectedIntegration.status === "connected") {
      alert(`${selectedIntegration.name} is already connected!`);
      return;
    }
  
    console.log(`Connecting ${selectedIntegration.name}...`);
  
    // Gather required fields and check for errors
    const requiredFields = selectedIntegration.config?.fields || [];
    let hasError = false;
    const newErrors = {};
  
    requiredFields.forEach(field => {
      if (field.required && !configValues[field.key]) {
        newErrors[field.key] = `${field.label} is required`;
        hasError = true;
      }
    });
  
    setErrors(newErrors);
    
    if (hasError) return; // Stop execution if there are validation errors
  
    try {
      setLoading(true); // Set loading to true when connection starts
  
      let endpoint = "";
      let requestBody = {}; // ✅ Dynamic request body
  
      // ✅ Switch-case to determine the correct endpoint and request body
      switch (selectedIntegration.id) {
        case "twilio":
          endpoint = selectedIntegration.status === "disconnected" ? "reconnect-twilio" : "setup";
          requestBody = {
            userId: "65d2b8f4e45a3c5a12e8f123", // Use dynamic userId if necessary
            accountSid: configValues.account_sid,
            authToken: configValues.auth_token,
            phoneNumber: configValues.phone_number
          };
          break;
  
        case "gmail":
          endpoint = selectedIntegration.status === "disconnected" ? "reconnect-gmail" : "setup-gmail";
          requestBody = {
            userId: "65d2b8f4e45a3c5a12e8f123",
            clientId: configValues.client_id,
            clientSecret: configValues.client_secret
          };
          break;
  
          case "whatsapp":
            endpoint = selectedIntegration.status === "disconnected" ? "reconnect" : "setup";
            requestBody = {
              userId: "65d2b8f4e45a3c5a12e8f123",
              phoneNumber: configValues.phone_number,  // ✅ Match backend field name
              accessToken: configValues.api_token,  // ✅ Match backend field name
              phoneNumberId: configValues.phoneNumberId

            };
            break;
          
  
        case "telegram":
          endpoint = selectedIntegration.status === "disconnected" ? "reconnect" : "setup";
          requestBody = {
            userId: "65d2b8f4e45a3c5a12e8f123",
            apiToken: configValues.api_token,
            chatId: configValues.chat_id
          };
          break;
  
        default:
          throw new Error("Invalid integration selected");
      }
  
      // Make the API request
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL_INTEGRATIONS}/${selectedIntegration.id}/${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(requestBody) // ✅ Send the dynamic request body
      });
  
      const result = await response.json();
  
      if (result.success) {
        toast.success(`${selectedIntegration.name} connected successfully!`);
        console.log(result.status);
  
        // Update the integrations list with the new status
        setIntegrations(prevIntegrations => prevIntegrations.map(integration =>
          integration.id === selectedIntegration.id
            ? { ...integration, status: result.status } // Update status
            : integration
        ));
  
        // Clear the selected integration and config values
        setSelectedIntegration(null);
        setConfigValues({});
      } else {
        throw new Error(result.message || "Failed to connect.");
      }
  
    } catch (error) {
      // Show error message
      toast.error(error.message || "An unexpected error occurred while connecting.");
      console.error(error);
    } finally {
      setLoading(false); // Stop loading once the process completes
    }
  };
  
  

const handleDisconnect = async (integration) => {
  console.log(`Disconnecting ${integration.name}...`);
  
  try {
    setLoading(integration.id);
    
    let endpoint = "";

    // ✅ Switch-case to determine the correct endpoint
    switch (integration.id) {
      case "twilio":
        endpoint = "twilio/disconnect";
        break;
      /*case "gmail":
        endpoint = "gmail/disconnect";
        break;*/
      case "whatsapp":
        endpoint = "whatsapp/disconnect";
        break;
      case "telegram":
        endpoint = "telegram/disconnect";
        break;
      default:
        throw new Error("Invalid integration selected");
    }

    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL_INTEGRATIONS}/${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        userId: "65d2b8f4e45a3c5a12e8f123",
        integrationId: integration.id
      })
    });

    const result = await response.json();

    if (result.success) {
      toast.success(`${integration.name} disconnected successfully!`);
      setIntegrations(prevIntegrations => prevIntegrations.map(i =>
        i.id === integration.id ? { ...i, status: "disconnected" } : i
      ));
    } else {
      throw new Error(result.error || "Failed to disconnect.");
    }
  } catch (error) {
    toast.error(error.message || "An unexpected error occurred while disconnecting.");
    console.error(error);
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
                    onClick={() => handleConnectClick(integration)}
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
                  onClick={handleConnect}
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