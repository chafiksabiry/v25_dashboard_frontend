import React, { useState, useEffect } from 'react';
import {
  Settings,
  Shield,
  Phone,
  MessageSquare,
  Users,
  Building2,
  Clock,
  FileText,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  Rocket,
  BarChart,
  BookOpen,
  AlertCircle
} from 'lucide-react';
import Cookies from 'js-cookie';
import axios from 'axios';

const PHASES = [
  {
    id: 1,
    title: "Company Identity",
    subtitle: "Digital foundation",
    icon: Building2,
    color: "#3b82f6",
    steps: [
      { id: 1, title: "Create Company Profile", description: "Legal and commercial details, key contacts, terms" },
      { id: 2, title: "KYC / KYB Verification", description: "Identity verification", disabled: true }
    ]
  },
  {
    id: 2,
    title: "Operational Framework",
    subtitle: "Multi-channel setup",
    icon: Settings,
    color: "#f59e0b",
    steps: [
      { id: 3, title: "Create Gigs", description: "Define gigs and requirements" },
      { id: 4, title: "Telephony Setup", description: "Phone numbers and dialer configuration" },
      { id: 5, title: "Upload Contacts", description: "Import multi-channel contacts" },
      { id: 6, title: "Call Script", description: "Define conversation flows" },
      { id: 7, title: "Reporting Setup", description: "Configure KPI preferences", disabled: true }
    ]
  },
  {
    id: 3,
    title: "REPS Engagement",
    subtitle: "Talent validation",
    icon: Users,
    color: "#10b981",
    steps: [
      { id: 8, title: "Knowledge Base", description: "Training materials and FAQs" },
      { id: 9, title: "REP Onboarding", description: "Training and contract acceptance" },
      { id: 10, title: "Session Planning", description: "Schedule and prioritize leads" }
    ]
  },
  {
    id: 4,
    title: "Market Activation",
    subtitle: "Launching operations",
    icon: Rocket,
    color: "#ef4444",
    steps: [
      { id: 11, title: "Subscription Plan", description: "Select operational plan" },
      { id: 12, title: "Gig Activation", description: "Launch operations" },
      { id: 13, title: "MATCH HARX REPS", description: "Connect with qualified REPS" }
    ]
  }
];

const BriefcaseIcon = Building2;
const CalendarIcon = Clock;

