import { useEffect, useMemo, useState } from 'react';
import { Clapperboard, Film, Moon, Search, Star, Sun } from 'lucide-react';

const movies = [
  {
    title: 'Inception',
    year: 2010,
    rating: 8.8,
    genre: 'Sci-Fi',
    image: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=800&q=85',
    color: '#534583',
  },
  {
    title: 'Interstellar',
    year: 2014,
    rating: 8.7,
    genre: 'Adventure',
    image: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=800&q=85',
    color: '#36506f',
  },
  {
    title: 'The Dark Knight',
    year: 2008,
    rating: 9.0,
    genre: 'Action',
    image: 'https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=800&q=85',
    color: '#343947',
  },
  {
    title: 'Spirited Away',
    year: 2001,
    rating: 8.6,
    genre: 'Animation',
    image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=85',
    color: '#557151',
  },
  {
    title: 'Parasite',
    year: 2019,
    rating: 8.5,
    genre: 'Thriller',
    image: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=800&q=85',
    color: '#796047',
  },
  {
    title: 'The Shawshank Redemption',
    year: 1994,
    rating: 9.3,
    genre: 'Drama',
    image: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&w=800&q=85',
    color: '#655a45',
  },
];

function App() {
  const [search, setSearch] = useState('');
  const [theme, setTheme] = useState(() =>
    localStorage.getItem('cinescope-theme') === 'light' ? 'light' : 'dark'
  );
  const visibleMovies = useMemo(
    () =>
      movies.filter((movie) =>
        `${movie.title} ${movie.genre}`.toLowerCase().includes(search.toLowerCase())
      ),
    [search]
  );

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('cinescope-theme', theme);
  }, [theme]);

  return (
    <main className="page-shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="CineScope home">
          <Film size={25} />
          <span>Cine<span className="brand-accent">Scope</span></span>
        </a>
        <div className="topbar-actions">
          <span className="topbar-label"><Clapperboard size={15} /> MOVIE NIGHT STARTS HERE</span>
          <button
            className="theme-toggle"
            type="button"
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            <span>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>
          </button>
        </div>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow"><span className="status-dot" /> YOUR CINEMATIC SHORTLIST</span>
          <h1>Great stories.<br /><span>One screen.</span></h1>
          <p>A small hand-picked collection of movies worth your time. Find your next favorite and press play.</p>
          <a className="primary-link" href="#catalog">Explore the collection <span aria-hidden="true">↓</span></a>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="art-orbit orbit-one" />
          <div className="art-orbit orbit-two" />
          <div className="art-disc"><Film size={78} strokeWidth={1.1} /></div>
          <span className="art-star star-one">✦</span>
          <span className="art-star star-two">✧</span>
          <span className="art-caption">A LITTLE LESS SCROLLING<br />A LOT MORE WATCHING</span>
        </div>
      </section>

      <section className="catalog" id="catalog">
        <div className="catalog-heading">
          <div>
            <span className="section-eyebrow">THE COLLECTION</span>
            <h2>Pick your next movie</h2>
          </div>
          <label className="search-box">
            <Search size={18} aria-hidden="true" />
            <input
              type="search"
              aria-label="Search movies"
              placeholder="Search titles or genres"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
        </div>

        {visibleMovies.length ? (
          <div className="movie-grid">
            {visibleMovies.map((movie) => (
              <article className="movie-card" key={movie.title}>
                <div className="poster" style={{ '--poster-color': movie.color }}>
                  <img src={movie.image} alt="" loading="lazy" />
                  <span className="rating"><Star size={14} fill="currentColor" /> {movie.rating}</span>
                  <span className="poster-index">{String(movies.indexOf(movie) + 1).padStart(2, '0')}</span>
                </div>
                <div className="movie-info">
                  <div className="movie-title-row">
                    <h3>{movie.title}</h3>
                    <span>{movie.year}</span>
                  </div>
                  <span className="genre">{movie.genre}</span>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="empty-state">No movies match “{search}”. Try another title or genre.</p>
        )}
      </section>

      <footer className="footer">
        <span><Film size={16} /> CineScope</span>
        <span>A simple static app, built and deployed automatically with Jenkins.</span>
      </footer>
    </main>
  );
}

export default App;
