import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../lib/supabaseAdmin';

// Extend Express Request interface to include the user
export interface AuthenticatedRequest extends Request {
  user?: any;
}

export const verifyToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid Authorization header' });
    }

    const token = authHeader.split(' ')[1];
    
    // Verify the JWT with Supabase
    const { data, error } = await supabaseAdmin.auth.getUser(token);
    
    if (error || !data.user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Attach user to request
    req.user = data.user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Internal server error during authentication' });
  }
};
