import React, { useState, useEffect } from 'react';
import {
  Users,
  Briefcase,
  Zap,
  Settings,
  Activity,
  CheckCircle2,
  Clock,
  Filter
} from 'lucide-react';
import { 
  Rep, 
  Gig, 
  Match, 
  MatchingWeights, 
  MatchResponse 
} from '../types/matching';
import {
  getReps,
  getGigs,
  getGigsByCompanyId,
  findMatchesForGig,
  createGigAgent,
  getGigAgentsForGig,
  getAllSkills,
  getLanguages,
  saveGigWeights,
  getGigWeights,
  resetGigWeights,
  Skill,
  Language,
  GigWeights
} from '../api/matching';
import Cookies from 'js-cookie';

function RepMatchingPanel() {
  const [reps, setReps] = useState<Rep[]>([]);
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [selectedGig, setSelectedGig] = useState<Gig | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showWeights, setShowWeights] = useState(false);
  const [weights, setWeights] = useState<MatchingWeights>({
    experience: 0.20,
    skills: 0.20,
    industry: 0.15,
    languages: 0.15,
    availability: 0.10,
    timezone: 0.10,
    activities: 0.10,
    region: 0.10,
  });
  const [matchStats, setMatchStats] = useState<MatchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [invitedAgents, setInvitedAgents] = useState<Set<string>>(new Set());
  const [creatingGigAgent, setCreatingGigAgent] = useState(false);
  const [gigAgentSuccess, setGigAgentSuccess] = useState<string | null>(null);
  const [gigAgentError, setGigAgentError] = useState<string | null>(null);
  const [skills, setSkills] = useState<{
    professional: Skill[];
    technical: Skill[];
    soft: Skill[];
  }>({ professional: [], technical: [], soft: [] });
  const [languages, setLanguages] = useState<Language[]>([]);
  const [gigHasWeights, setGigHasWeights] = useState(false);

  // Fetch data from real backend
  useEffect(() => {
    const fetchData = async () => {
      setInitialLoading(true);
      setError(null);
      
      try {
        console.log("Fetching data from backend...");
        const companyId = Cookies.get('companyId') || '685abf28641398dc582f4c95';
        
        const [repsData, gigsData, skillsData, languagesData] = await Promise.all([
          getReps(),
          companyId ? getGigsByCompanyId(companyId) : getGigs(),
          getAllSkills(),
          getLanguages()
        ]);
        
        console.log("=== BACKEND DATA ===");
        console.log("Reps:", repsData);
        console.log("Gigs:", gigsData);
        console.log("Skills:", skillsData);
        console.log("Languages:", languagesData);
        
        setReps(repsData);
        setGigs(gigsData);
        setSkills(skillsData);
        setLanguages(languagesData);
        
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to fetch data. Please try again.");
      } finally {
        setInitialLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleGigSelect = async (gig: Gig) => {
    console.log('🎯 GIG SELECTED:', gig.title, 'ID:', gig._id);
    setSelectedGig(gig);
    setLoading(true);
    setError(null);
    setMatches([]);
    setMatchStats(null);
    
    // Reset weights state
    setGigHasWeights(false);
    
    let currentWeights = weights;
    
    try {
      // Try to load saved weights for this gig
      try {
        const savedWeights = await getGigWeights(gig._id || '');
        setWeights(savedWeights.matchingWeights);
        setGigHasWeights(true);
        currentWeights = savedWeights.matchingWeights;
        console.log('✅ Gig has saved weights, loaded:', savedWeights.matchingWeights);
      } catch (error) {
        console.log('❌ No saved weights found for gig:', gig._id);
        setGigHasWeights(false);
        // Keep current weights
      }
      
      // Fetch invited agents for this gig
      const gigAgents = await getGigAgentsForGig(gig._id || '');
      const invitedAgentIds = new Set<string>(gigAgents.map((ga: any) => ga.agentId as string));
      setInvitedAgents(invitedAgentIds);
      console.log('📧 Invited agents for gig:', invitedAgentIds);
      
      // Find matches for the selected gig using current or loaded weights
      console.log("Searching for reps matching gig:", gig.title);
      const matchesData = await findMatchesForGig(gig._id || '', currentWeights);
      console.log("=== MATCHES DATA ===", matchesData);
      
      setMatches(matchesData.preferedmatches || matchesData.matches || []);
      setMatchStats(matchesData);
      
    } catch (error) {
      console.error("Error getting matches:", error);
      setError("Failed to get matches. Please try again.");
      setMatches([]);
      setMatchStats(null);
    } finally {
      setLoading(false);
    }
  };

  const handleWeightChange = (key: string, value: number) => {
    setWeights(prev => ({
      ...prev,
      [key]: value,
    }));
    
    // Auto-search when weights change if a gig is selected
    if (selectedGig) {
      handleGigSelect(selectedGig);
    }
  };

  const resetWeights = () => {
    const defaultWeights: MatchingWeights = {
      experience: 0.20,
      skills: 0.20,
      industry: 0.15,
      languages: 0.15,
      availability: 0.10,
      timezone: 0.10,
      activities: 0.10,
      region: 0.10,
    };
    setWeights(defaultWeights);
    
    // Auto-search when weights are reset if a gig is selected
    if (selectedGig) {
      handleGigSelect(selectedGig);
    }
  };

  // Save weights for selected gig and search
  const saveWeightsForGig = async () => {
    console.log('🚨 SAVE WEIGHTS FOR GIG CALLED');
    
    if (!selectedGig) {
      console.error('No gig selected');
      setError('No gig selected');
      return;
    }

    console.log('🔄 MANUAL SAVE TRIGGERED - User clicked save button');
    setLoading(true);
    setError(null);
    
    try {
      // Save weights to backend
      await saveGigWeights(selectedGig._id || '', weights);
      console.log('✅ Weights saved successfully for gig:', selectedGig._id);
      setGigHasWeights(true);
      
      // Trigger new search with saved weights
      console.log("Searching for reps with saved weights:", selectedGig.title);
      const matchesData = await findMatchesForGig(selectedGig._id || '', weights);
      console.log("=== MATCHES DATA AFTER SAVE ===", matchesData);
      
      setMatches(matchesData.preferedmatches || matchesData.matches || []);
      setMatchStats(matchesData);
      
      // Fetch invited agents
      const gigAgents = await getGigAgentsForGig(selectedGig._id || '');
      const invitedAgentIds = new Set<string>(gigAgents.map((ga: any) => ga.agentId as string));
      setInvitedAgents(invitedAgentIds);
      
    } catch (error) {
      console.error('❌ Error saving weights or searching:', error);
      setError('Failed to save weights or search. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle creating gig-agent (inviting agent to gig)
  const handleCreateGigAgent = async (match: Match) => {
    if (!selectedGig) {
      setGigAgentError("No gig selected");
      return;
    }

    setCreatingGigAgent(true);
    setGigAgentError(null);
    setGigAgentSuccess(null);

    console.log('Creating gig-agent with data:', {
      agentId: match.agentId,
      gigId: selectedGig._id,
      match: match
    });

    const requestData = {
      agentId: match.agentId,
      gigId: selectedGig._id || '',
      matchDetails: match
    };
    
    try {
      const response = await createGigAgent(requestData);
      console.log('Gig-Agent created successfully:', response);
      
      // Add agent to invited list
      setInvitedAgents(prev => new Set([...prev, match.agentId]));
      
      // Update the match object to mark it as invited
      setMatches(prevMatches => 
        prevMatches.map(m => 
          m.agentId === match.agentId 
            ? { ...m, isInvited: true }
            : m
        )
      );
      
      setGigAgentSuccess(`Successfully invited ${match.agentInfo?.name} to ${selectedGig.title}`);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setGigAgentSuccess(null);
      }, 3000);

    } catch (error) {
      console.error('Error creating gig-agent:', error);
      setGigAgentError('Failed to invite agent to gig. Please try again.');
    } finally {
      setCreatingGigAgent(false);
    }
  };

  // Helper functions to get skill and language names
  const getSkillNameById = (skillId: string, skillType: 'professional' | 'technical' | 'soft') => {
    const skillArray = skills[skillType];
    const skill = skillArray.find(s => s._id === skillId);
    return skill ? skill.name : skillId;
  };

  const getLanguageNameByCode = (languageCode: string) => {
    let language = languages.find(l => l.code === languageCode);
    
    if (!language) {
      language = languages.find(l => l._id === languageCode);
    }
    
    if (!language) {
      language = languages.find(l => l.name.toLowerCase() === languageCode.toLowerCase());
    }
    
    return language ? language.name : languageCode;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Header */}
      <header className="relative bg-gradient-to-br from-orange-600 via-red-600 to-pink-700 text-white p-8 shadow-2xl overflow-hidden">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full -translate-x-20 -translate-y-20 animate-pulse"></div>
          <div className="absolute top-20 right-0 w-32 h-32 bg-white rounded-full translate-x-16 -translate-y-16 animate-pulse delay-1000"></div>
          <div className="absolute bottom-0 left-1/3 w-24 h-24 bg-white rounded-full -translate-y-12 animate-pulse delay-500"></div>
        </div>
        
        <div className="container mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center space-y-6 lg:space-y-0">
            {/* Title Section */}
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/30">
                  <Users size={40} className="text-yellow-300 drop-shadow-lg" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-ping"></div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full"></div>
              </div>
              <div>
                <h1 className="text-4xl font-black tracking-tight mb-2 bg-gradient-to-r from-white to-yellow-200 bg-clip-text">
                  Representative Matching
                </h1>
                <p className="text-orange-100 text-lg font-medium flex items-center">
                  <svg className="w-5 h-5 mr-2 text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Find the perfect reps for your gigs with AI-powered matching
                </p>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowWeights(!showWeights)}
                className={`group relative px-6 py-3 rounded-2xl transition-all duration-300 flex items-center space-x-3 shadow-xl transform hover:-translate-y-1 hover:shadow-2xl font-semibold ${
                  showWeights 
                    ? 'bg-white/20 backdrop-blur-sm border-2 border-white/40 text-white' 
                    : 'bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20'
                }`}
              >
                {/* Glow Effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-yellow-400/30 to-orange-400/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
                
                <Settings size={20} className={`transition-transform duration-300 ${showWeights ? 'rotate-180' : 'group-hover:rotate-45'}`} />
                <span className="relative z-10">{showWeights ? 'Close Weights' : 'Adjust Weights'}</span>
                
                {showWeights && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                )}
              </button>
              
              {/* Stats Preview */}
              <div className="hidden lg:flex items-center space-x-6 px-6 py-3 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-300">{reps.length}</div>
                  <div className="text-xs text-orange-200 font-medium">Reps</div>
                </div>
                <div className="w-px h-8 bg-white/30"></div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-300">{gigs.length}</div>
                  <div className="text-xs text-orange-200 font-medium">Gigs</div>
                </div>
                <div className="w-px h-8 bg-white/30"></div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-300">{matches.length}</div>
                  <div className="text-xs text-orange-200 font-medium">Matches</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto p-6 space-y-6">
        
        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg shadow-md">
            <p className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </p>
          </div>
        )}

        {/* Loading Indicators */}
        {initialLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-orange-500"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <Zap size={24} className="text-orange-500 animate-pulse" />
              </div>
            </div>
          </div>
        )}
        
        {/* Weights Configuration Panel */}
        {showWeights && (
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl p-8 mb-8 transform transition-all duration-500 ease-in-out border border-gray-200">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl shadow-lg">
                  <Settings size={24} className="text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Matching Weights Configuration</h2>
                  <p className="text-gray-600 text-sm mt-1">Customize how each factor influences the matching algorithm</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={resetWeights}
                  disabled={loading}
                  className="px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl shadow-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 hover:shadow-xl"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span className="font-semibold">Reset to Default</span>
                </button>
                {selectedGig && gigHasWeights && (
                  <button
                    onClick={async () => {
                      if (!selectedGig) return;
                      try {
                        setLoading(true);
                        await resetGigWeights(selectedGig._id || '');
                        setGigHasWeights(false);
                        resetWeights(); // Reset UI weights to default
                        console.log('✅ Gig weights reset successfully');
                      } catch (error) {
                        console.error('❌ Error resetting gig weights:', error);
                        setError('Failed to reset gig weights');
                      } finally {
                        setLoading(false);
                      }
                    }}
                    disabled={loading}
                    className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl shadow-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 hover:shadow-xl"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span className="font-semibold">Delete Saved Weights</span>
                  </button>
                )}
              </div>
            </div>

            {/* Weights Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {Object.entries(weights).map(([key, value]) => (
                <div key={`weight-${key}`} className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 group">
                  <div className="flex justify-between items-center mb-4">
                    <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                      {key}
                    </label>
                    <div className={`px-3 py-1 rounded-lg text-sm font-bold ${
                      Math.round(value * 100) >= 20 ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white' :
                      Math.round(value * 100) >= 10 ? 'bg-orange-100 text-orange-800' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {Math.round(value * 100)}%
                    </div>
                  </div>
                  
                  {/* Custom Slider */}
                  <div className="relative mb-3">
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={value}
                      onChange={(e) =>
                        handleWeightChange(key, parseFloat(e.target.value))
                      }
                      className="w-full h-3 bg-gray-200 rounded-full appearance-none cursor-pointer slider"
                      style={{
                        background: `linear-gradient(to right, #f97316 0%, #dc2626 ${value * 100}%, #e5e7eb ${value * 100}%, #e5e7eb 100%)`
                      }}
                    />
                    <div 
                      className="absolute top-1/2 transform -translate-y-1/2 w-6 h-6 bg-gradient-to-r from-orange-500 to-red-600 rounded-full shadow-lg border-2 border-white pointer-events-none transition-all duration-200 group-hover:scale-110"
                      style={{ left: `calc(${value * 100}% - 12px)` }}
                    ></div>
                  </div>
                  
                  {/* Weight Description */}
                  <div className="text-xs text-gray-500 text-center">
                    {key === 'experience' && 'Years of relevant experience'}
                    {key === 'skills' && 'Skill compatibility score'}
                    {key === 'industry' && 'Industry background match'}
                    {key === 'languages' && 'Language proficiency'}
                    {key === 'availability' && 'Schedule availability'}
                    {key === 'timezone' && 'Time zone compatibility'}
                    {key === 'activities' && 'Activity performance'}
                    {key === 'region' && 'Geographic location'}
                  </div>
                </div>
              ))}
            </div>
            {/* Info Box */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 mb-6">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-blue-900 mb-1">How Weights Work</h4>
                  <p className="text-sm text-blue-700">
                    These weights determine how much each factor contributes to the overall matching score. 
                    Higher weights give more importance to that criteria when ranking representatives.
                  </p>
                </div>
              </div>
            </div>

            {/* Save Button */}
            {selectedGig && (
              <div className="flex justify-center">
                <button
                  onClick={() => {
                    console.log('🎯 BUTTON CLICKED - User manually clicked save button');
                    saveWeightsForGig();
                  }}
                  disabled={loading}
                  className={`group relative px-10 py-4 rounded-2xl transition-all duration-300 flex items-center space-x-3 shadow-2xl transform hover:-translate-y-1 hover:shadow-3xl font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed ${
                    gigHasWeights 
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white' 
                      : 'bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white'
                  }`}
                >
                  {/* Animated Background */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  {/* Icon */}
                  {loading ? (
                    <div className="animate-spin w-6 h-6 border-2 border-white border-t-transparent rounded-full"></div>
                  ) : (
                    <svg className="w-6 h-6 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  
                  {/* Text */}
                  <span className="relative z-10">
                    {loading ? 'Saving weights...' : (gigHasWeights ? `Update Weights for ${selectedGig.title}` : `Save Weights for ${selectedGig.title}`)}
                  </span>
                  
                  {/* Glow Effect */}
                  <div className={`absolute inset-0 rounded-2xl blur-xl opacity-30 group-hover:opacity-60 transition-opacity duration-300 ${
                    gigHasWeights 
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600' 
                      : 'bg-gradient-to-r from-orange-500 to-red-600'
                  }`}></div>
                </button>
              </div>
            )}
          </div>
        )}

                {/* Statistics Cards */}
        {!initialLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Available Reps */}
            <div className="group relative bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl p-6 shadow-lg border border-green-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <CheckCircle2 className="w-7 h-7 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-gray-900 mb-1">{reps.length}</div>
                  <div className="text-sm font-medium text-green-700">Total Reps</div>
                </div>
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Available Representatives</h3>
              <p className="text-sm text-green-600 flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                Ready for matching
              </p>
            </div>

            {/* Active Gigs */}
            <div className="group relative bg-gradient-to-br from-orange-50 to-red-100 rounded-2xl p-6 shadow-lg border border-orange-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Zap className="w-7 h-7 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-gray-900 mb-1">{gigs.length}</div>
                  <div className="text-sm font-medium text-orange-700">Active Gigs</div>
                </div>
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Available Opportunities</h3>
              <p className="text-sm text-orange-600 flex items-center">
                <div className="w-2 h-2 bg-orange-500 rounded-full mr-2 animate-pulse"></div>
                Ready to match
              </p>
            </div>

            {/* Perfect Matches */}
            <div className="group relative bg-gradient-to-br from-blue-50 to-cyan-100 rounded-2xl p-6 shadow-lg border border-blue-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Filter className="w-7 h-7 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-gray-900 mb-1">{matchStats?.perfectMatches || 0}</div>
                  <div className="text-sm font-medium text-blue-700">Perfect Matches</div>
                </div>
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">High-Quality Matches</h3>
              <p className="text-sm text-blue-600 flex items-center">
                {selectedGig ? (
                  <>
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></div>
                    For selected gig
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
                    Select a gig
                  </>
                )}
              </p>
            </div>

            {/* Total Matches */}
            <div className="group relative bg-gradient-to-br from-purple-50 to-pink-100 rounded-2xl p-6 shadow-lg border border-purple-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Activity className="w-7 h-7 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-gray-900 mb-1">{matchStats?.totalMatches || matches.length}</div>
                  <div className="text-sm font-medium text-purple-700">Total Matches</div>
                </div>
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">All Candidates</h3>
              <p className="text-sm text-purple-600 flex items-center">
                {matches.length > 0 ? (
                  <>
                    <div className="w-2 h-2 bg-purple-500 rounded-full mr-2 animate-pulse"></div>
                    Found matches
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
                    No matches yet
                  </>
                )}
              </p>
            </div>
          </div>
        )}

        {/* Gigs Selection */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center space-x-2">
            <Briefcase size={24} className="text-orange-600" />
            <span>Select a Gig to Find Matching Representatives</span>
          </h2>
          
          {/* Instructions */}
          {selectedGig && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-medium ${
                    gigHasWeights ? 'text-green-800' : 'text-blue-800'
                  }`}>
                    {gigHasWeights 
                      ? `✅ This gig has saved matching weights. Click "Adjust Weights" to modify them, then "Update weights" to save changes and re-search.`
                      : `📋 This gig has no saved weights yet. Click "Adjust Weights" to configure custom weights, then "Save weights" to save and search.`
                    }
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {gigs.map((gig) => (
              <div
                key={gig._id}
                className={`relative group cursor-pointer transition-all duration-300 transform hover:-translate-y-2 ${
                  selectedGig?._id === gig._id
                    ? "scale-105"
                    : "hover:scale-102"
                }`}
                onClick={() => handleGigSelect(gig)}
              >
                {/* Card */}
                <div className={`relative bg-white rounded-2xl p-8 shadow-lg border-2 transition-all duration-300 ${
                  selectedGig?._id === gig._id
                    ? "border-orange-400 shadow-2xl bg-gradient-to-br from-orange-50 to-red-50"
                    : "border-gray-200 hover:border-orange-300 hover:shadow-xl group-hover:bg-gradient-to-br group-hover:from-gray-50 group-hover:to-orange-50"
                }`}>
                  
                  {/* Header */}
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center space-x-3">
                      <div className={`p-3 rounded-xl transition-all duration-300 ${
                        selectedGig?._id === gig._id 
                          ? "bg-gradient-to-r from-orange-500 to-red-600" 
                          : "bg-gradient-to-r from-gray-400 to-gray-600 group-hover:from-orange-500 group-hover:to-red-600"
                      }`}>
                        <Briefcase size={24} className="text-white" />
                      </div>
                      <div>
                        <h3 className={`font-bold text-xl transition-all duration-300 ${
                          selectedGig?._id === gig._id ? "text-orange-900" : "text-gray-800 group-hover:text-orange-900"
                        }`}>
                          {gig.title}
                        </h3>
                        <p className="text-gray-600 font-medium">{gig.companyName}</p>
                      </div>
                    </div>
                    
                    {/* Category Badge */}
                    <span className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                      selectedGig?._id === gig._id
                        ? "bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg"
                        : "bg-blue-100 text-blue-800 group-hover:bg-gradient-to-r group-hover:from-orange-500 group-hover:to-red-600 group-hover:text-white"
                    }`}>
                      {gig.category}
                    </span>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 gap-4 mb-6">
                    <div className="bg-gray-50 rounded-xl p-4 group-hover:bg-white transition-all duration-300">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Clock size={18} className="text-blue-600" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Experience Required</p>
                          <p className="text-lg font-bold text-gray-900">{gig.seniority?.yearsExperience} years</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-xl p-4 group-hover:bg-white transition-all duration-300">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <Activity size={18} className="text-green-600" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Expected Conversion</p>
                          <p className="text-lg font-bold text-gray-900">
                            {gig.expectedConversionRate ? `${(gig.expectedConversionRate * 100).toFixed(1)}%` : "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Selection Indicator */}
                  {selectedGig?._id === gig._id && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}

                  {/* Hover Effect */}
                  <div className={`absolute inset-0 rounded-2xl transition-all duration-300 pointer-events-none ${
                    selectedGig?._id === gig._id
                      ? "ring-4 ring-orange-300 ring-opacity-50"
                      : "group-hover:ring-2 group-hover:ring-orange-300 group-hover:ring-opacity-30"
                  }`}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Matches Results */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-orange-500"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <Zap size={24} className="text-orange-500 animate-pulse" />
                </div>
              </div>
            </div>
          ) : matches.length > 0 ? (
            <>
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl">
                    <Users size={32} className="text-white" />
                  </div>
                  <span>Perfect Matches for "{selectedGig?.title}"</span>
                </h2>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span>Top candidates based on your criteria</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    <span>Ready to invite</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                {matches.map((match, index) => {
                  const isInvited = match.isInvited !== undefined ? match.isInvited : invitedAgents.has(match.agentId);
                  const matchPercentage = Math.round(match.overallScore * 100);
                  
                  return (
                    <div 
                      key={`match-${match.agentId}-${index}`} 
                      className={`bg-white rounded-2xl p-8 shadow-lg border-2 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${
                        matchPercentage >= 90 ? 'border-green-200 bg-gradient-to-r from-green-50 to-emerald-50' :
                        matchPercentage >= 75 ? 'border-orange-200 bg-gradient-to-r from-orange-50 to-yellow-50' :
                        'border-gray-200 hover:border-orange-300'
                      }`}
                    >
                      {/* Header with Rep Info & Match Score */}
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex items-start space-x-6">
                          {/* Avatar */}
                          <div className="relative">
                            {match.agentInfo?.photo ? (
                              <img 
                                src={match.agentInfo.photo} 
                                alt="avatar" 
                                className="w-20 h-20 rounded-2xl border-4 border-white shadow-lg object-cover" 
                              />
                            ) : (
                              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg border-4 border-white">
                                {match.agentInfo?.name?.[0] || "?"}
                              </div>
                            )}
                            {/* Match Score Badge */}
                            <div className={`absolute -top-2 -right-2 w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg ${
                              matchPercentage >= 90 ? 'bg-gradient-to-r from-green-500 to-emerald-600' :
                              matchPercentage >= 75 ? 'bg-gradient-to-r from-orange-500 to-red-600' :
                              'bg-gradient-to-r from-gray-500 to-slate-600'
                            }`}>
                              {matchPercentage}%
                            </div>
                          </div>
                          
                          {/* Rep Details */}
                          <div className="flex-1">
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">{match.agentInfo?.name}</h3>
                            <div className="flex items-center space-x-2 text-gray-600 mb-3">
                              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                              <span className="font-medium">{match.agentInfo?.email}</span>
                            </div>
                            {match.agentInfo?.timezone && (
                              <div className="flex items-center space-x-2 text-gray-600">
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="font-medium">
                                  {match.agentInfo.timezone.timezoneName} ({match.agentInfo.timezone.gmtDisplay})
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Action Button */}
                        <div className="flex flex-col items-end space-y-3">
                          {isInvited ? (
                            <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl shadow-lg font-semibold text-lg gap-3">
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                              </svg>
                              Invited
                            </div>
                          ) : (
                            <button
                              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl shadow-lg hover:from-orange-600 hover:to-red-700 transition-all duration-200 transform hover:-translate-y-1 hover:shadow-xl font-semibold text-lg gap-3 focus:outline-none focus:ring-4 focus:ring-orange-300 disabled:opacity-50 disabled:cursor-not-allowed"
                              onClick={() => handleCreateGigAgent(match)}
                              disabled={creatingGigAgent}
                              title={`Invite ${match.agentInfo?.name} to ${selectedGig?.title}`}
                            >
                              <Zap className="w-6 h-6 animate-pulse" />
                              {creatingGigAgent ? 'Inviting...' : 'Invite Now'}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Details Grid */}
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Experience */}
                        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                          <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center">
                            <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Experience
                          </h4>
                          {match.experienceMatch ? (
                            <div className="space-y-2">
                              <div className="text-2xl font-bold text-gray-900">
                                {match.experienceMatch.details.agentExperience} years
                              </div>
                              <div className="text-sm text-gray-600">
                                Required: {match.experienceMatch.details.gigRequiredExperience} years
                              </div>
                              <div className={`text-sm font-semibold ${
                                match.experienceMatch.score >= 0.8 ? 'text-green-600' : 
                                match.experienceMatch.score >= 0.6 ? 'text-orange-600' : 'text-red-600'
                              }`}>
                                Score: {Math.round(match.experienceMatch.score * 100)}%
                              </div>
                            </div>
                          ) : (
                            <div className="text-gray-400">No experience data</div>
                          )}
                        </div>

                        {/* Languages */}
                        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                          <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center">
                            <svg className="w-4 h-4 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                            </svg>
                            Languages
                          </h4>
                          {match.agentInfo?.languages?.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {match.agentInfo.languages.slice(0, 4).map((lang: { language: string; proficiency?: string }, i: number) => {
                                const languageName = getLanguageNameByCode(lang.language);
                                return (
                                  <span key={i} className="px-3 py-1.5 rounded-lg text-xs bg-purple-100 text-purple-800 border border-purple-200 font-medium">
                                    {languageName}
                                    {lang.proficiency && ` (${lang.proficiency})`}
                                  </span>
                                );
                              })}
                              {match.agentInfo.languages.length > 4 && (
                                <span className="px-3 py-1.5 rounded-lg text-xs bg-gray-100 text-gray-600 border border-gray-200 font-medium">
                                  +{match.agentInfo.languages.length - 4} more
                                </span>
                              )}
                            </div>
                          ) : (
                            <div className="text-gray-400">No languages specified</div>
                          )}
                        </div>

                        {/* Skills */}
                        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                          <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center">
                            <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                            Skills
                          </h4>
                          {match.skillsMatch?.details?.matchingSkills?.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {match.skillsMatch.details.matchingSkills.slice(0, 4).map((skill: { skill: string; skillName: string; type: string }, i: number) => {
                                const skillName = skill.type && skill.skill ? 
                                  getSkillNameById(skill.skill, skill.type as 'professional' | 'technical' | 'soft') : 
                                  skill.skillName || skill.skill;
                                
                                let bgColor = 'bg-gray-100', textColor = 'text-gray-800', borderColor = 'border-gray-200';
                                if (skill.type === 'professional') {
                                  bgColor = 'bg-blue-100'; textColor = 'text-blue-800'; borderColor = 'border-blue-200';
                                } else if (skill.type === 'technical') {
                                  bgColor = 'bg-green-100'; textColor = 'text-green-800'; borderColor = 'border-green-200';
                                } else if (skill.type === 'soft') {
                                  bgColor = 'bg-purple-100'; textColor = 'text-purple-800'; borderColor = 'border-purple-200';
                                }
                                
                                return (
                                  <span key={i} className={`px-3 py-1.5 rounded-lg text-xs ${bgColor} ${textColor} border ${borderColor} font-medium`}>
                                    {skillName}
                                  </span>
                                );
                              })}
                              {match.skillsMatch.details.matchingSkills.length > 4 && (
                                <span className="px-3 py-1.5 rounded-lg text-xs bg-gray-100 text-gray-600 border border-gray-200 font-medium">
                                  +{match.skillsMatch.details.matchingSkills.length - 4} more
                                </span>
                              )}
                            </div>
                          ) : (
                            <div className="text-gray-400">No matching skills</div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Success/Error Messages */}
              {gigAgentSuccess && (
                <div className="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {gigAgentSuccess}
                  </div>
                </div>
              )}

              {gigAgentError && (
                <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    {gigAgentError}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <div className="bg-gray-50 rounded-xl p-8 max-w-md mx-auto">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Briefcase size={24} className="text-orange-600" />
                </div>
                <p className="text-gray-600 text-lg mb-2">No matches found yet.</p>
                <p className="text-sm text-gray-400">Select a gig to find matching representatives.</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default RepMatchingPanel;