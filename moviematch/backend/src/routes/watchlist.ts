import { Router, Response } from 'express';
import { pool } from '../db';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/watchlist
router.get('/', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userid = req.userId;
    const result = await pool.query(
      `SELECT m.movieid, m.title, m.poster_path, m.release_date, m.genres,
              r.rating as user_rating, w.added_at
       FROM watchlist w
       JOIN movies m ON w.movieid = m.movieid
       LEFT JOIN ratings r ON m.movieid = r.movieid AND r.userid = $1
       WHERE w.userid = $1
       ORDER BY w.added_at DESC`,
      [userid]
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
    const userid = req.userId;
    const { movieid } = req.body; // Тут усе вірно, movieid з маленької

    if (!movieid) {
      res.status(400).json({ error: 'movieid is required' });
      return;
    }
    await pool.query(
      `INSERT INTO watchlist (userid, movieid, added_at) VALUES ($1, $2, NOW())
       ON CONFLICT (userid, movieid) DO NOTHING`,
      [userid, movieid]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/watchlist/:movieid
// УВАГА: Змінив :movieId на :movieid, щоб назва параметра збігалася з деструктуризацією нижче
router.delete('/:movieid', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userid = req.userId;
    // БУЛО: const { movieid } = req.params; (але в роуті було :movieId)
    // ТРЕБА: назва в { } має бути ідентичною тій, що в рядку роута вище
    const { movieid } = req.params; 
    
    await pool.query('DELETE FROM watchlist WHERE userid = $1 AND movieid = $2', [userid, movieid]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;