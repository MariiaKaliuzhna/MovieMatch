import { Router, Response } from 'express';
import { pool } from '../db';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/favorites
router.get('/', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const result = await pool.query(
      `SELECT m.movieid, m.title, m.poster_path, m.release_date, m.genres,
              r.rating as user_rating, f.added_at
       FROM favorites f
       JOIN movies m ON f.movieid = m.movieid
       LEFT JOIN ratings r ON m.movieid = r.movieid AND r.userid = $1
       WHERE f.userid = $1
       ORDER BY f.added_at DESC`,
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
