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
    subtitle: "Setting up your digital foundation",
    icon: Building2,
    color: "#3b82f6", // Blue
    steps: [
      { id: 1, title: "Create Company Profile", description: "Legal and commercial details, key contacts, terms agreement" },
      { id: 2, title: "KYC / KYB Verification", description: "Identity verification through Stripe Identity or Sumsub", disabled: true }
    ]
  },
  {
    id: 2,
    title: "Operational Framework",
    subtitle: "Configuring multi-channel engagement",
    icon: Settings,
    color: "#f59e0b", // Amber
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
    subtitle: "Talent training and validation",
    icon: Users,
    color: "#10b981", // Emerald
    steps: [
      { id: 8, title: "Knowledge Base", description: "Create training materials and FAQs" },
      { id: 9, title: "REP Onboarding", description: "Training, validation, and contract acceptance" },
      { id: 10, title: "Session Planning", description: "Schedule call slots and prioritize leads" }
    ]
  },
  {
    id: 4,
    title: "Market Activation",
    subtitle: "Launching operations level",
    icon: Rocket,
    color: "#ef4444", // Red
    steps: [
      { id: 11, title: "Subscription Plan", description: "Select plan: Free, Standard, or Premium" },
      { id: 12, title: "Gig Activation", description: "Launch multi-channel operations" },
      { id: 13, title: "MATCH HARX REPS", description: "Connect with qualified REPS based on requirements" }
    ]
  }
];

