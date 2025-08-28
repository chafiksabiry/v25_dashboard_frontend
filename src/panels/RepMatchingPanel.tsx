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
            {/* Compact Header */}
      <header className="bg-gradient-to-r from-orange-600 to-red-600 text-white p-4 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Users size={24} className="text-yellow-300" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Representative Matching</h1>
              <p className="text-orange-200 text-sm">Find perfect reps for your gigs</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowWeights(!showWeights)}
              className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 text-sm font-medium ${
                showWeights 
                  ? 'bg-white/20 border border-white/40' 
                  : 'bg-white/10 hover:bg-white/20'
              }`}
            >
              <Settings size={16} className={showWeights ? 'rotate-180' : ''} />
              <span>{showWeights ? 'Close' : 'Adjust'}</span>
          </button>
            
            {/* Compact Stats */}
            <div className="hidden md:flex items-center space-x-3 px-3 py-2 bg-white/10 rounded-lg text-xs">
              <span className="font-bold">{reps.length} Reps</span>
              <span>•</span>
              <span className="font-bold">{gigs.length} Gigs</span>
              <span>•</span>
              <span className="font-bold">{matches.length} Matches</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto p-4 space-y-4">
        
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

        {/* Compact Statistics Cards */}
        {!initialLoading && (
          <div className="grid grid-cols-4 gap-4 mb-6">
            {/* Available Reps */}
            <div className="bg-white rounded-lg p-4 shadow border border-green-200">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span className="text-2xl font-bold text-gray-900">{reps.length}</span>
              </div>
              <h3 className="text-sm font-medium text-gray-700">Available Reps</h3>
              <p className="text-xs text-green-600">Ready for matching</p>
            </div>

            {/* Active Gigs */}
            <div className="bg-white rounded-lg p-4 shadow border border-orange-200">
              <div className="flex items-center justify-between mb-2">
                <Zap className="w-5 h-5 text-orange-600" />
                <span className="text-2xl font-bold text-gray-900">{gigs.length}</span>
              </div>
              <h3 className="text-sm font-medium text-gray-700">Active Gigs</h3>
              <p className="text-xs text-orange-600">Ready to match</p>
            </div>

            {/* Perfect Matches */}
            <div className="bg-white rounded-lg p-4 shadow border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <Filter className="w-5 h-5 text-blue-600" />
                <span className="text-2xl font-bold text-gray-900">{matchStats?.perfectMatches || 0}</span>
              </div>
              <h3 className="text-sm font-medium text-gray-700">Perfect Matches</h3>
              <p className="text-xs text-blue-600">{selectedGig ? 'For selected gig' : 'Select a gig'}</p>
            </div>

            {/* Total Matches */}
            <div className="bg-white rounded-lg p-4 shadow border border-purple-200">
              <div className="flex items-center justify-between mb-2">
                <Activity className="w-5 h-5 text-purple-600" />
                <span className="text-2xl font-bold text-gray-900">{matchStats?.totalMatches || matches.length}</span>
              </div>
              <h3 className="text-sm font-medium text-gray-700">Total Matches</h3>
              <p className="text-xs text-purple-600">{matches.length > 0 ? 'Found matches' : 'No matches yet'}</p>
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {gigs.map((gig) => (
              <div
                key={gig._id}
                className={`cursor-pointer transition-all duration-200 ${
                  selectedGig?._id === gig._id ? "scale-102" : "hover:scale-101"
                }`}
                onClick={() => handleGigSelect(gig)}
              >
                <div className={`relative bg-white rounded-lg p-4 border-2 transition-all duration-200 ${
                  selectedGig?._id === gig._id
                    ? "border-orange-400 shadow-lg bg-orange-50"
                    : "border-gray-200 hover:border-orange-300 hover:shadow-md"
                }`}>
                  
                  {/* Header */}
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center space-x-2">
                      <div className={`p-2 rounded-lg ${
                        selectedGig?._id === gig._id 
                          ? "bg-orange-500" 
                          : "bg-gray-400"
                      }`}>
                        <Briefcase size={16} className="text-white" />
                      </div>
                      <div>
                        <h3 className={`font-bold text-base ${
                          selectedGig?._id === gig._id ? "text-orange-900" : "text-gray-800"
                        }`}>
                          {gig.title}
                        </h3>
                        <p className="text-xs text-gray-600">{gig.companyName}</p>
                      </div>
                    </div>
                    
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      selectedGig?._id === gig._id
                        ? "bg-orange-500 text-white"
                        : "bg-blue-100 text-blue-800"
                    }`}>
                      {gig.category}
                    </span>
                  </div>

                  {/* Compact Stats */}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Experience:</span>
                      <span className="font-medium">{gig.seniority?.yearsExperience} years</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Conversion:</span>
                      <span className="font-medium">
                        {gig.expectedConversionRate ? `${(gig.expectedConversionRate * 100).toFixed(1)}%` : "N/A"}
                      </span>
                    </div>
                  </div>

                  {/* Selection Indicator */}
                  {selectedGig?._id === gig._id && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
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
              <div className="mb-4">
                <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center space-x-2">
                  <Users size={20} className="text-orange-600" />
                  <span>Matches for "{selectedGig?.title}"</span>
                </h2>
                <p className="text-sm text-gray-600">Found {matches.length} matching representatives</p>
              </div>
              
              <div className="space-y-3">
                {matches.map((match, index) => {
                  const isInvited = match.isInvited !== undefined ? match.isInvited : invitedAgents.has(match.agentId);
                  const matchPercentage = Math.round(match.overallScore * 100);
                  
                  return (
                    <div 
                      key={`match-${match.agentId}-${index}`} 
                      className="bg-white rounded-lg p-3 shadow border border-gray-200 hover:shadow-md transition-all duration-200"
                    >
                      {/* Simple Rep Info */}
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base font-bold text-gray-900 truncate">{match.agentInfo?.name}</h3>
                          <p className="text-sm text-gray-600 truncate">{match.agentInfo?.email}</p>
                        </div>

                        {/* Status Button */}
                        <div className="flex-shrink-0 ml-4">
                          {isInvited ? (
                            <div className="inline-flex items-center px-3 py-2 bg-green-500 text-white rounded-lg text-sm font-medium gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                              </svg>
                              Invited
                            </div>
                          ) : (
                            <button
                              className="inline-flex items-center px-3 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:from-orange-600 hover:to-red-700 transition-all duration-200 text-sm font-medium gap-1 focus:outline-none focus:ring-2 focus:ring-orange-300 disabled:opacity-50 disabled:cursor-not-allowed"
                              onClick={() => handleCreateGigAgent(match)}
                              disabled={creatingGigAgent}
                              title={`Invite ${match.agentInfo?.name} to ${selectedGig?.title}`}
                            >
                              <Zap className="w-4 h-4" />
                              {creatingGigAgent ? 'Inviting...' : 'Invite'}
                            </button>
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