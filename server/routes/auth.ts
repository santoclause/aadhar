import express from 'express';
import { db } from '../database.js';
import { users, admins } from '../../shared/schema.js';
import { eq } from 'drizzle-orm';
import { aadharVerificationSchema, adminLoginSchema } from '../../shared/schema.js';

const router = express.Router();

// Aadhar verification endpoint
router.post('/verify-aadhar', async (req, res) => {
  try {
    const validatedData = aadharVerificationSchema.parse(req.body);
    
    // Check if user already exists
    const existingUser = await db.select().from(users).where(eq(users.aadharNumber, validatedData.aadharNumber));
    
    if (existingUser.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'User with this Aadhar number already registered'
      });
    }

    // Calculate age
    const birthDate = new Date(validatedData.dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    if (age < 18) {
      return res.status(400).json({
        success: false,
        error: 'You must be at least 18 years old to register for voting'
      });
    }

    // Create new user
    const newUser = await db.insert(users).values({
      email: `${validatedData.aadharNumber}@voter.gov.in`,
      name: validatedData.name,
      aadharNumber: validatedData.aadharNumber,
      dateOfBirth: validatedData.dateOfBirth,
      address: validatedData.address,
      phoneNumber: validatedData.phoneNumber,
      isVerified: true,
    }).returning();

    // Store user in session
    req.session.userId = newUser[0].id;
    req.session.userType = 'voter';

    res.json({
      success: true,
      data: {
        user: newUser[0],
        message: 'Aadhar verification successful. You are now registered to vote.'
      }
    });
  } catch (error) {
    console.error('Aadhar verification error:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Aadhar verification failed'
    });
  }
});

// Admin login endpoint
router.post('/admin-login', async (req, res) => {
  try {
    const validatedData = adminLoginSchema.parse(req.body);
    
    const admin = await db.select().from(admins).where(eq(admins.email, validatedData.email));
    
    if (admin.length === 0 || admin[0].passwordHash !== validatedData.password) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    // Store admin in session
    req.session.adminId = admin[0].id;
    req.session.userType = 'admin';

    res.json({
      success: true,
      data: {
        admin: admin[0],
        message: 'Admin login successful'
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Login failed'
    });
  }
});

// Logout endpoint
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        error: 'Logout failed'
      });
    }
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  });
});

// Check authentication status
router.get('/status', async (req, res) => {
  try {
    if (req.session.userId) {
      const user = await db.select().from(users).where(eq(users.id, req.session.userId));
      return res.json({
        success: true,
        data: {
          authenticated: true,
          userType: 'voter',
          user: user[0]
        }
      });
    }
    
    if (req.session.adminId) {
      const admin = await db.select().from(admins).where(eq(admins.id, req.session.adminId));
      return res.json({
        success: true,
        data: {
          authenticated: true,
          userType: 'admin',
          admin: admin[0]
        }
      });
    }

    res.json({
      success: true,
      data: {
        authenticated: false,
        userType: null
      }
    });
  } catch (error) {
    console.error('Auth status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check authentication status'
    });
  }
});

export default router;