// Helper mock/proxy for Briefcase and BarChart if not imported correctly or to ensure flexibility
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
      case 1: return <Building2 className="w-4 h-4" />;
      case 2: return <Shield className="w-4 h-4" />;
      case 3: return <BriefcaseIcon className="w-4 h-4" />;
      case 4: return <Phone className="w-4 h-4" />;
      case 5: return <FileText className="w-4 h-4" />;
      case 6: return <FileText className="w-4 h-4" />;
      case 7: return <BarChart className="w-4 h-4" />;
      case 8: return <BookOpen className="w-4 h-4" />;
      case 9: return <Users className="w-4 h-4" />;
      case 10: return <CalendarIcon className="w-4 h-4" />;
      case 11: return <FileText className="w-4 h-4" />;
      case 12: return <Rocket className="w-4 h-4" />;
      case 13: return <Users className="w-4 h-4" />;
      default: return <CheckCircle2 className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-24">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8 bg-white/50 backdrop-blur-sm rounded-3xl border border-white/20 shadow-2xl">
      {/* Premium Header */}
      <div className="mb-16 text-center animate-in">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50/80 text-blue-700 text-[10px] font-black uppercase tracking-[0.2em] mb-6 border border-blue-100/50 shadow-sm">
          <Settings className="w-3.5 h-3.5" />
          Enterprise Roadmap
        </div>
        <h1 className="text-5xl font-black text-gray-900 tracking-tight sm:text-6xl mb-6">
          Onboarding <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Intelligence</span>
        </h1>
        <p className="max-w-3xl mx-auto text-xl text-gray-500 font-medium leading-relaxed">
          Navigate your company's evolution through our structured operational phases. 
          Manage milestones, track global readiness, and scale your impact.
        </p>
      </div>

      {/* Professional Timeline/Steps */}
      <div className="space-y-12 relative pb-12">
        {/* Connection Line */}
        <div className="absolute left-[39px] top-20 bottom-24 w-1 bg-gradient-to-b from-blue-500/20 via-indigo-500/20 to-gray-200/20 hidden md:block rounded-full" />

        {PHASES.map((phase, index) => {
          const PhaseIcon = phase.icon;
          const isExpanded = expandedPhases.includes(phase.id);
          const isCurrentPhase = (onboardingProgress?.currentPhase || 1) === phase.id;
          const isCompletedPhase = (onboardingProgress?.currentPhase || 1) > phase.id;

          return (
            <div key={phase.id} className={`relative group transition-opacity duration-500 ${!isExpanded && !isCurrentPhase && !isCompletedPhase ? 'opacity-70 hover:opacity-100' : 'opacity-100'}`}>
              <div 
                className={`flex flex-col md:flex-row items-start gap-8`}
              >
                {/* Phase Number & Icon */}
                <div className="relative flex flex-col items-center">
                   <button
                    onClick={() => togglePhase(phase.id)}
                    className={`z-10 flex-shrink-0 w-20 h-20 rounded-[2rem] flex items-center justify-center transition-all duration-500 shadow-2xl overflow-hidden relative group-hover:scale-110 active:scale-95 border-4 ${
                       isExpanded || isCurrentPhase ? 'border-indigo-100' : 'border-white'
                    }`}
                    style={{ 
                      backgroundColor: isExpanded || isCurrentPhase ? phase.color : '#f9fafb',
                    }}
                  >
                    <PhaseIcon className={`w-10 h-10 transition-colors duration-500 ${isExpanded || isCurrentPhase ? 'text-white' : 'text-gray-400'}`} />
                    {/* Progress Fill Effect */}
                    {isCompletedPhase && (
                      <div className="absolute inset-0 bg-green-500/10 flex items-center justify-center">
                        <CheckCircle2 className="w-12 h-12 text-green-500 opacity-20" />
                      </div>
                    )}
                  </button>
                  <span className="mt-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">Phase 0{phase.id}</span>
                </div>

                {/* Phase Content */}
                <div className="flex-1 w-full">
                  <div className="flex items-center justify-between gap-6 mb-2">
                    <button 
                      onClick={() => togglePhase(phase.id)}
                      className="text-left group/title focus:outline-none flex-1"
                    >
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className={`text-2xl font-black tracking-tight transition-colors duration-500 ${isExpanded ? 'text-gray-900' : 'text-gray-500 group-hover/title:text-gray-800'}`}>
                          {phase.title}
                        </h3>
                        {isCurrentPhase && (
                          <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-700 text-[9px] font-black uppercase tracking-wider animate-pulse">
                            Active Stage
                          </span>
                        )}
                      </div>
                      <p className="text-md text-gray-400 font-semibold italic">
                        {phase.subtitle}
                      </p>
                    </button>
                    
                    <button
                      onClick={() => togglePhase(phase.id)}
                      className={`hidden md:flex p-3 rounded-2xl transition-all duration-500 ${isExpanded ? 'bg-gray-900 text-white rotate-180 shadow-xl' : 'bg-gray-50 text-gray-300 hover:text-gray-600 hover:bg-gray-100'}`}
                    >
                      <ChevronDown className="w-6 h-6" />
                    </button>
                  </div>

                  {/* Steps Drawer */}
                  <div 
                    className={`transition-all duration-700 ease-[cubic-bezier(0.87,0,0.13,1)] overflow-hidden ${isExpanded ? 'max-h-[2000px] opacity-100 mt-8' : 'max-h-0 opacity-0'}`}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                      {phase.steps.map((step) => {
                        const status = getStepStatus(step.id);
                        return (
                          <div 
                            key={step.id} 
                            className={`group/step p-6 rounded-[2rem] border-2 transition-all duration-500 relative overflow-hidden flex flex-col h-full ${
                              status === 'completed' 
                                ? 'bg-gradient-to-br from-green-50/40 to-white border-green-100/50 hover:border-green-200 hover:shadow-lg hover:shadow-green-500/5' 
                                : status === 'in_progress'
                                ? 'bg-gradient-to-br from-blue-50/40 to-white border-blue-200/50 hover:border-blue-400/50 hover:shadow-xl hover:shadow-blue-500/10'
                                : 'bg-white border-gray-50 hover:border-gray-200 hover:shadow-md'
                            } ${step.disabled ? 'opacity-50 grayscale' : ''}`}
                          >
                            {/* Inner Highlight Backdrop */}
                            <div className={`absolute top-0 right-0 w-32 h-32 blur-[60px] rounded-full transition-opacity duration-700 opacity-0 group-hover/step:opacity-40 ${
                              status === 'completed' ? 'bg-green-400' : 'bg-blue-400'
                            }`} />

                            <div className="flex items-start justify-between mb-6 relative z-10">
                              <div className={`p-3.5 rounded-2xl transition-all duration-500 ${
                                status === 'completed' ? 'bg-green-100 text-green-600 shadow-sm' :
                                status === 'in_progress' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' :
                                'bg-gray-100 text-gray-400 group-hover/step:bg-gray-200'
                              }`}>
                                {status === 'completed' ? <CheckCircle2 className="w-6 h-6" /> : getStepIcon(step.id)}
                              </div>
                              
                              <div className="flex flex-col items-end gap-1">
                                {status === 'completed' && (
                                  <span className="text-[9px] font-black uppercase tracking-[0.15em] text-green-600 bg-green-50 px-2.5 py-1 rounded-full border border-green-100 shadow-sm">
                                    Verified
                                  </span>
                                )}
                                {status === 'in_progress' && (
                                  <span className="text-[9px] font-black uppercase tracking-[0.15em] text-blue-700 bg-blue-100/50 px-2.5 py-1 rounded-full border border-blue-200 shadow-sm animate-pulse">
                                    Processing
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="relative z-10">
                              <h4 className="text-md font-black text-gray-900 mb-2 group-hover/step:tracking-wide transition-all duration-300">
                                {step.title}
                              </h4>
                              <p className="text-xs text-gray-500 leading-relaxed font-semibold">
                                {step.description}
                              </p>
                            </div>

                            {/* Decorative Step Index */}
                            <div className="mt-auto pt-6 text-[40px] font-black text-gray-900/5 absolute bottom-4 right-6 select-none group-hover/step:text-blue-500/10 transition-colors">
                              {step.id < 10 ? `0${step.id}` : step.id}
                            </div>
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

      {/* Modern Status Legend */}
      <div className="mt-20 p-8 rounded-[2.5rem] bg-gray-900 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-3xl shadow-blue-900/20 overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-transparent pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.6)]" />
            <span className="text-xs font-black uppercase tracking-widest text-gray-400">Achieved</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.6)] animate-pulse" />
            <span className="text-xs font-black uppercase tracking-widest text-gray-400">Current Focus</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-white/20" />
            <span className="text-xs font-black uppercase tracking-widest text-gray-400">Future Milestone</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4 relative z-10">
          <p className="text-xs font-bold text-gray-400 mr-2 uppercase tracking-tighter">Strategic Support</p>
          <a href="mailto:support@harx.ai" className="px-6 py-3 rounded-2xl bg-white/10 hover:bg-white text-white hover:text-gray-900 font-black text-xs uppercase tracking-widest transition-all duration-300 backdrop-blur-md border border-white/10 group">
            Contact Executives
            <ChevronRight className="w-4 h-4 inline-block ml-2 transition-transform group-hover:translate-x-1" />
          </a>
        </div>
      </div>

      <style>
        {`
          @keyframes slideIn {
            from { opacity: 0; transform: translateY(40px); filter: blur(10px); }
            to { opacity: 1; transform: translateY(0); filter: blur(0); }
          }
          .animate-in {
            animation: slideIn 1.2s cubic-bezier(0.19, 1, 0.22, 1) forwards;
          }
          
          body {
            background-color: #fcfcfd;
          }
        `}
      </style>
    </div>
  );
}

export default SettingsPanel;