function SettingsPanel() {
  const [onboardingProgress, setOnboardingProgress] = useState<any>(null);
  const [expandedPhases, setExpandedPhases] = useState<number[]>([1]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProgress = async () => {
      const companyId = Cookies.get('companyId');
      if (!companyId) {
        setLoading(false);
        return;
      }
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL_COMPANY}/onboarding/companies/${companyId}/onboarding`);
        if (response.data) {
          setOnboardingProgress(response.data.data || response.data);
        }
      } catch (err) {
        console.error("Failed to fetch onboarding progress:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProgress();
  }, []);

  const togglePhase = (phaseId: number) => {
    setExpandedPhases(prev =>
      prev.includes(phaseId) ? prev.filter(id => id !== phaseId) : [...prev, phaseId]
    );
  };

  const getStepStatus = (stepId: number) => {
    if (!onboardingProgress) return 'pending';
    if (onboardingProgress.completedSteps?.includes(stepId)) return 'completed';
    const currentPhase = onboardingProgress.currentPhase || 1;
    const stepPhase = PHASES.find(p => p.steps.some(s => s.id === stepId))?.id || 1;
    if (stepPhase < currentPhase) return 'completed';
    if (stepPhase === currentPhase) return 'in_progress';
    return 'pending';
  };

  const getStepIcon = (stepId: number) => {
    switch (stepId) {
      case 1: return <Building2 className="w-3.5 h-3.5" />;
      case 2: return <Shield className="w-3.5 h-3.5" />;
      case 3: return <BriefcaseIcon className="w-3.5 h-3.5" />;
      case 4: return <Phone className="w-3.5 h-3.5" />;
      case 5: return <FileText className="w-3.5 h-3.5" />;
      case 6: return <FileText className="w-3.5 h-3.5" />;
      case 7: return <BarChart className="w-3.5 h-3.5" />;
      case 8: return <BookOpen className="w-3.5 h-3.5" />;
      case 9: return <Users className="w-3.5 h-3.5" />;
      case 10: return <CalendarIcon className="w-3.5 h-3.5" />;
      case 11: return <FileText className="w-3.5 h-3.5" />;
      case 12: return <Rocket className="w-3.5 h-3.5" />;
      case 13: return <Users className="w-3.5 h-3.5" />;
      default: return <CheckCircle2 className="w-3.5 h-3.5" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-4 px-4 bg-white/40 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl">
      {/* Compact Header */}
      <div className="mb-6 animate-in">
        <div className="flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-black uppercase tracking-wider mb-2 border border-blue-100/50">
              <Settings className="w-3 h-3" />
              Strategic Roadmap
            </div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">
              Onboarding <span className="text-blue-600">Intelligence</span>
            </h1>
          </div>
          <div className="hidden md:block text-right">
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Global Readiness Score</p>
            <div className="h-1.5 w-32 bg-gray-100 rounded-full mt-1 overflow-hidden">
              <div
                className="h-full bg-blue-600 transition-all duration-1000"
                style={{ width: `${(onboardingProgress?.completedSteps?.length || 0) / 13 * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3 relative pb-4">
        {/* Connection Line */}
        <div className="absolute left-[23px] top-12 bottom-12 w-0.5 bg-gray-100 hidden md:block rounded-full" />

        {PHASES.map((phase) => {
          const PhaseIcon = phase.icon;
          const isExpanded = expandedPhases.includes(phase.id);
          const isCurrentPhase = (onboardingProgress?.currentPhase || 1) === phase.id;

          return (
            <div key={phase.id} className="relative">
              <div className="flex flex-col md:flex-row items-start gap-4">
                {/* Phase Trigger */}
                <button
                  onClick={() => togglePhase(phase.id)}
                  className={`z-10 flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 shadow-lg relative group-hover:scale-105 active:scale-95 border-2 ${isExpanded || isCurrentPhase ? 'border-blue-100' : 'border-white'
                    }`}
                  style={{ backgroundColor: isExpanded || isCurrentPhase ? phase.color : '#f9fafb' }}
                >
                  <PhaseIcon className={`w-5 h-5 ${isExpanded || isCurrentPhase ? 'text-white' : 'text-gray-400'}`} />
                </button>

                {/* Phase Content */}
                <div className="flex-1 w-full">
                  <div className="flex items-center justify-between py-1">
                    <button
                      onClick={() => togglePhase(phase.id)}
                      className="text-left group/title focus:outline-none"
                    >
                      <div className="flex items-center gap-2">
                        <h3 className={`text-lg font-black tracking-tight ${isExpanded ? 'text-gray-900' : 'text-gray-500'}`}>
                          {phase.title}
                        </h3>
                        {isCurrentPhase && (
                          <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 text-[8px] font-black uppercase">Active</span>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-400 font-bold tracking-tight italic">{phase.subtitle}</p>
                    </button>
                    <button
                      onClick={() => togglePhase(phase.id)}
                      className={`p-1.5 rounded-lg transition-transform duration-300 ${isExpanded ? 'bg-gray-100 rotate-180' : 'text-gray-300 hover:text-gray-600'}`}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Steps Grid */}
                  <div className={`transition-all duration-500 overflow-hidden ${isExpanded ? 'max-h-[1000px] opacity-100 mt-3 mb-4' : 'max-h-0 opacity-0'}`}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                      {phase.steps.map((step) => {
                        const status = getStepStatus(step.id);
                        return (
                          <div
                            key={step.id}
                            className={`p-3 rounded-xl border transition-all duration-300 relative ${status === 'completed' ? 'bg-green-50/20 border-green-100' :
                                status === 'in_progress' ? 'bg-blue-50/20 border-blue-100 shadow-sm' :
                                  'bg-white border-gray-50'
                              } ${step.disabled ? 'opacity-40 grayscale' : ''}`}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className={`p-1.5 rounded-lg ${status === 'completed' ? 'bg-green-100 text-green-600' :
                                  status === 'in_progress' ? 'bg-blue-600 text-white' :
                                    'bg-gray-50 text-gray-400'
                                }`}>
                                {status === 'completed' ? <CheckCircle2 className="w-3.5 h-3.5" /> : getStepIcon(step.id)}
                              </div>
                              {status === 'completed' && <span className="text-[8px] font-black uppercase text-green-600">Done</span>}
                            </div>
                            <h4 className="text-[11px] font-black text-gray-900 leading-tight mb-0.5">{step.title}</h4>
                            <p className="text-[10px] text-gray-400 font-medium leading-tight line-clamp-2">{step.description}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Ultra Compact Legend */}
      <div className="mt-4 pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-4">
          <div className="flex items-center gap-1.5 text-[9px] font-black uppercase text-gray-400 tracking-tighter">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500" /> Done
          </div>
          <div className="flex items-center gap-1.5 text-[9px] font-black uppercase text-gray-400 tracking-tighter">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" /> Focus
          </div>
          <div className="flex items-center gap-1.5 text-[9px] font-black uppercase text-gray-400 tracking-tighter">
            <div className="w-1.5 h-1.5 rounded-full bg-gray-200" /> Pending
          </div>
        </div>
        <a href="mailto:support@harx.ai" className="text-[9px] font-black uppercase text-blue-600 hover:underline tracking-tight">Executive Escalation →</a>
      </div>

      <style>{`
        @keyframes slideIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-in { animation: slideIn 0.6s ease-out forwards; }
      `}</style>
    </div>
  );
}

export default SettingsPanel;
