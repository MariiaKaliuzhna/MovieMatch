import React, { useState, useEffect, useCallback } from 'react';
import MovieCard from '../components/MovieCard';
import searchIcon from '../assets/search-icon.png';
import api from '../api';

interface Movie {
  movieid: number; title: string; poster_path?: string;
  release_date?: string; genres?: string; user_rating?: number;
}

type SortBy = 'title' | 'release_date' | 'rating';
type SortOrder = 'asc' | 'desc';

export default function Catalog() {
  const [query, setQuery] = useState('');
  const [genre, setGenre] = useState('');
  const [yearFrom, setYearFrom] = useState('');
  const [yearTo, setYearTo] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('title');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);

  const search = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { sortBy, sortOrder };
      if (query) params.search = query;
      if (genre) params.genre = genre;
      if (yearFrom) params.yearFrom = yearFrom;
      if (yearTo) params.yearTo = yearTo;
      const { data } = await api.get('/movies', { params });
      setMovies(data);
    } catch {
      setMovies([]);
    } finally {
      setLoading(false);
    }
  }, [query, genre, yearFrom, yearTo, sortBy, sortOrder]);

  useEffect(() => { search(); }, []);

  const handleKey = (e: React.KeyboardEvent) => { if (e.key === 'Enter') search(); };

  return (
    <div className="catalog-layout">
      {/* Sidebar */}
      <aside className="catalog-sidebar">
        <div className="search-bar">
          <input
            placeholder="Search by title…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKey}
            style={{ paddingLeft: '20px' }}
          />
          <button className="btn-primary" onClick={search}>
            <img src = {searchIcon} alt= 'Search' />
          </button>
        </div>

        <div className="sidebar-label">Sort by:</div>
        <div className="sort-btns">
          <button
            className={`btn-outline${sortBy === 'title' ? ' active' : ''}`}
            onClick={() => { setSortBy('title'); setSortOrder('asc'); setOpenDropdown(null); }}
          >Title (A–Z)</button>

          <div style={{ position: 'relative' }}>
            <button
              className={`btn-outline${sortBy === 'release_date' ? ' active' : ''}`}
              onClick={() => setOpenDropdown(openDropdown === 'date' ? null : 'date')}
            >Release date ▾</button>
            {openDropdown === 'date' && (
              <div className="sort-dropdown">
                {(['desc','asc'] as SortOrder[]).map(o => (
                  <button
                    key={o}
                    className={sortBy === 'release_date' && sortOrder === o ? 'active' : ''}
                    onClick={() => { setSortBy('release_date'); setSortOrder(o); setOpenDropdown(null); }}
                  >{o === 'desc' ? 'Newest first' : 'Oldest first'}</button>
                ))}
              </div>
            )}
          </div>

          <div style={{ position: 'relative' }}>
            <button
              className={`btn-outline${sortBy === 'rating' ? ' active' : ''}`}
              onClick={() => setOpenDropdown(openDropdown === 'rating' ? null : 'rating')}
            >Rating ▾</button>
            {openDropdown === 'rating' && (
              <div className="sort-dropdown">
                {(['desc','asc'] as SortOrder[]).map(o => (
                  <button
                    key={o}
                    className={sortBy === 'rating' && sortOrder === o ? 'active' : ''}
                    onClick={() => { setSortBy('rating'); setSortOrder(o); setOpenDropdown(null); }}
                  >{o === 'desc' ? 'Highest first' : 'Lowest first'}</button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="sidebar-label" style={{ marginTop: 28 }}>Filter by:</div>
        <input
          className="filter-input"
          placeholder="Genre (e.g. Drama)"
          value={genre}
          onChange={e => setGenre(e.target.value)}
          onKeyDown={handleKey}
        />
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            className="filter-input"
            placeholder="Year from"
            value={yearFrom}
            onChange={e => setYearFrom(e.target.value)}
            onKeyDown={handleKey}
            style={{ flex: 1 }}
          />
          <input
            className="filter-input"
            placeholder="Year to"
            value={yearTo}
            onChange={e => setYearTo(e.target.value)}
            onKeyDown={handleKey}
            style={{ flex: 1 }}
          />
        </div>
      </aside>

      {/* Results */}
      <main className="catalog-content">
        {loading ? (
          <div className="loading"><div className="spinner" /></div>
        ) : movies.length === 0 ? (
          <div className="empty-state">No movies found. Try a different search.</div>
        ) : (
          <div className="cards-grid">
            {movies.map(m => <MovieCard key={m.movieid} movie={m} />)}
          </div>
        )}
      </main>
    </div>
  );
}
