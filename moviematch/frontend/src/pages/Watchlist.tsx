import React, { useEffect, useState } from 'react';
import MovieCard from '../components/MovieCard';
import { useToast } from '../components/Toast';
import api from '../api';

interface Movie {
  movieid: number; title: string; poster_path?: string;
  release_date?: string; genres?: string; user_rating?: number;
}

export default function Watchlist() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    api.get('/watchlist')
      .then(r => setMovies(r.data))
      .catch(() => showToast('Failed to load watchlist'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h2 className="page-title">Wants to watch</h2>
      {loading ? (
        <div className="loading"><div className="spinner" /></div>
      ) : movies.length === 0 ? (
        <div className="empty-state">Your watchlist is empty. Add movies in Game mode!</div>
      ) : (
        <div className="cards-grid">
          {movies.map(m => <MovieCard key={m.movieid} movie={m} />)}
        </div>
      )}
    </div>
  );
}
