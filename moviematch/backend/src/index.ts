import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/auth';
import moviesRoutes from './routes/movies';
import ratingsRoutes from './routes/ratings';
import watchlistRoutes from './routes/watchlist';
import favoritesRoutes from './routes/favorites';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/movies', moviesRoutes);
app.use('/api/ratings', ratingsRoutes);
app.use('/api/watchlist', watchlistRoutes);
app.use('/api/favorites', favoritesRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'MovieMatch API running' });
});

app.listen(PORT, () => {
  console.log(`MovieMatch server running on http://localhost:${PORT}`);
});
