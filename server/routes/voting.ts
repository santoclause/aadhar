import express from 'express';
import { db } from '../database.js';
import { elections, candidates, votes, users } from '../../shared/schema.js';
import { eq, and, desc } from 'drizzle-orm';
import { voteSchema } from '../../shared/schema.js';

const router = express.Router();

// Middleware to check if user is authenticated
const requireAuth = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required'
    });
  }
  next();
};

// Get active elections
router.get('/elections', async (req, res) => {
  try {
    const activeElections = await db.select().from(elections).where(eq(elections.isActive, true));
    
    res.json({
      success: true,
      data: activeElections
    });
  } catch (error) {
    console.error('Get elections error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch elections'
    });
  }
});

// Get candidates for an election
router.get('/elections/:electionId/candidates', async (req, res) => {
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

// Cast vote
router.post('/vote', requireAuth, async (req, res) => {
  try {
    const validatedData = voteSchema.parse(req.body);
    const userId = req.session.userId;
    
    // Check if user has already voted
    const user = await db.select().from(users).where(eq(users.id, userId));
    if (user[0].hasVoted) {
      return res.status(400).json({
        success: false,
        error: 'You have already cast your vote'
      });
    }

    // Check if election is active
    const election = await db.select().from(elections).where(eq(elections.id, validatedData.electionId));
    if (!election[0] || !election[0].isActive) {
      return res.status(400).json({
        success: false,
        error: 'Election is not active'
      });
    }

    // Check if candidate exists
    const candidate = await db.select().from(candidates).where(eq(candidates.id, validatedData.candidateId));
    if (!candidate[0]) {
      return res.status(400).json({
        success: false,
        error: 'Invalid candidate'
      });
    }

    // Record the vote
    const newVote = await db.insert(votes).values({
      userId,
      candidateId: validatedData.candidateId,
      electionId: validatedData.electionId,
      blockchainHash: `hash_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    }).returning();

    // Update user's voting status
    await db.update(users)
      .set({ hasVoted: true, updatedAt: new Date() })
      .where(eq(users.id, userId));

    // Update candidate's vote count
    await db.update(candidates)
      .set({ voteCount: candidate[0].voteCount + 1 })
      .where(eq(candidates.id, validatedData.candidateId));

    res.json({
      success: true,
      data: {
        vote: newVote[0],
        message: 'Vote cast successfully'
      }
    });
  } catch (error) {
    console.error('Vote casting error:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to cast vote'
    });
  }
});

// Get voting history (for user)
router.get('/my-votes', requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId;
    
    const userVotes = await db.select({
      id: votes.id,
      timestamp: votes.timestamp,
      blockchainHash: votes.blockchainHash,
      candidateName: candidates.name,
      candidateParty: candidates.party,
      electionTitle: elections.title,
    })
    .from(votes)
    .leftJoin(candidates, eq(votes.candidateId, candidates.id))
    .leftJoin(elections, eq(votes.electionId, elections.id))
    .where(eq(votes.userId, userId))
    .orderBy(desc(votes.timestamp));
    
    res.json({
      success: true,
      data: userVotes
    });
  } catch (error) {
    console.error('Get user votes error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch voting history'
    });
  }
});

export default router;