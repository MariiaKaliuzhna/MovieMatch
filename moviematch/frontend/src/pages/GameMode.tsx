import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import api from '../api';

interface Movie {
  movieid: number; title: string; overview: string;
  poster_path: string; release_date: string; genres: string;
}

export default function GameMode() {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState<number | null>(null);
  const [tag, setTag] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) navigate('/login');
  }, [isLoggedIn]);

  const loadNext = useCallback(async () => {
    setLoading(true);
    setRating(null);
    setTag('');
    try {
      const { data } = await api.get('/movies/game/next');
      setMovie(data);
    } catch {
      setMovie(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadNext(); }, [loadNext]);

  const handleNotSeen = () => loadNext();

  const handleWatchlist = async () => {
    if (!movie) return;
    try {
      await api.post('/watchlist', { movieid: movie.movieid });
      loadNext();
    } catch {
      showToast('Failed to add to watchlist');
    }
  };

  const handleSeen = async () => {
    if (!movie || !rating) return;
    setSubmitting(true);
    try {
      await api.post('/ratings', { movieid: movie.movieid, rating, tag: tag || undefined });
      loadNext();
    } catch {
      showToast('Failed to save rating');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="game-page">
      <h1 className="game-title">Game mode</h1>
      <div className="loading"><div className="spinner" /></div>
    </div>
  );

  if (!movie) return (
    <div className="game-page">
      <h1 className="game-title">Game mode</h1>
      <div className="empty-state">
        <p>You've gone through all the movies!</p>
        <button className="btn-primary" onClick={loadNext} style={{ marginTop: 16 }}>Try again</button>
      </div>
    </div>
  );

  const year = movie.release_date ? new Date(movie.release_date).toLocaleDateString('en-GB') : '—';
  const posterSrc = movie.poster_path
    ? (movie.poster_path.startsWith('http') ? movie.poster_path : `https://image.tmdb.org/t/p/w500${movie.poster_path}`)
    : null;

  return (
    <div className="game-page">
      <h1 className="game-title">Game mode</h1>

      <div className="game-layout">
        {/* Left actions */}
        <div className="game-actions">
          <button className="btn-primary" onClick={handleNotSeen} style={{ padding: '14px 24px', fontSize: 15 }}>
            Not seen
          </button>
          <button className="btn-primary" onClick={handleWatchlist} style={{ padding: '14px 24px', fontSize: 15 }}>
            Add to watchlist
          </button>
        </div>

        {/* Center: poster + info */}
        <div className="game-center">
          <div className="game-poster">
            {posterSrc ? <img src={posterSrc} alt={movie.title} /> : <span>No image</span>}
          </div>
          <div className="game-movie-title">{movie.title}</div>
          <div className="game-overview">{movie.overview}</div>
          <div style={{ fontSize: 14, color: 'var(--text-dark)', lineHeight: 1.8 }}>
            <p><strong>Genres: </strong>
            {movie.genres 
              ? (Array.isArray(movie.genres) 
              ? movie.genres.join(', ') 
              : String(movie.genres).replace(/[\[\]']/g, ''))
              : '—'
            }
            </p>
            <p><strong>Release date: </strong> {year}</p>
          </div>
        </div>

        {/* Right: seen + rating */}
        <div className="game-right">
          <button
            className="btn-primary"
            onClick={handleSeen}
            disabled={!rating || submitting}
            style={{ opacity: rating ? 1 : 0.45, padding: '14px 24px', fontSize: 15 }}
          >
            {submitting ? 'Saving…' : 'Seen'}
          </button>

          <div className="game-rating-btns">
            {[1,2,3,4,5].map(n => (
              <button
                key={n}
                className={`game-rating-btn${rating === n ? ' active' : ''}`}
                onClick={() => setRating(n)}
              >{n}</button>
            ))}
          </div>

          <input
            className="tag-input"
            placeholder="Add tag:"
            value={tag}
            onChange={e => setTag(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
