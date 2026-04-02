import { Router, Response } from 'express';
import { pool } from '../db';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/movies - catalog with search, filter, sort
router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { search, genre, yearFrom, yearTo, sortBy, sortOrder } = req.query;
    const userId = req.headers['x-user-id'];

    let query = `
      SELECT m.movieid, m.tmdbid, m.title, m.overview, m.poster_path,
             m.release_date, m.genres,
             r.rating as user_rating
      FROM movies m
      LEFT JOIN ratings r ON m.movieid = r.movieid AND r.userid = $1
      WHERE 1=1
    `;
    const params: (string | number)[] = [userId ? Number(userId) : 0];
    let idx = 2;

    if (search) {
      query += ` AND LOWER(m.title) LIKE LOWER($${idx})`;
      params.push(`%${search}%`);
      idx++;
    }

    if (genre) {
      query += ` AND LOWER(m.genres) LIKE LOWER($${idx})`;
      params.push(`%${genre}%`);
      idx++;
    }

    if (yearFrom) {
      query += ` AND EXTRACT(YEAR FROM m.release_date) >= $${idx}`;
      params.push(Number(yearFrom));
      idx++;
    }

    if (yearTo) {
      query += ` AND EXTRACT(YEAR FROM m.release_date) <= $${idx}`;
      params.push(Number(yearTo));
      idx++;
    }

    const validSortFields: Record<string, string> = {
      title: 'm.title',
      release_date: 'm.release_date',
      rating: 'r.rating',
    };
    const sortField = validSortFields[sortBy as string] || 'm.title';
    const order = sortOrder === 'desc' ? 'DESC' : 'ASC';
    query += ` ORDER BY ${sortField} ${order} NULLS LAST`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/movies/:id - movie detail
router.get('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.headers['x-user-id'];

    const movieResult = await pool.query(
      `SELECT m.*, r.rating as user_rating, t.tag as user_tag
       FROM movies m
       LEFT JOIN ratings r ON m.movieid = r.movieid AND r.userid = $1
       LEFT JOIN tags t ON m.movieid = t.movieid AND t.userid = $1
       WHERE m.movieid = $2`,
      [userId ? Number(userId) : 0, id]
    );

    if (movieResult.rows.length === 0) {
      res.status(404).json({ error: 'Movie not found' });
      return;
    }

    res.json(movieResult.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/movies/game/next - next unrated movie for game mode
router.get('/game/next', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;

    const result = await pool.query(
      `SELECT m.*
       FROM movies m
       WHERE m.movieid NOT IN (
         SELECT movieid FROM ratings WHERE userid = $1
       )
       AND m.movieid NOT IN (
         SELECT movieid FROM watchlist WHERE userid = $1
       )
       ORDER BY RANDOM()
       LIMIT 1`,
      [userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'No more movies to rate' });
      return;
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
