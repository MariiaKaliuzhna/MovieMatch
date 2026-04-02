import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import api from '../api';

interface Movie {
  movieid: number; title: string; overview: string;
  poster_path: string; release_date: string; genres: string;
  user_rating?: number; user_tag?: string;
}

export default function MovieDetail() {
  const { id } = useParams<{ id: string }>();
  const { isLoggedIn } = useAuth();
  const { showToast } = useToast();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.get(`/movies/${id}`)
      .then(r => {
        setMovie(r.data);
        if (r.data.user_rating) setSelectedRating(r.data.user_rating);
      })
      .catch(() => showToast('Failed to load movie'))
      .finally(() => setLoading(false));
  }, [id]);

  const submitScore = async () => {
    if (!selectedRating || !isLoggedIn) return;
    setSubmitting(true);
    try {
      await api.post('/ratings', { movieid: id, rating: selectedRating });
      showToast('Rating saved!', 'success');
      setMovie(m => m ? { ...m, user_rating: selectedRating! } : m);
    } catch {
      showToast('Failed to save rating');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading"><div className="spinner" /></div>;
  if (!movie) return <div className="empty-state">Movie not found</div>;

  const year = movie.release_date ? new Date(movie.release_date).toLocaleDateString('en-GB') : '—';
  const posterSrc = movie.poster_path
    ? (movie.poster_path.startsWith('http') ? movie.poster_path : `https://image.tmdb.org/t/p/w500${movie.poster_path}`)
    : null;

  return (
    <div className="movie-detail-page">
      <div className="movie-detail-layout">
        {/* LEFT: poster + rating */}
        <div className="movie-left">
          <div className="movie-poster">
            {posterSrc ? <img src={posterSrc} alt={movie.title} /> : <span>No image</span>}
          </div>

          {isLoggedIn && (
            <div className="movie-score-section">
              <div className="rating-btns">
                {[1,2,3,4,5].map(n => (
                  <button
                    key={n}
                    className={`rating-btn${selectedRating === n ? ' active' : ''}`}
                    onClick={() => setSelectedRating(n)}
                  >{n}</button>
                ))}
              </div>
              <button
                className="btn-primary"
                onClick={submitScore}
                disabled={!selectedRating || submitting}
                style={{ opacity: selectedRating ? 1 : 0.45 }}
              >
                {submitting ? 'Saving…' : 'Submit score'}
              </button>
            </div>
          )}
        </div>

        {/* RIGHT: info */}
        <div className="movie-info">
          <h1>{movie.title}</h1>
          <div className="movie-overview">{movie.overview}</div>
          <div className="movie-meta">
            <p><strong>Release date:</strong> {year}</p>
            <p><strong>Genres:</strong> {movie.genres || '—'}</p>
            <p><strong>User's tag:</strong> {movie.user_tag || '—'}</p>
            <p><strong>User's score:</strong> {movie.user_rating ?? '"no score"'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
