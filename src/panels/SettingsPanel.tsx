import React, { useState, useRef } from 'react';
import {
  Settings,
  Shield,
  Bell,
  Globe,
  Database,
  Phone,
  Mail,
  MessageSquare,
  Users,
  Building2,
  Clock,
  FileText,
  Bot,
  Save,
  AlertCircle,
  CheckCircle2,
  Upload,
  Image,
  X
} from 'lucide-react';

function SettingsPanel() {
  const [configValues, setConfigValues] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeSection, setActiveSection] = useState<string>('general');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sections = [
    {
      id: 'general',
      title: 'General Settings',
      icon: <Settings className="w-5 h-5" />,
      description: 'Configure basic organization settings',
      fields: [
        {
          key: 'company_logo',
          label: 'Company Logo',
          type: 'image',
          description: 'Upload your company logo (PNG, JPG, SVG up to 2MB)',
          accept: 'image/png,image/jpeg,image/svg+xml'
        },
        {
          key: 'company_name',
          label: 'Company Name',
          type: 'text',
          required: true
        },
        {
          key: 'timezone',
          label: 'Default Timezone',
          type: 'select',
          options: [
            { value: 'UTC', label: 'UTC' },
            { value: 'America/New_York', label: 'Eastern Time' },
            { value: 'America/Chicago', label: 'Central Time' },
            { value: 'America/Denver', label: 'Mountain Time' },
            { value: 'America/Los_Angeles', label: 'Pacific Time' }
          ],
          required: true
        },
        {
          key: 'language',
          label: 'Default Language',
          type: 'select',
          options: [
            { value: 'en', label: 'English' },
            { value: 'es', label: 'Spanish' },
            { value: 'fr', label: 'French' }
          ],
          required: true
        }
      ]
    },
    {
      id: 'security',
      title: 'Security Settings',
      icon: <Shield className="w-5 h-5" />,
      description: 'Configure security and authentication settings',
      fields: [
        {
          key: 'mfa_enabled',
          label: 'Require Two-Factor Authentication',
          type: 'toggle',
          description: 'Enforce 2FA for all users'
        },
        {
          key: 'session_timeout',
          label: 'Session Timeout (minutes)',
          type: 'number',
          description: 'Time before users are automatically logged out'
        },
        {
          key: 'password_policy',
          label: 'Password Policy',
          type: 'select',
          options: [
            { value: 'basic', label: 'Basic (8 characters min)' },
            { value: 'standard', label: 'Standard (8 chars, 1 number, 1 special)' },
            { value: 'strict', label: 'Strict (12 chars, numbers, special, caps)' }
          ]
        }
      ]
    },
    {
      id: 'communications',
      title: 'Communication Settings',
      icon: <Globe className="w-5 h-5" />,
      description: 'Configure communication channels',
      fields: [
        {
          key: 'default_phone_system',
          label: 'Default Phone System',
          type: 'select',
          options: [
            { value: 'twilio', label: 'Twilio' },
            { value: 'ovh', label: 'OVH' }
          ]
        },
        {
          key: 'default_email_provider',
          label: 'Default Email Provider',
          type: 'select',
          options: [
            { value: 'gmail', label: 'Gmail' },
            { value: 'outlook', label: 'Outlook' },
            { value: 'zoho', label: 'Zoho' }
          ]
        },
        {
          key: 'default_chat_platform',
          label: 'Default Chat Platform',
          type: 'select',
          options: [
            { value: 'teams', label: 'Microsoft Teams' },
            { value: 'slack', label: 'Slack' }
          ]
        }
      ]
    },
    {
      id: 'ai',
      title: 'AI Settings',
      icon: <Bot className="w-5 h-5" />,
      description: 'Configure AI features and behavior',
      fields: [
        {
          key: 'ai_provider',
          label: 'AI Provider',
          type: 'select',
          options: [
            { value: 'vertex', label: 'Google Vertex AI' },
            { value: 'openai', label: 'OpenAI' }
          ]
        },
        {
          key: 'ai_features',
          label: 'Enabled AI Features',
          type: 'select',
          options: [
            { value: 'all', label: 'All Features' },
            { value: 'analysis', label: 'Analysis Only' },
            { value: 'suggestions', label: 'Suggestions Only' }
          ]
        },
        {
          key: 'ai_confidence_threshold',
          label: 'AI Confidence Threshold',
          type: 'number',
          description: 'Minimum confidence score for AI actions (0-100)'
        }
      ]
    }
  ];

  const validateField = (field: any, value: any): string | undefined => {
    if (field.required && !value) {
      return `${field.label} is required`;
    }
    
    if (field.type === 'number') {
      const num = Number(value);
      if (isNaN(num)) {
        return 'Must be a valid number';
      }
      if (field.key === 'ai_confidence_threshold' && (num < 0 || num > 100)) {
        return 'Must be between 0 and 100';
      }
      if (field.key === 'session_timeout' && num < 1) {
        return 'Must be at least 1 minute';
      }
    }

    if (field.type === 'image' && value) {
      const file = value as File;
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        return 'Image must be less than 2MB';
      }
      if (!field.accept?.split(',').includes(file.type)) {
        return 'Invalid file type. Please use PNG, JPG, or SVG';
      }
    }
    
    return undefined;
  };

  const validateForm = (): boolean => {
    const activeFields = sections.find(s => s.id === activeSection)?.fields || [];
    const newErrors: Record<string, string> = {};
    let hasErrors = false;

    activeFields.forEach(field => {
      const error = validateField(field, configValues[field.key]);
      if (error) {
        newErrors[field.key] = error;
        hasErrors = true;
      }
    });

    setErrors(newErrors);
    return !hasErrors;
  };

  const handleChange = (key: string, value: any) => {
    setConfigValues(prev => ({
      ...prev,
      [key]: value
    }));
    
    // Clear error when user starts typing
    if (errors[key]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }
  };

  const handleImageUpload = async (file: File) => {
    try {
      // Convert image to base64
      const reader = new FileReader();
      reader.onloadend = () => {
        handleChange('company_logo', reader.result as string);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Failed to process image:', err);
      setErrors(prev => ({
        ...prev,
        company_logo: 'Failed to process image'
      }));
    }
  };

  const handleSave = async () => {
    try {
      if (!validateForm()) {
        return;
      }

      setSaving(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save settings:', err);
    } finally {
      setSaving(false);
    }
  };

  const renderField = (field: any) => {
    if (field.type === 'image') {
      return (
        <div>
          {configValues[field.key] ? (
            <div className="relative w-32 h-32 mb-4">
              <img
                src={configValues[field.key]}
                alt="Company Logo"
                className="w-full h-full object-contain rounded-lg border"
              />
              <button
                onClick={() => handleChange(field.key, '')}
                className="absolute -top-2 -right-2 p-1 bg-red-100 text-red-600 rounded-full hover:bg-red-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-32 h-32 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50"
            >
              <Upload className="w-8 h-8 text-gray-400 mb-2" />
              <span className="text-sm text-gray-500">Upload Logo</span>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept={field.accept}
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                handleImageUpload(file);
              }
            }}
          />
        </div>
      );
    }

    if (field.type === 'toggle') {
      return (
        <button
          onClick={() => handleChange(field.key, !configValues[field.key])}
          className={`relative inline-flex h-6 w-11 items-center rounded-full ${
            configValues[field.key] ? 'bg-blue-600' : 'bg-gray-200'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
              configValues[field.key] ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      );
    }

    if (field.type === 'select') {
      return (
        <select
          value={configValues[field.key] || ''}
          onChange={e => handleChange(field.key, e.target.value)}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select...</option>
          {field.options?.map((option: any) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      );
    }

    if (field.type === 'textarea') {
      return (
        <textarea
          value={configValues[field.key] || ''}
          onChange={e => handleChange(field.key, e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      );
    }

    return (
      <input
        type={field.type}
        value={configValues[field.key] || ''}
        onChange={e => handleChange(field.key, e.target.value)}
        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    );
  };

  const activeFields = sections.find(s => s.id === activeSection)?.fields || [];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gray-100 rounded-lg">
              <Settings className="w-6 h-6 text-gray-600" />
            </div>
            <h2 className="text-xl font-semibold">Settings</h2>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 flex items-center gap-2"
          >
            {saving ? (
              <>
                <Clock className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Changes
              </>
            )}
          </button>
        </div>

        {saveSuccess && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-600">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span>Settings saved successfully</span>
          </div>
        )}

        <div className="grid grid-cols-4 gap-6">
          {/* Settings Navigation */}
          <div className="space-y-2">
            {sections.map(section => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full text-left p-3 rounded-lg flex items-center gap-3 ${
                  activeSection === section.id
                    ? 'bg-blue-50 text-blue-600'
                    : 'hover:bg-gray-50'
                }`}
              >
                {section.icon}
                <span>{section.title}</span>
              </button>
            ))}
          </div>

          {/* Settings Fields */}
          <div className="col-span-3 space-y-6">
            <div className="border rounded-lg divide-y">
              {activeFields.map(field => (
                <div key={field.key} className="p-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  
                  {field.description && (
                    <p className="text-sm text-gray-500 mb-2">{field.description}</p>
                  )}

                  {renderField(field)}

                  {errors[field.key] && (
                    <p className="mt-1 text-sm text-red-500">{errors[field.key]}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsPanel;