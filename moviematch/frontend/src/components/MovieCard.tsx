import { Link } from 'react-router-dom';

interface Movie {
  movieid: number;
  title: string;
  poster_path?: string;
  release_date?: string;
  genres?: string;
  user_rating?: number;
}

export default function MovieCard({ movie }: { movie: Movie }) {
  const year = movie.release_date ? new Date(movie.release_date).getFullYear() : '—';

  return (
    <Link to={`/movie/${movie.movieid}`} className="movie-card">
      <div className="movie-card-image">
        {movie.poster_path ? (
          <img
            src={movie.poster_path.startsWith('http') ? movie.poster_path : `https://image.tmdb.org/t/p/w500${movie.poster_path}`}
            alt={movie.title}
            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        ) : (
          <span>No image</span>
        )}
      </div>
      <div className="movie-card-info">
        <div className="movie-card-title">{movie.title}</div>
        <div className="movie-card-meta">
          {movie.genres && (
            <div className="meta-item">
              <span className="meta-label">Genres: </span> 
              <span className="meta-value">
                {Array.isArray(movie.genres) ? movie.genres.join(', ') : String(movie.genres).replace(/[\[\]']/g, '')}
              </span>
            </div>
          )}
        <div className="meta-item">
          <span className="meta-label">Release:</span> 
          <span className="meta-value">{year}</span>
        </div>
        <div className="meta-item">
          <span className="meta-label">Rating:</span> 
          <span className="meta-value">{movie.user_rating ?? 'no score'}</span>
        </div>
        </div>
      </div>
    </Link>
  );
}
