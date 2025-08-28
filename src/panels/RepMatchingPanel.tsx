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

interface Rep {
  _id: string;
  personalInfo: {
    name: string;
    email: string;
  };
  photo?: string;
}

interface Gig {
  _id: string;
  title: string;
  companyName: string;
  category: string;
  seniority?: {
    yearsExperience: number;
  };
  expectedConversionRate?: number;
  targetRegion?: string;
}

function RepMatchingPanel() {
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [selectedGig, setSelectedGig] = useState<Gig | null>(null);
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showWeights, setShowWeights] = useState(false);
  const [weights, setWeights] = useState({
    experience: 0.20,
    skills: 0.20,
    industry: 0.15,
    languages: 0.15,
    availability: 0.10,
    timezone: 0.10,
    activities: 0.10,
    region: 0.10,
  });

  // Mock data for demonstration
  useEffect(() => {
    // Simulate fetching gigs
    const mockGigs: Gig[] = [
      {
        _id: '1',
        title: 'Senior Sales Representative',
        companyName: 'TechCorp Inc.',
        category: 'Sales',
        seniority: { yearsExperience: 5 },
        expectedConversionRate: 0.15,
        targetRegion: 'North America'
      },
      {
        _id: '2',
        title: 'Marketing Specialist',
        companyName: 'Digital Solutions',
        category: 'Marketing',
        seniority: { yearsExperience: 3 },
        expectedConversionRate: 0.12,
        targetRegion: 'Europe'
      }
    ];
    setGigs(mockGigs);
  }, []);

  const handleGigSelect = (gig: Gig) => {
    setSelectedGig(gig);
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const mockMatches = [
        {
          agentId: '1',
          agentInfo: {
            name: 'John Doe',
            email: 'john@example.com',
            photo: null
          },
          overallScore: 0.85
        },
        {
          agentId: '2',
          agentInfo: {
            name: 'Jane Smith',
            email: 'jane@example.com',
            photo: null
          },
          overallScore: 0.78
        }
      ];
      setMatches(mockMatches);
      setLoading(false);
    }, 1000);
  };

  const handleWeightChange = (key: string, value: number) => {
    setWeights(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const resetWeights = () => {
    setWeights({
      experience: 0.20,
      skills: 0.20,
      industry: 0.15,
      languages: 0.15,
      availability: 0.10,
      timezone: 0.10,
      activities: 0.10,
      region: 0.10,
    });
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
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
              <span className="font-medium">Available Reps</span>
            </div>
            <div className="text-2xl font-bold">12</div>
            <div className="text-sm text-green-600">Online now</div>
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
              <span className="font-medium">Match Rate</span>
            </div>
            <div className="text-2xl font-bold">89%</div>
            <div className="text-sm text-blue-600">Average success</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Activity className="w-5 h-5 text-purple-600" />
              </div>
              <span className="font-medium">Total Matches</span>
            </div>
            <div className="text-2xl font-bold">234</div>
            <div className="text-sm text-purple-600">This week</div>
          </div>
        </div>

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
                      <th className="px-6 py-4 text-left text-xs font-bold text-orange-700 uppercase tracking-wider">Contact</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-orange-700 uppercase tracking-wider">Match Score</th>
                      <th className="px-6 py-4 text-center text-xs font-bold text-orange-700 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {matches.map((match, index) => (
                      <tr key={index} className="hover:bg-orange-50 transition-all duration-200">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-4">
                            {match.agentInfo?.photo ? (
                              <img src={match.agentInfo.photo} alt="avatar" className="w-12 h-12 rounded-full border-2 border-orange-100 shadow-sm" />
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                                {match.agentInfo?.name?.[0] || "?"}
                              </div>
                            )}
                            <div>
                              <div className="font-bold text-gray-900">{match.agentInfo?.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-600">{match.agentInfo?.email}</div>
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
                          <button className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg shadow-md hover:from-orange-600 hover:to-red-700 transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow-lg font-medium text-sm gap-2">
                            <Zap className="w-4 h-4" />
                            Invite
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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