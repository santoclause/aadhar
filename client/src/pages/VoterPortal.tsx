import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLocation } from 'wouter';
import AadharVerification from '../components/AadharVerification';
import VotingInterface from '../components/VotingInterface';
import { ArrowLeft, User, CheckCircle, Clock } from 'lucide-react';

export default function VoterPortal() {
  const { user, isAuthenticated, userType, loading } = useAuth();
  const [, setLocation] = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || userType !== 'voter') {
    return (
      <div className="min-h-screen p-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center mb-8">
            <button
              onClick={() => setLocation('/')}
              className="flex items-center text-blue-600 hover:text-blue-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Home
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <User className="w-8 h-8 text-blue-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Voter Portal</h1>
              <p className="text-gray-600">
                Verify your identity to access the voting system
              </p>
            </div>

            <AadharVerification />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => setLocation('/')}
            className="flex items-center text-blue-600 hover:text-blue-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Home
          </button>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-gray-600">Welcome back,</p>
              <p className="font-semibold text-gray-800">{user?.name}</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Voter Status */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Voter Status</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Verification Status</p>
                <p className="font-semibold text-green-600">Verified</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {user?.hasVoted ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <Clock className="w-5 h-5 text-orange-500" />
              )}
              <div>
                <p className="text-sm text-gray-600">Voting Status</p>
                <p className={`font-semibold ${user?.hasVoted ? 'text-green-600' : 'text-orange-600'}`}>
                  {user?.hasVoted ? 'Vote Cast' : 'Pending'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <User className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Aadhar Number</p>
                <p className="font-semibold text-gray-800">
                  ****-****-{user?.aadharNumber?.slice(-4)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Voting Interface */}
        <VotingInterface />
      </div>
    </div>
  );
}