export interface User {
  id: string;
  email: string;
  name: string;
  aadharNumber: string;
  dateOfBirth: string;
  address: string;
  phoneNumber: string;
  isVerified: boolean;
  hasVoted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Candidate {
  id: string;
  name: string;
  party: string;
  symbol: string;
  constituency: string;
  description: string;
  imageUrl?: string;
  voteCount: number;
  createdAt: Date;
}

export interface Election {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  constituency: string;
  createdAt: Date;
}

export interface Vote {
  id: string;
  userId: string;
  candidateId: string;
  electionId: string;
  timestamp: Date;
  blockchainHash?: string;
}

export interface Admin {
  id: string;
  email: string;
  name: string;
  role: 'super_admin' | 'election_officer';
  createdAt: Date;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface VotingStats {
  totalVoters: number;
  totalVotes: number;
  turnoutPercentage: number;
  candidateResults: Array<{
    candidateId: string;
    candidateName: string;
    party: string;
    voteCount: number;
    percentage: number;
  }>;
}

export interface AadharVerificationRequest {
  aadharNumber: string;
  otp: string;
  name: string;
  dateOfBirth: string;
  address: string;
}

export interface SecurityChallenge {
  id: string;
  question: string;
  answer: string;
  type: 'math' | 'captcha';
}