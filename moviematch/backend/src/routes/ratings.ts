import { Router, Response } from 'express';
import { pool } from '../db';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// POST /api/ratings - submit or update rating
router.post('/', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const { movieId, rating, tag } = req.body;

    if (!movieId || !rating || rating < 1 || rating > 5) {
      res.status(400).json({ error: 'Valid movieId and rating (1-5) are required' });
      return;
    }

    // Upsert rating
    await pool.query(
      `INSERT INTO ratings (userid, movieid, rating, timestamp)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (userid, movieid)
       DO UPDATE SET rating = $3, timestamp = NOW()`,
      [userId, movieId, rating]
    );

    // Handle tag if provided
    if (tag && tag.trim()) {
      await pool.query(
        `INSERT INTO tags (movieid, userid, tag, timestamp)
         VALUES ($1, $2, $3, NOW())
         ON CONFLICT (userid, movieid)
         DO UPDATE SET tag = $3, timestamp = NOW()`,
        [movieId, userId, tag.trim()]
      );
    }

    // Auto-add to favorites if rating = 5
    if (rating === 5) {
      await pool.query(
        `INSERT INTO favorites (userid, movieid, added_at)
         VALUES ($1, $2, NOW())
         ON CONFLICT (userid, movieid) DO NOTHING`,
        [userId, movieId]
      );
    } else {
      // Remove from favorites if rating changed from 5
      await pool.query(
        `DELETE FROM favorites WHERE userid = $1 AND movieid = $2`,
        [userId, movieId]
      );
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/ratings/history - user's rating history
router.get('/history', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;

    const result = await pool.query(
      `SELECT m.movieid, m.title, m.poster_path, m.release_date, m.genres,
              r.rating as user_rating, r.timestamp
       FROM ratings r
       JOIN movies m ON r.movieid = m.movieid
       WHERE r.userid = $1
       ORDER BY r.timestamp DESC`,
      [userId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
