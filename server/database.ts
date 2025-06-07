import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '../shared/schema.js';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool, { schema });

// Initialize database with sample data
export async function initializeDatabase() {
  try {
    // Create sample election
    const sampleElection = await db.insert(schema.elections).values({
      title: 'General Election 2024',
      description: 'National General Election for Parliamentary Constituencies',
      startDate: new Date('2024-01-15T09:00:00Z'),
      endDate: new Date('2024-01-15T17:00:00Z'),
      isActive: true,
      constituency: 'Delhi Central',
    }).returning();

    // Create sample candidates
    const candidates = [
      {
        name: 'Rajesh Kumar',
        party: 'Indian National Congress',
        symbol: 'Hand',
        constituency: 'Delhi Central',
        description: 'Experienced leader with focus on education and healthcare',
        electionId: sampleElection[0].id,
      },
      {
        name: 'Priya Sharma',
        party: 'Bharatiya Janata Party',
        symbol: 'Lotus',
        constituency: 'Delhi Central',
        description: 'Young leader committed to digital transformation',
        electionId: sampleElection[0].id,
      },
      {
        name: 'Amit Singh',
        party: 'Aam Aadmi Party',
        symbol: 'Broom',
        constituency: 'Delhi Central',
        description: 'Anti-corruption activist and social reformer',
        electionId: sampleElection[0].id,
      },
    ];

    await db.insert(schema.candidates).values(candidates);

    // Create sample admin
    await db.insert(schema.admins).values({
      email: 'admin@voting.gov.in',
      name: 'Election Officer',
      passwordHash: 'admin123', // In production, this should be properly hashed
      role: 'super_admin',
    });

    console.log('Database initialized with sample data');
  } catch (error) {
    console.log('Database already initialized or error:', error);
  }
}