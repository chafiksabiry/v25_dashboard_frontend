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
  Skill,
  Language
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
    
    try {
      // Fetch invited agents for this gig
      const gigAgents = await getGigAgentsForGig(gig._id || '');
      const invitedAgentIds = new Set<string>(gigAgents.map((ga: any) => ga.agentId as string));
      setInvitedAgents(invitedAgentIds);
      console.log('📧 Invited agents for gig:', invitedAgentIds);
      
      // Find matches for the selected gig
      console.log("Searching for reps matching gig:", gig.title);
      const matchesData = await findMatchesForGig(gig._id || '', weights);
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
      <header className="bg-gradient-to-r from-orange-600 to-orange-700 text-white p-6 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="bg-white/10 p-2 rounded-lg">
              <Users size={28} className="text-yellow-300 animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Representative Matching</h1>
              <p className="text-orange-200 text-sm mt-1">Find the perfect reps for your gigs</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowWeights(!showWeights)}
              className="flex items-center space-x-2 bg-orange-500 hover:bg-orange-400 px-4 py-2 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              <Settings size={18} className="animate-spin-slow" />
              <span>Adjust Weights</span>
          </button>
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
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6 transform transition-all duration-300 ease-in-out">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center space-x-2">
                <Settings size={20} className="text-orange-600" />
                <span>Matching Weights Configuration</span>
              </h2>
              <div className="flex items-center space-x-3">
                <button
                  onClick={resetWeights}
                  className="text-sm bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Reset to Default</span>
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Object.entries(weights).map(([key, value]) => (
                <div key={`weight-${key}`} className="space-y-3 bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-gray-700 capitalize">
                      {key}
                    </label>
                    <span className="text-sm font-semibold text-orange-600">
                      {Math.round(value * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={value}
                    onChange={(e) =>
                      handleWeightChange(key, parseFloat(e.target.value))
                    }
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-600"
                  />
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-4 italic">
              Note: These weights determine how much each factor contributes to the overall matching score.
            </p>
            {selectedGig && (
              <div className="mt-4 flex justify-center">
                <button
                  onClick={() => {
                    console.log('Applying weights for gig:', selectedGig.title);
                    // Here you could trigger a new search with updated weights
                  }}
                  className="text-sm px-6 py-3 rounded-lg transition-all duration-200 flex items-center space-x-2 shadow-lg bg-orange-600 hover:bg-orange-700 text-white"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Apply weights for {selectedGig.title}</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Statistics Cards */}
        {!initialLoading && (
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                </div>
                <span className="font-medium">Available Reps</span>
              </div>
              <div className="text-2xl font-bold">{reps.length}</div>
              <div className="text-sm text-green-600">Total reps</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Zap className="w-5 h-5 text-yellow-600" />
                </div>
                <span className="font-medium">Active Gigs</span>
              </div>
              <div className="text-2xl font-bold">{gigs.length}</div>
              <div className="text-sm text-yellow-600">Ready to match</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-100 rounded-lg">
              <Filter className="w-5 h-5 text-blue-600" />
                </div>
                <span className="font-medium">Perfect Matches</span>
              </div>
              <div className="text-2xl font-bold">{matchStats?.perfectMatches || 0}</div>
              <div className="text-sm text-blue-600">For selected gig</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Activity className="w-5 h-5 text-purple-600" />
          </div>
              <span className="font-medium">Total Matches</span>
              </div>
              <div className="text-2xl font-bold">{matchStats?.totalMatches || matches.length}</div>
              <div className="text-sm text-purple-600">Found matches</div>
            </div>
          </div>
        )}

        {/* Gigs Selection */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center space-x-2">
            <Briefcase size={24} className="text-orange-600" />
            <span>Select a Gig to Find Matching Representatives</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gigs.map((gig) => (
              <div
                key={gig._id}
                className={`border rounded-xl p-6 cursor-pointer transition-all duration-200 transform hover:-translate-y-1 ${
                  selectedGig?._id === gig._id
                    ? "border-2 border-orange-600 bg-orange-50 ring-2 ring-orange-600 ring-opacity-50 shadow-lg"
                    : "border-gray-200 hover:border-orange-600 hover:shadow-md"
                }`}
                onClick={() => handleGigSelect(gig)}
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className={`font-medium text-lg ${
                    selectedGig?._id === gig._id ? "text-orange-900" : "text-gray-800"
                  }`}>
                    {gig.title}
                  </h3>
                  <span className="text-xs px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-medium">
                    {gig.category}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mb-4">{gig.companyName}</p>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <Clock size={16} className="text-gray-400" />
                    <p>Required Experience: {gig.seniority?.yearsExperience} years</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Activity size={16} className="text-gray-400" />
                    <p>Expected Conversion: {gig.expectedConversionRate ? `${(gig.expectedConversionRate * 100).toFixed(1)}%` : "N/A"}</p>
                  </div>
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
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center space-x-3">
                <Users size={28} className="text-orange-600" />
                <span>Matching Representatives for "{selectedGig?.title}"</span>
              </h2>
              <div className="overflow-x-auto rounded-xl shadow-lg border border-gray-100">
                <table className="min-w-full bg-white">
                  <thead className="bg-orange-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-orange-700 uppercase tracking-wider">Representative</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-orange-700 uppercase tracking-wider">Languages</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-orange-700 uppercase tracking-wider">Skills</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-orange-700 uppercase tracking-wider">Experience</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-orange-700 uppercase tracking-wider">Match Score</th>
                      <th className="px-6 py-4 text-center text-xs font-bold text-orange-700 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {matches.map((match, index) => (
                      <tr key={`match-${match.agentId}-${index}`} className="hover:bg-orange-50 transition-all duration-200">
                        <td className="px-6 py-4">
                          <div className="flex items-start space-x-4">
                            {match.agentInfo?.photo ? (
                              <img src={match.agentInfo.photo} alt="avatar" className="w-14 h-14 rounded-full border-2 border-orange-100 shadow-sm" />
                            ) : (
                              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                                {match.agentInfo?.name?.[0] || "?"}
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="font-bold text-gray-900 text-lg mb-1">{match.agentInfo?.name}</div>
                              <div className="text-sm text-gray-600 mb-2 flex items-center">
                                <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                {match.agentInfo?.email}
                              </div>
                              {match.agentInfo?.timezone && (
                                <div className="mt-2 flex items-center space-x-2 text-sm text-gray-700">
                                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  <span>
                                    {match.agentInfo.timezone.timezoneName} ({match.agentInfo.timezone.gmtDisplay})
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {match.agentInfo?.languages?.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {match.agentInfo.languages.map((lang: { language: string; proficiency?: string }, i: number) => {
                                const languageName = getLanguageNameByCode(lang.language);
                                return (
                                  <span key={i} className="px-2 py-1 rounded text-xs bg-blue-50 text-blue-800 border border-blue-200">
                                    {languageName}
                                    {lang.proficiency && ` (${lang.proficiency})`}
                                  </span>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="text-gray-400 text-sm">No languages specified</div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {match.skillsMatch?.details?.matchingSkills?.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {match.skillsMatch.details.matchingSkills.slice(0, 3).map((skill: { skill: string; skillName: string; type: string }, i: number) => {
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
                                  <span key={i} className={`px-2 py-1 rounded text-xs ${bgColor} ${textColor} border ${borderColor}`}>
                                    {skillName}
                                  </span>
                                );
                              })}
                              {match.skillsMatch.details.matchingSkills.length > 3 && (
                                <span className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-600 border border-gray-200">
                                  +{match.skillsMatch.details.matchingSkills.length - 3} more
                                </span>
                              )}
                            </div>
                          ) : (
                            <div className="text-gray-400 text-sm">No matching skills</div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {match.experienceMatch ? (
                            <div className="flex flex-col gap-1">
                              <div className="text-sm font-medium text-gray-900">
                                {match.experienceMatch.details.agentExperience} years
                              </div>
                              <div className="text-xs text-gray-600">
                                Required: {match.experienceMatch.details.gigRequiredExperience} years
                              </div>
                              <div className="text-xs text-orange-600">
                                Score: {Math.round(match.experienceMatch.score * 100)}%
                              </div>
                            </div>
                          ) : (
                            <div className="text-gray-400 text-sm">No experience data</div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="w-16 bg-gray-200 rounded-full h-2 mr-3">
                              <div 
                                className="bg-orange-600 h-2 rounded-full" 
                                style={{ width: `${match.overallScore * 100}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium text-gray-900">
                              {Math.round(match.overallScore * 100)}%
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          {(() => {
                            const isInvited = match.isInvited !== undefined ? match.isInvited : invitedAgents.has(match.agentId);
                            return isInvited ? (
                              <div className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg shadow-md font-semibold text-base gap-2">
                                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                                Invited
                              </div>
                            ) : (
                              <button
                                className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg shadow-md hover:from-orange-600 hover:to-red-700 transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow-lg font-semibold text-base gap-2 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={() => handleCreateGigAgent(match)}
                                disabled={creatingGigAgent}
                                title={`Invite ${match.agentInfo?.name} to ${selectedGig?.title}`}
                              >
                                <Zap className="w-5 h-5 mr-1 animate-pulse" />
                                {creatingGigAgent ? 'Inviting...' : 'Invite'}
                              </button>
                            );
                          })()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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