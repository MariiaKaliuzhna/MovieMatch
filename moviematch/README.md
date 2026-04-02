# 🎬 MovieMatch

A full-stack movie rating & discovery app built with React (TypeScript) + Node.js/Express (TypeScript) + PostgreSQL.

---

## 📁 Project Structure

```
moviematch/
├── backend/          ← Node.js + Express + TypeScript API
│   ├── src/
│   │   ├── index.ts          ← Server entry point
│   │   ├── db.ts             ← PostgreSQL connection
│   │   ├── middleware/
│   │   │   └── auth.ts       ← JWT middleware
│   │   └── routes/
│   │       ├── auth.ts       ← /api/auth (login, register)
│   │       ├── movies.ts     ← /api/movies (catalog, detail, game)
│   │       ├── ratings.ts    ← /api/ratings (submit, history)
│   │       ├── watchlist.ts  ← /api/watchlist
│   │       └── favorites.ts  ← /api/favorites
│   ├── setup.sql             ← Database schema + sample data
│   └── .env.example          ← Environment variables template
└── frontend/         ← React + TypeScript SPA
    └── src/
        ├── App.tsx           ← Router + providers
        ├── api.ts            ← Axios instance
        ├── context/
        │   └── AuthContext.tsx
        ├── components/
        │   ├── Header.tsx
        │   ├── MovieCard.tsx
        │   └── Toast.tsx
        └── pages/
            ├── GameMode.tsx       ← Page 8: Game / swipe mode
            ├── Catalog.tsx        ← Page 2: Search & filter
            ├── MovieDetail.tsx    ← Page 1: Movie detail + rating
            ├── Favorites.tsx      ← Page 3: Favorite films
            ├── Watchlist.tsx      ← Page 4: Wants to watch
            ├── History.tsx        ← Page 5: Rating history
            ├── Login.tsx          ← Page 6: Login
            └── Register.tsx       ← Page 7: Register
```

---

## 🗄️ Database Changes Required

Your existing schema needs one addition — the **favorites** table:

```sql
CREATE TABLE IF NOT EXISTS favorites (
  id SERIAL PRIMARY KEY,
  userid INTEGER REFERENCES users(id) ON DELETE CASCADE,
  movieid INTEGER REFERENCES movies(movieid) ON DELETE CASCADE,
  added_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(userid, movieid)
);
```

Also add UNIQUE constraints for upserts:
```sql
ALTER TABLE ratings ADD CONSTRAINT ratings_user_movie UNIQUE (userid, movieid);
ALTER TABLE tags ADD CONSTRAINT tags_user_movie UNIQUE (userid, movieid);
ALTER TABLE watchlist ADD CONSTRAINT watchlist_user_movie UNIQUE (userid, movieid);
```

The full setup (including 15 sample movies) is in `backend/setup.sql`.

---

## 🚀 How to Run

### Prerequisites
- **Node.js** v18+ and **npm**
- **PostgreSQL** running locally

### 1. Set up the database

```bash
# Create the database
createdb movies_db

# Run the setup SQL (creates tables + adds sample movies)
psql -U postgres -d movies_db -f backend/setup.sql
```

### 2. Configure backend environment

```bash
cd backend
cp .env.example .env
```

Edit `.env`:
```
PORT=5000
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/movies_db
JWT_SECRET=any_long_random_string_here
```

### 3. Install & run the backend

```bash
cd backend
npm install
npm run dev
```

Backend will start at **http://localhost:5000**

### 4. Install & run the frontend

```bash
cd frontend
npm install
npm start
```

Frontend will start at **http://localhost:3000**

---

## 🎮 Pages & Features

| Page | Route | Description |
|------|-------|-------------|
| Game mode | `/game` | Swipe through unrated movies, rate or add to watchlist |
| Catalog | `/catalog` | Search, filter by genre/year, sort by title/date/rating |
| Movie detail | `/movie/:id` | Full info + submit/update rating |
| Favorites | `/favorites` | Movies rated 5 stars (auto-added) |
| Watchlist | `/watchlist` | Movies you want to watch |
| History | `/history` | All your rated movies |
| Login | `/login` | Email + password login |
| Register | `/register` | Create a new account |

### Key logic
- **Game mode**: Shows random unrated movies. "Not seen" → skip. "Add to watchlist" → saves & skips. Select rating (1–5) → "Seen" button activates → saves rating. Rating 5 → auto-adds to Favorites.
- **Catalog**: Search by title, filter by genre + year range, sort by title A–Z / release date / rating (asc or desc). Press Submit or Enter.
- **Movie detail**: Shows full movie info + current user's tag & score. Rating buttons 1–5; "Submit score" activates only after selecting a rating.

---

## 🎨 Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| Background | `#eef5f1` | Page background |
| Dark green | `#385a47` | Header, cards, active buttons |
| Text on dark | `#eef5f1` | Text over dark green |
| Text on light | `#284334` | Text on light background |

---

## 📦 API Endpoints

### Auth
- `POST /api/auth/register` — `{ email, password }` → `{ token, user }`
- `POST /api/auth/login` — `{ email, password }` → `{ token, user }`

### Movies
- `GET /api/movies` — query: `search, genre, yearFrom, yearTo, sortBy, sortOrder`
- `GET /api/movies/:id` — movie detail with user rating/tag
- `GET /api/movies/game/next` — next unrated movie (auth required)

### Ratings
- `POST /api/ratings` — `{ movieId, rating, tag? }` (auth required)
- `GET /api/ratings/history` — user's rating history (auth required)

### Watchlist
- `GET /api/watchlist` — user's watchlist (auth required)
- `POST /api/watchlist` — `{ movieId }` (auth required)
- `DELETE /api/watchlist/:movieId` (auth required)

### Favorites
- `GET /api/favorites` — user's favorites (auth required)
