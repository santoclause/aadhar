import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Vote, CheckCircle, Clock, Users, Award } from 'lucide-react';

interface Election {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  constituency: string;
}

interface Candidate {
  id: string;
  name: string;
  party: string;
  symbol: string;
  description: string;
  voteCount: number;
}

export default function VotingInterface() {
  const { user } = useAuth();
  const [elections, setElections] = useState<Election[]>([]);
  const [selectedElection, setSelectedElection] = useState<string>('');
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [voting, setVoting] = useState(false);
  const [voteSuccess, setVoteSuccess] = useState(false);

  useEffect(() => {
    fetchElections();
  }, []);

  useEffect(() => {
    if (selectedElection) {
      fetchCandidates(selectedElection);
    }
  }, [selectedElection]);

  const fetchElections = async () => {
    try {
      const response = await fetch('/api/voting/elections');
      const data = await response.json();
      if (data.success) {
        setElections(data.data);
        if (data.data.length > 0) {
          setSelectedElection(data.data[0].id);
        }
      }
    } catch (error) {
      console.error('Failed to fetch elections:', error);
    }
  };

  const fetchCandidates = async (electionId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/voting/elections/${electionId}/candidates`);
      const data = await response.json();
      if (data.success) {
        setCandidates(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch candidates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async () => {
    if (!selectedCandidate || !selectedElection) return;

    setVoting(true);
    try {
      const response = await fetch('/api/voting/vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          candidateId: selectedCandidate,
          electionId: selectedElection,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setVoteSuccess(true);
        // Refresh user data to update voting status
        window.location.reload();
      } else {
        alert(data.error || 'Failed to cast vote');
      }
    } catch (error) {
      console.error('Vote casting error:', error);
      alert('An error occurred while casting your vote');
    } finally {
      setVoting(false);
    }
  };

  if (user?.hasVoted) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Vote Successfully Cast!</h2>
        <p className="text-gray-600 mb-6">
          Thank you for participating in the democratic process. Your vote has been recorded securely.
        </p>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-700 font-semibold">
            Your vote is protected by blockchain technology and cannot be changed or duplicated.
          </p>
        </div>
      </div>
    );
  }

  if (voteSuccess) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Vote Cast Successfully!</h2>
        <p className="text-gray-600 mb-6">
          Your vote has been recorded and secured using blockchain technology.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Continue
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Election Selection */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Active Elections</h2>
        
        {elections.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No active elections at this time</p>
          </div>
        ) : (
          <div className="space-y-4">
            {elections.map((election) => (
              <div
                key={election.id}
                onClick={() => setSelectedElection(election.id)}
                className={`
                  p-4 rounded-lg border-2 cursor-pointer transition-all duration-200
                  ${selectedElection === election.id 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                  }
                `}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{election.title}</h3>
                    <p className="text-gray-600">{election.description}</p>
                    <p className="text-sm text-gray-500">Constituency: {election.constituency}</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Active
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Candidates */}
      {selectedElection && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Select Your Candidate</h2>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading candidates...</p>
            </div>
          ) : candidates.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No candidates available for this election</p>
            </div>
          ) : (
            <div className="space-y-4">
              {candidates.map((candidate) => (
                <div
                  key={candidate.id}
                  onClick={() => setSelectedCandidate(candidate.id)}
                  className={`
                    p-6 rounded-xl border-2 cursor-pointer transition-all duration-200
                    ${selectedCandidate === candidate.id 
                      ? 'border-blue-500 bg-blue-50 shadow-md' 
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                    }
                  `}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                        <Award className="w-6 h-6 text-gray-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">{candidate.name}</h3>
                        <p className="text-gray-600">{candidate.party}</p>
                        <p className="text-sm text-gray-500">Symbol: {candidate.symbol}</p>
                        {candidate.description && (
                          <p className="text-sm text-gray-600 mt-2">{candidate.description}</p>
                        )}
                      </div>
                    </div>
                    
                    {selectedCandidate === candidate.id && (
                      <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Vote Button */}
      {selectedCandidate && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Confirm Your Vote</h3>
            <p className="text-gray-600 mb-6">
              You have selected: <strong>{candidates.find(c => c.id === selectedCandidate)?.name}</strong>
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Once you cast your vote, it cannot be changed. Please confirm your selection.
            </p>
            
            <button
              onClick={handleVote}
              disabled={voting}
              className="bg-green-600 text-white px-8 py-4 rounded-lg hover:bg-green-700 transition-colors font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mx-auto"
            >
              {voting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  Casting Vote...
                </>
              ) : (
                <>
                  <Vote className="w-5 h-5 mr-3" />
                  Cast My Vote
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}