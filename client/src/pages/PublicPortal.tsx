import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { ArrowLeft, Users, TrendingUp, Calendar, Award } from 'lucide-react';

interface ElectionResult {
  candidateId: string;
  candidateName: string;
  party: string;
  symbol: string;
  voteCount: number;
  percentage: number;
}

interface Election {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  constituency: string;
}

export default function PublicPortal() {
  const [, setLocation] = useLocation();
  const [elections, setElections] = useState<Election[]>([]);
  const [selectedElection, setSelectedElection] = useState<string>('');
  const [results, setResults] = useState<ElectionResult[]>([]);
  const [totalVotes, setTotalVotes] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchElections();
  }, []);

  const fetchElections = async () => {
    try {
      const response = await fetch('/api/voting/elections');
      const data = await response.json();
      if (data.success) {
        setElections(data.data);
        if (data.data.length > 0) {
          setSelectedElection(data.data[0].id);
          fetchResults(data.data[0].id);
        }
      }
    } catch (error) {
      console.error('Failed to fetch elections:', error);
    }
  };

  const fetchResults = async (electionId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/elections/${electionId}/results`);
      const data = await response.json();
      if (data.success) {
        setResults(data.data.results);
        setTotalVotes(data.data.totalVotes);
      }
    } catch (error) {
      console.error('Failed to fetch results:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleElectionChange = (electionId: string) => {
    setSelectedElection(electionId);
    fetchResults(electionId);
  };

  const selectedElectionData = elections.find(e => e.id === selectedElection);

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => setLocation('/')}
            className="flex items-center text-purple-600 hover:text-purple-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Home
          </button>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-800">Public Portal</h1>
            <p className="text-gray-600">Live election results and information</p>
          </div>
          
          <div className="w-24"></div> {/* Spacer for centering */}
        </div>

        {/* Election Selector */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Select Election</h2>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>Live Results</span>
            </div>
          </div>
          
          <select
            value={selectedElection}
            onChange={(e) => handleElectionChange(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            {elections.map((election) => (
              <option key={election.id} value={election.id}>
                {election.title} - {election.constituency}
              </option>
            ))}
          </select>
        </div>

        {selectedElectionData && (
          <>
            {/* Election Info */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mb-3">
                    <Users className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">Total Votes</h3>
                  <p className="text-2xl font-bold text-purple-600">{totalVotes.toLocaleString()}</p>
                </div>
                
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-3">
                    <TrendingUp className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">Candidates</h3>
                  <p className="text-2xl font-bold text-blue-600">{results.length}</p>
                </div>
                
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-3">
                    <Award className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">Constituency</h3>
                  <p className="text-lg font-semibold text-green-600">{selectedElectionData.constituency}</p>
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Election Results</h2>
                {loading && (
                  <div className="flex items-center space-x-2 text-gray-600">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                    <span className="text-sm">Updating...</span>
                  </div>
                )}
              </div>

              {results.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">No votes cast yet</h3>
                  <p className="text-gray-500">Results will appear here once voting begins</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {results.map((candidate, index) => (
                    <div
                      key={candidate.candidateId}
                      className={`
                        p-6 rounded-xl border-2 transition-all duration-300
                        ${index === 0 
                          ? 'border-yellow-300 bg-gradient-to-r from-yellow-50 to-orange-50' 
                          : 'border-gray-200 bg-gray-50'
                        }
                      `}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          {index === 0 && (
                            <div className="flex items-center justify-center w-8 h-8 bg-yellow-400 rounded-full">
                              <Award className="w-4 h-4 text-white" />
                            </div>
                          )}
                          <div>
                            <h3 className="text-xl font-bold text-gray-800">{candidate.candidateName}</h3>
                            <p className="text-gray-600">{candidate.party}</p>
                            <p className="text-sm text-gray-500">Symbol: {candidate.symbol}</p>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-3xl font-bold text-gray-800">{candidate.voteCount.toLocaleString()}</p>
                          <p className="text-lg font-semibold text-purple-600">{candidate.percentage}%</p>
                        </div>
                      </div>
                      
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full transition-all duration-500 ${
                            index === 0 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' : 'bg-purple-500'
                          }`}
                          style={{ width: `${candidate.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}