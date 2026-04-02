import { Router, Response } from 'express';
import { pool } from '../db';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/watchlist
router.get('/', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const result = await pool.query(
      `SELECT m.movieid, m.title, m.poster_path, m.release_date, m.genres,
              r.rating as user_rating, w.added_at
       FROM watchlist w
       JOIN movies m ON w.movieid = m.movieid
       LEFT JOIN ratings r ON m.movieid = r.movieid AND r.userid = $1
       WHERE w.userid = $1
       ORDER BY w.added_at DESC`,
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/watchlist
router.post('/', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const { movieId } = req.body;
    if (!movieId) {
      res.status(400).json({ error: 'movieId is required' });
      return;
    }
    await pool.query(
      `INSERT INTO watchlist (userid, movieid, added_at) VALUES ($1, $2, NOW())
       ON CONFLICT (userid, movieid) DO NOTHING`,
      [userId, movieId]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/watchlist/:movieId
router.delete('/:movieId', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const { movieId } = req.params;
    await pool.query('DELETE FROM watchlist WHERE userid = $1 AND movieid = $2', [userId, movieId]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
