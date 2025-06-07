import express from 'express';
import { db } from '../database.js';
import { elections, candidates, votes, users } from '../../shared/schema.js';
import { eq, count, desc } from 'drizzle-orm';
import { insertElectionSchema, insertCandidateSchema } from '../../shared/schema.js';

const router = express.Router();

// Middleware to check if admin is authenticated
const requireAdminAuth = (req, res, next) => {
  if (!req.session.adminId) {
    return res.status(401).json({
      success: false,
      error: 'Admin authentication required'
    });
  }
  next();
};

// Get dashboard statistics
router.get('/dashboard', requireAdminAuth, async (req, res) => {
  try {
    // Get total registered voters
    const totalVoters = await db.select({ count: count() }).from(users);
    
    // Get total votes cast
    const totalVotes = await db.select({ count: count() }).from(votes);
    
    // Get active elections
    const activeElections = await db.select().from(elections).where(eq(elections.isActive, true));
    
    // Get recent votes
    const recentVotes = await db.select({
      id: votes.id,
      timestamp: votes.timestamp,
      candidateName: candidates.name,
      candidateParty: candidates.party,
      electionTitle: elections.title,
    })
    .from(votes)
    .leftJoin(candidates, eq(votes.candidateId, candidates.id))
    .leftJoin(elections, eq(votes.electionId, elections.id))
    .orderBy(desc(votes.timestamp))
    .limit(10);

    const turnoutPercentage = totalVoters[0].count > 0 
      ? Math.round((totalVotes[0].count / totalVoters[0].count) * 100) 
      : 0;

    res.json({
      success: true,
      data: {
        totalVoters: totalVoters[0].count,
        totalVotes: totalVotes[0].count,
        turnoutPercentage,
        activeElections: activeElections.length,
        recentVotes,
        elections: activeElections,
      }
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard data'
    });
  }
});

// Get all elections
router.get('/elections', requireAdminAuth, async (req, res) => {
  try {
    const allElections = await db.select().from(elections).orderBy(desc(elections.createdAt));
    
    res.json({
      success: true,
      data: allElections
    });
  } catch (error) {
    console.error('Get elections error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch elections'
    });
  }
});

// Create new election
router.post('/elections', requireAdminAuth, async (req, res) => {
  try {
    const validatedData = insertElectionSchema.parse(req.body);
    
    const newElection = await db.insert(elections).values(validatedData).returning();
    
    res.json({
      success: true,
      data: {
        election: newElection[0],
        message: 'Election created successfully'
      }
    });
  } catch (error) {
    console.error('Create election error:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to create election'
    });
  }
});

// Update election status
router.patch('/elections/:id/status', requireAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    
    const updatedElection = await db.update(elections)
      .set({ isActive })
      .where(eq(elections.id, id))
      .returning();
    
    res.json({
      success: true,
      data: {
        election: updatedElection[0],
        message: `Election ${isActive ? 'activated' : 'deactivated'} successfully`
      }
    });
  } catch (error) {
    console.error('Update election status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update election status'
    });
  }
});

// Get candidates for an election
router.get('/elections/:electionId/candidates', requireAdminAuth, async (req, res) => {
  try {
    const { electionId } = req.params;
    
    const electionCandidates = await db.select()
      .from(candidates)
      .where(eq(candidates.electionId, electionId))
      .orderBy(candidates.name);
    
    res.json({
      success: true,
      data: electionCandidates
    });
  } catch (error) {
    console.error('Get candidates error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch candidates'
    });
  }
});

// Add candidate to election
router.post('/elections/:electionId/candidates', requireAdminAuth, async (req, res) => {
  try {
    const { electionId } = req.params;
    const candidateData = { ...req.body, electionId };
    
    const validatedData = insertCandidateSchema.parse(candidateData);
    
    const newCandidate = await db.insert(candidates).values(validatedData).returning();
    
    res.json({
      success: true,
      data: {
        candidate: newCandidate[0],
        message: 'Candidate added successfully'
      }
    });
  } catch (error) {
    console.error('Add candidate error:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to add candidate'
    });
  }
});

// Get election results
router.get('/elections/:electionId/results', requireAdminAuth, async (req, res) => {
  try {
    const { electionId } = req.params;
    
    const results = await db.select({
      candidateId: candidates.id,
      candidateName: candidates.name,
      party: candidates.party,
      symbol: candidates.symbol,
      voteCount: candidates.voteCount,
    })
    .from(candidates)
    .where(eq(candidates.electionId, electionId))
    .orderBy(desc(candidates.voteCount));

    // Calculate total votes and percentages
    const totalVotes = results.reduce((sum, candidate) => sum + candidate.voteCount, 0);
    
    const resultsWithPercentage = results.map(candidate => ({
      ...candidate,
      percentage: totalVotes > 0 ? Math.round((candidate.voteCount / totalVotes) * 100) : 0,
    }));

    res.json({
      success: true,
      data: {
        results: resultsWithPercentage,
        totalVotes,
        electionId,
      }
    });
  } catch (error) {
    console.error('Get results error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch election results'
    });
  }
});

// Get all registered voters
router.get('/voters', requireAdminAuth, async (req, res) => {
  try {
    const allVoters = await db.select({
      id: users.id,
      name: users.name,
      aadharNumber: users.aadharNumber,
      isVerified: users.isVerified,
      hasVoted: users.hasVoted,
      createdAt: users.createdAt,
    }).from(users).orderBy(desc(users.createdAt));
    
    res.json({
      success: true,
      data: allVoters
    });
  } catch (error) {
    console.error('Get voters error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch voters'
    });
  }
});

export default router;