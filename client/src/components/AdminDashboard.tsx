import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLocation } from 'wouter';
import { 
  BarChart3, 
  Users, 
  Vote, 
  TrendingUp, 
  Calendar,
  Settings,
  LogOut,
  Plus,
  Eye,
  Play,
  Pause
} from 'lucide-react';

interface DashboardStats {
  totalVoters: number;
  totalVotes: number;
  turnoutPercentage: number;
  activeElections: number;
  recentVotes: any[];
  elections: any[];
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

export default function AdminDashboard() {
  const { admin, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [elections, setElections] = useState<Election[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    fetchElections();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/admin/dashboard');
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchElections = async () => {
    try {
      const response = await fetch('/api/admin/elections');
      const data = await response.json();
      if (data.success) {
        setElections(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch elections:', error);
    }
  };

  const toggleElectionStatus = async (electionId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/elections/${electionId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      const data = await response.json();
      if (data.success) {
        fetchElections();
        fetchDashboardData();
      }
    } catch (error) {
      console.error('Failed to toggle election status:', error);
    }
  };

  const handleLogout = async () => {
    await logout();
    setLocation('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Welcome back,</p>
                <p className="font-semibold text-gray-900">{admin?.name}</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
              { id: 'elections', label: 'Elections', icon: Calendar },
              { id: 'voters', label: 'Voters', icon: Users },
            ].map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center px-4 py-2 rounded-lg font-medium transition-colors
                    ${activeTab === tab.id 
                      ? 'bg-green-100 text-green-700' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }
                  `}
                >
                  <IconComponent className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && stats && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Voters</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.totalVoters.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Vote className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Votes Cast</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.totalVotes.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <TrendingUp className="h-8 w-8 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Turnout</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.turnoutPercentage}%</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Calendar className="h-8 w-8 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Active Elections</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.activeElections}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Recent Votes</h3>
              </div>
              <div className="p-6">
                {stats.recentVotes.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No votes cast yet</p>
                ) : (
                  <div className="space-y-4">
                    {stats.recentVotes.map((vote, index) => (
                      <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                        <div>
                          <p className="font-medium text-gray-900">{vote.candidateName}</p>
                          <p className="text-sm text-gray-600">{vote.candidateParty} • {vote.electionTitle}</p>
                        </div>
                        <p className="text-sm text-gray-500">
                          {new Date(vote.timestamp).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Elections Tab */}
        {activeTab === 'elections' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Elections Management</h2>
              <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center">
                <Plus className="w-4 h-4 mr-2" />
                New Election
              </button>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">All Elections</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {elections.map((election) => (
                  <div key={election.id} className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-gray-900">{election.title}</h4>
                        <p className="text-gray-600 mt-1">{election.description}</p>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                          <span>Constituency: {election.constituency}</span>
                          <span>•</span>
                          <span>Start: {new Date(election.startDate).toLocaleDateString()}</span>
                          <span>•</span>
                          <span>End: {new Date(election.endDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <span className={`
                          px-3 py-1 rounded-full text-xs font-medium
                          ${election.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                          }
                        `}>
                          {election.isActive ? 'Active' : 'Inactive'}
                        </span>
                        
                        <button
                          onClick={() => toggleElectionStatus(election.id, election.isActive)}
                          className={`
                            p-2 rounded-lg transition-colors
                            ${election.isActive 
                              ? 'text-red-600 hover:bg-red-50' 
                              : 'text-green-600 hover:bg-green-50'
                            }
                          `}
                          title={election.isActive ? 'Deactivate Election' : 'Activate Election'}
                        >
                          {election.isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </button>
                        
                        <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Voters Tab */}
        {activeTab === 'voters' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Registered Voters</h2>
            </div>

            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Voter Statistics</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-blue-600">{stats?.totalVoters || 0}</p>
                    <p className="text-gray-600">Total Registered</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-green-600">{stats?.totalVotes || 0}</p>
                    <p className="text-gray-600">Votes Cast</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-purple-600">{stats?.turnoutPercentage || 0}%</p>
                    <p className="text-gray-600">Turnout Rate</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}