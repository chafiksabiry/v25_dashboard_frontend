import React, { useState, useRef, useEffect } from 'react';
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
  X,
  ChevronRight,
  ChevronDown,
  Target,
  Rocket,
  BarChart,
  BookOpen
} from 'lucide-react';
import Cookies from 'js-cookie';
import axios from 'axios';

function SettingsPanel() {
  const [configValues, setConfigValues] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeSection, setActiveSection] = useState<string>('general');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saving, setSaving] = useState(false);
  const [onboardingProgress, setOnboardingProgress] = useState<any>(null);
  const [expandedPhases, setExpandedPhases] = useState<number[]>([1]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const PHASES = [
    {
      id: 1,
      title: "Company Account Setup & Identity",
      icon: <Building2 className="w-5 h-5" />,
      color: "blue",
      steps: [
        { id: 1, title: "Create Company Profile", description: "Legal and commercial details, key contacts, terms agreement" },
        { id: 2, title: "KYC / KYB Verification", description: "Identity verification through Stripe Identity or Sumsub", disabled: true }
      ]
    },
    {
      id: 2,
      title: "Operational Setup",
      icon: <Settings className="w-5 h-5" />,
      color: "yellow",
      steps: [
        { id: 3, title: "Create Gigs", description: "Define multi-channel gigs and requirements" },
        { id: 4, title: "Telephony Setup", description: "Phone numbers, call tracking, and dialer configuration" },
        { id: 5, title: "Upload Contacts", description: "Import contacts for multi-channel engagement" },
        { id: 6, title: "Call Script", description: "Define script and conversation flows" },
        { id: 7, title: "Reporting Setup", description: "Configure KPIs and reporting preferences", disabled: true }
      ]
    },
    {
      id: 3,
      title: "REPS Engagement",
      icon: <Users className="w-5 h-5" />,
      color: "green",
      steps: [
        { id: 8, title: "Knowledge Base", description: "Create training materials and FAQs" },
        { id: 9, title: "REP Onboarding", description: "Training, validation, and contract acceptance" },
        { id: 10, title: "Session Planning", description: "Schedule call slots and prioritize leads" }
      ]
    },
    {
      id: 4,
      title: "Activation",
      icon: <Rocket className="w-5 h-5" />,
      color: "red",
      steps: [
        { id: 11, title: "Subscription Plan", description: "Select plan: Free, Standard, or Premium" },
        { id: 12, title: "Gig Activation", description: "Launch multi-channel operations" },
        { id: 13, title: "MATCH HARX REPS", description: "Connect with qualified REPS based on requirements" }
      ]
    }
  ];

  useEffect(() => {
    const fetchProgress = async () => {
      const companyId = Cookies.get('companyId');
      if (!companyId) return;
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL_COMPANY}/onboarding/companies/${companyId}/onboarding`);
        if (response.data) {
          setOnboardingProgress(response.data.data || response.data);
        }
      } catch (err) {
        console.error("Failed to fetch onboarding progress:", err);
      }
    };
    fetchProgress();
  }, []);

  const sections = [
    {
      id: 'general',
      title: 'General Settings',
      icon: <Settings className="w-5 h-5" />,
      description: 'Configure your organization settings',
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
      id: 'company_phases',
      title: 'Company Phases & Steps',
      icon: <Building2 className="w-5 h-5" />,
      description: 'Track your company onboarding journey',
      fields: []
    }
  ];

  const togglePhase = (phaseId: number) => {
    setExpandedPhases(prev =>
      prev.includes(phaseId) ? prev.filter(id => id !== phaseId) : [...prev, phaseId]
    );
  };

  const getStepStatus = (stepId: number) => {
    if (!onboardingProgress) return 'pending';
    if (onboardingProgress.completedSteps?.includes(stepId)) return 'completed';

    // Check if the step belongs to the current phase or if previous phase is done
    const currentPhase = onboardingProgress.currentPhase || 1;
    const stepPhase = PHASES.find(p => p.steps.some(s => s.id === stepId))?.id || 1;

    if (stepPhase < currentPhase) return 'completed';
    if (stepPhase === currentPhase) return 'in_progress';
    return 'pending';
  };

  const getStepIcon = (stepId: number) => {
    switch (stepId) {
      case 1: return <Building2 className="w-4 h-4" />;
      case 2: return <Shield className="w-4 h-4" />;
      case 3: return <Briefcase className="w-4 h-4" />;
      case 4: return <Phone className="w-4 h-4" />;
      case 5: return <Upload className="w-4 h-4" />;
      case 6: return <FileText className="w-4 h-4" />;
      case 7: return <BarChart className="w-4 h-4" />;
      case 8: return <BookOpen className="w-4 h-4" />;
      case 9: return <Users className="w-4 h-4" />;
      case 10: return <Calendar className="w-4 h-4" />;
      case 11: return <FileText className="w-4 h-4" />;
      case 12: return <Rocket className="w-4 h-4" />;
      case 13: return <Users className="w-4 h-4" />;
      default: return <CheckCircle2 className="w-4 h-4" />;
    }
  };

  const Briefcase = ({ className }: { className?: string }) => <Building2 className={className} />;
  const Calendar = ({ className }: { className?: string }) => <Clock className={className} />;

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
          className={`relative inline-flex h-6 w-11 items-center rounded-full ${configValues[field.key] ? 'bg-blue-600' : 'bg-gray-200'
            }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${configValues[field.key] ? 'translate-x-6' : 'translate-x-1'
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

  const renderPhases = () => {
    return (
      <div className="space-y-4">
        {PHASES.map((phase) => (
          <div key={phase.id} className="border rounded-xl overflow-hidden bg-gray-50/50">
            <button
              onClick={() => togglePhase(phase.id)}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-lg bg-white shadow-sm text-${phase.color}-600`}>
                  {phase.icon}
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-gray-900">{phase.title}</h3>
                  <p className="text-xs text-gray-500">Phase {phase.id}</p>
                </div>
              </div>
              {expandedPhases.includes(phase.id) ? (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronRight className="w-5 h-5 text-gray-400" />
              )}
            </button>

            {expandedPhases.includes(phase.id) && (
              <div className="p-4 bg-white border-t divide-y">
                {phase.steps.map((step) => {
                  const status = getStepStatus(step.id);
                  return (
                    <div key={step.id} className={`py-4 flex items-start gap-4 ${step.disabled ? 'opacity-50' : ''}`}>
                      <div className={`mt-1 p-1.5 rounded-full ${status === 'completed' ? 'bg-green-100 text-green-600' :
                          status === 'in_progress' ? 'bg-blue-100 text-blue-600' :
                            'bg-gray-100 text-gray-400'
                        }`}>
                        {status === 'completed' ? <CheckCircle2 className="w-4 h-4" /> : getStepIcon(step.id)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="text-sm font-medium text-gray-900">{step.title}</h4>
                          {status === 'completed' && (
                            <span className="text-[10px] font-bold uppercase tracking-wider text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
                              Completed
                            </span>
                          )}
                          {status === 'in_progress' && (
                            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                              In Progress
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">{step.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const activeSectionData = sections.find(s => s.id === activeSection);
  const activeFields = activeSectionData?.fields || [];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        {/* Settings Header */}
        <div className="p-6 border-b bg-gray-50/50">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg shadow-blue-200 shadow-lg">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Settings</h2>
                <p className="text-sm text-gray-500">Manage your organization and track progress</p>
              </div>
            </div>
            {activeSection !== 'company_phases' && (
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 flex items-center gap-2 shadow-lg shadow-blue-200 transition-all hover:-translate-y-0.5"
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
            )}
          </div>
        </div>

        <div className="flex flex-col md:flex-row min-h-[600px]">
          {/* Sidebar Tabs */}
          <div className="w-full md:w-64 border-r bg-gray-50/50 p-4 space-y-2">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeSection === section.id
                    ? "bg-white text-blue-600 shadow-sm border border-gray-200 font-medium"
                    : "text-gray-600 hover:bg-gray-100"
                  }`}
              >
                {section.icon}
                <span className="text-sm">{section.title}</span>
              </button>
            ))}
          </div>

          {/* Main Content Area */}
          <div className="flex-1 p-6 bg-white overflow-y-auto">
            {saveSuccess && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3 text-green-700 animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="p-1.5 bg-green-100 rounded-full">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                </div>
                <span className="font-medium">Settings saved successfully</span>
              </div>
            )}

            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-900">{activeSectionData?.title}</h3>
              <p className="text-sm text-gray-500">{activeSectionData?.description}</p>
            </div>

            {activeSection === 'company_phases' ? (
              renderPhases()
            ) : (
              <div className="border rounded-xl divide-y overflow-hidden">
                {activeFields.map(field => (
                  <div key={field.key} className="p-6 flex flex-col gap-2 hover:bg-gray-50/50 transition-colors">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="flex-1">
                        <label className="block text-sm font-semibold text-gray-800 mb-1">
                          {field.label}
                          {field.required && <span className="text-red-500 ml-1">*</span>}
                        </label>
                        {field.description && (
                          <p className="text-xs text-gray-500 line-clamp-2">{field.description}</p>
                        )}
                      </div>
                      <div className="w-full md:w-72">
                        {renderField(field)}
                        {errors[field.key] && (
                          <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {errors[field.key]}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsPanel;
