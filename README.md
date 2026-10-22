# CineScope — Movie Discovery, Ratings & Reviews Platform with Jenkins CI/CD

> **Academic Project:** Full-Stack JavaScript Web Application with an Automated Continuous Integration & Continuous Deployment (CI/CD) Pipeline powered by Jenkins, Docker, and GitHub.

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Architecture & System Flow](#architecture--system-flow)
4. [Backend REST API Reference](#backend-rest-api-reference)
5. [Database Design & Seeding](#database-design--seeding)
6. [Local Windows Setup (Step-by-Step)](#local-windows-setup-step-by-step)
7. [Jenkins CI/CD Pipeline Configuration](#jenkins-cicd-pipeline-configuration)
8. [Automated Testing Guide](#automated-testing-guide)
9. [Troubleshooting Guide](#troubleshooting-guide)

---

## 1. Project Overview

**CineScope** is an IMDb-inspired movie discovery, ratings, and reviews web application built directly for demonstrating a real automated software delivery lifecycle.

### Key Capabilities
- **Discover & Filter:** Real-time search by title, director, and cast; filter by genre and release year; sort by rating, release date, and title.
- **Movie Details:** High-resolution backdrops, posters with designed error fallbacks, metadata (runtime, director, cast), synopsis, and community rating.
- **Dynamic Reviews & Rating Recalculation:** Authenticated or guest users submit reviews with 1–10 star ratings. The backend recalculates the average rating and review count at the database level and reflects it in the UI **without requiring an application rebuild or redeployment**.
- **Transparent Recommendations:** Content-based recommendation engine matching shared genres, ranked by genre overlap and rating with an explanatory tag (*"Because you liked Action & Sci-Fi"*).
- **Admin Dashboard:** Secure administrative dashboard protected by JWT authentication to create, edit, and delete movie titles and moderate reviews.
- **Robust CI/CD Pipeline:** Complete Jenkins declarative pipeline executing 8 stages from GitHub checkout to dependency installation, automated tests, production build, Docker containerization, deployment, and live HTTP smoke tests.

---

## 2. Technology Stack

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | React 18, Vite | High-performance SPA with client-side rendering (JavaScript & JSX, no TypeScript) |
| **Routing** | React Router v6 | Declarative client-side routing (`/`, `/movies/:id`, `/admin`, `/login`) |
| **Icons & Style** | Lucide React, CSS Variables | Dark cinematic UI (charcoal `#0b0c10`, ruby red `#e50914`, gold `#f5c518`) |
| **API Client** | Axios | Interceptors for Bearer JWT token injection and centralized error handling |
| **Backend** | Node.js, Express.js | ES Modules (`"type": "module"`), RESTful API architecture |
| **Database** | MongoDB 7, Mongoose 8 | Document database with compound indexes and schema-level validation |
| **Security** | Helmet, CORS, bcryptjs, JWT | Password hashing, signed authorization tokens, HTTP security headers |
| **Testing** | Vitest, Supertest, RTL | In-memory MongoDB testing (`mongodb-memory-server`), React Testing Library |
| **Containerization** | Docker, Docker Compose | Multi-stage Docker builds, named persistent volume for MongoDB |
| **CI/CD** | Jenkins | Declarative Pipeline (`Jenkinsfile`) with cross-platform (Windows/Linux) support |

---

## 3. Architecture & System Flow

```
                      +---------------------------------------+
                      |               GitHub                  |
                      |     (Source Code & Jenkinsfile)       |
                      +-------------------+-------------------+
                                          | Webhook / Polling
                                          v
+----------------------------------------------------------------------------------+
|                              JENKINS PIPELINE                                     |
|  [1. Checkout] -> [2. Install Dependencies] -> [3. Backend Tests]                |
|       |                                                                          |
|  [4. Frontend Validation & Build] -> [5. Docker Build] -> [6. Compose Deploy]    |
|       |                                                                          |
|  [7. Deployment Smoke Test] -> [8. Post-Build Reporting]                         |
+-----------------------------------------+----------------------------------------+
                                          | Deploys
                                          v
+----------------------------------------------------------------------------------+
|                            DOCKER HOST ENVIRONMENT                               |
|                                                                                  |
|   +-----------------------+     +------------------------+                       |
|   |   cinescope-frontend  |     |   cinescope-backend    |                       |
|   |    (Nginx: Port 3000) |---->|  (Express: Port 5000)  |                       |
|   +-----------------------+     +-----------+------------+                       |
|                                             | Mongoose                           |
|                                             v                                    |
|                                 +------------------------+                       |
|                                 |   cinescope-mongodb    |                       |
|                                 |     (Port 27017)       |                       |
|                                 +-----------+------------+                       |
|                                             | Persists                           |
|                                             v                                    |
|                                 [ cinescope-mongo-data ]                         |
|                                 (Named Persistent Volume)                        |
+----------------------------------------------------------------------------------+
```

---

## 4. Backend REST API Reference

Base URL: `http://localhost:5000/api`

### Healthcheck
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/health` | Service uptime and status check | No |

**Example Response:**
```json
{
  "status": "UP",
  "service": "cinescope-api",
  "uptime": 142,
  "timestamp": "2026-10-22T20:30:00.000Z",
  "version": "1.0.0",
  "environment": "production"
}
```

### Movies Endpoints
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/movies` | List movies (supports `search`, `genre`, `year`, `sort`, `page`, `limit`) | No |
| `GET` | `/movies/featured` | Retrieve featured & top-rated titles for hero section | No |
| `GET` | `/movies/:id` | Retrieve single movie by MongoDB ObjectId | No |
| `GET` | `/movies/:id/recommendations` | Get genre-matched similar movies (excludes target) | No |
| `POST` | `/movies` | Create a new movie title | **Admin Only** |
| `PUT` | `/movies/:id` | Update an existing movie title | **Admin Only** |
| `DELETE` | `/movies/:id` | Delete movie and its associated reviews | **Admin Only** |

**Sample Query: `GET /api/movies?genre=Sci-Fi&sort=rating_desc&page=1&limit=5`**
```json
{
  "success": true,
  "count": 5,
  "totalMovies": 8,
  "totalPages": 2,
  "currentPage": 1,
  "movies": [
    {
      "_id": "67b93c12001a4e6729000001",
      "title": "Interstellar",
      "releaseYear": 2014,
      "genres": ["Sci-Fi", "Adventure", "Drama"],
      "averageRating": 10.0,
      "reviewCount": 1,
      "posterUrl": "https://upload.wikimedia.org/wikipedia/en/b/bc/Interstellar_film_poster.jpg"
    }
  ]
}
```

**Admin Create Movie: `POST /api/movies`**
```json
{
  "title": "Gladiator II",
  "releaseYear": 2024,
  "genres": ["Action", "Adventure", "Drama"],
  "synopsis": "Years after witnessing the death of Maximus, Lucius enters the Colosseum.",
  "runtime": 148,
  "director": "Ridley Scott",
  "cast": ["Paul Mescal", "Pedro Pascal", "Denzel Washington"],
  "posterUrl": "https://upload.wikimedia.org/wikipedia/en/0/02/Gladiator_II_poster.jpg",
  "featured": true
}
```

### Reviews Endpoints
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/movies/:id/reviews` | List all reviews for a specific movie | No |
| `POST` | `/movies/:id/reviews` | Submit a review (1–10 rating, title, body) | No (Guest/Auth) |
| `DELETE` | `/reviews/:id` | Delete a review and recalculate movie stats | **Admin Only** |

**Submit Review: `POST /api/movies/:id/reviews`**
```json
{
  "reviewerName": "CinemaLover",
  "rating": 9,
  "reviewTitle": "Spectacular cinematography and music",
  "reviewText": "The sound design and Hans Zimmer score in IMAX were completely unforgettable."
}
```

**Response (Returns review + newly recalculated movie stats):**
```json
{
  "success": true,
  "message": "Review submitted successfully.",
  "review": {
    "_id": "67b93c89001a4e6729000045",
    "movieId": "67b93c12001a4e6729000001",
    "reviewerName": "CinemaLover",
    "rating": 9,
    "reviewTitle": "Spectacular cinematography and music",
    "reviewText": "The sound design and Hans Zimmer score in IMAX were completely unforgettable.",
    "createdAt": "2026-10-22T20:35:00.000Z"
  },
  "movieStats": {
    "averageRating": 9.5,
    "reviewCount": 2
  }
}
```

### Authentication Endpoints
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/login` | Sign in with email and password, returns JWT | No |
| `GET` | `/auth/me` | Fetch currently authenticated user profile | Bearer Token |
| `POST` | `/auth/logout` | Client session logout | No |

---

## 5. Database Design & Seeding

### Schema Definitions
- **Movie Schema**: `title`, `slug`, `posterUrl`, `backdropUrl`, `releaseYear`, `genres`, `synopsis`, `runtime`, `director`, `cast`, `averageRating`, `reviewCount`, `featured`, `createdAt`, `updatedAt`.
  - Indexes: Text index on `title`, `synopsis`, `director`; index on `averageRating`, `releaseYear`, `genres`.
- **Review Schema**: `movieId` (ref Movie), `reviewerName`, `userId` (optional ref User), `rating` (1–10 integer), `reviewTitle`, `reviewText`, `createdAt`.
  - Aggregation: Static Mongoose method `Review.calcAverageRating(movieId)` recalculates ratings upon every review creation or deletion.
- **User Schema**: `name`, `email` (unique), `password` (bcrypt hashed with salt rounds 10), `role` (`admin` or `user`).

### Idempotent Database Seeding
The project includes 14 richly populated movies (including *The Shawshank Redemption*, *Inception*, *The Dark Knight*, *Interstellar*, *Parasite*, *Spirited Away*, *Dune: Part Two*, *Oppenheimer*) with real reviews and the default admin account:
- Default Admin: `admin@cinescope.com` / `Admin@12345`
- The seeder uses an upsert check based on `title` and `releaseYear`. Running `npm run seed` repeatedly **never creates duplicates and never deletes user-created reviews**.

---

## 6. Local Windows Setup (Step-by-Step)

### Prerequisites Check in PowerShell
Open PowerShell as Administrator and verify installed tool versions:

```powershell
node -v
npm -v
git --version
docker --version
docker compose version
```

### Step 1: Clone or Navigate to the Workspace
```powershell
cd "c:\Users\KALEEL UR RAHMAN\OneDrive\Desktop\DevOps"
```

### Step 2: Configure Environment Variables
Copy the template `.env.example` into `.env`:

```powershell
Copy-Item .env.example .env
```

### Step 3: Run Automated Tests Locally
Ensure the test suites pass on your machine without needing external databases (powered by in-memory MongoDB):

```powershell
# Run backend tests (25 tests)
npm run test:backend

# Run frontend tests (3 tests)
npm run test:frontend

# Or run all 28 tests combined
npm run test
```

### Step 4: Verify Frontend Production Build
```powershell
npm run build:frontend
```

### Step 5: Start with Docker Compose
Ensure Docker Desktop is open and running on Windows, then execute:

```powershell
# Build and start MongoDB, Backend, and Frontend containers
docker compose up -d --build

# Inspect running containers
docker compose ps
```

### Step 6: Access the Application
- **Frontend Web UI:** [http://localhost:3000](http://localhost:3000)
- **Backend REST API:** [http://localhost:5000/api/movies](http://localhost:5000/api/movies)
- **Healthcheck URL:** [http://localhost:5000/api/health](http://localhost:5000/api/health)
- **Admin Portal:** Navigate to [http://localhost:3000/login](http://localhost:3000/login) and log in with `admin@cinescope.com` / `Admin@12345`.

---

## 7. Jenkins CI/CD Pipeline Configuration

### Architecture & Agent Requirements
The root `Jenkinsfile` runs on a Jenkins agent with:
- Git CLI installed and on PATH
- Node.js (v18+) and npm (v9+)
- Docker CLI and access to the Docker daemon (`docker.sock` on Linux or Docker Desktop named pipe on Windows)

### Configuring Jenkins on Windows
1. Open Jenkins in your browser (default: `http://localhost:8080`).
2. Click **New Item** &rarr; Enter Item Name `CineScope-Pipeline` &rarr; Select **Pipeline** &rarr; Click **OK**.
3. Under **Build Triggers**, select **GitHub hook trigger for GITScm polling** or check **Poll SCM** with schedule `H/5 * * * *` (polls GitHub every 5 minutes for local setups).
4. Under the **Pipeline** section:
   - **Definition:** Select *Pipeline script from SCM*
   - **SCM:** Select *Git*
   - **Repository URL:** Enter your GitHub repository URL (e.g., `https://github.com/<your-username>/cinescope.git`)
   - **Credentials:** Add your GitHub Personal Access Token (PAT) if the repository is private
   - **Branch Specifier:** `*/main`
   - **Script Path:** `Jenkinsfile`
5. Click **Save**.

### Jenkins Pipeline Stages Breakdown
```
Stage 1: Checkout              -> Pulls latest Git commit from branch
Stage 2: Install Dependencies -> Runs 'npm ci' in backend and frontend
Stage 3: Backend Tests         -> Runs isolated Vitest + Supertest suite (25 tests)
Stage 4: Frontend Validation   -> Runs RTL tests and executes 'npm run build'
Stage 5: Docker Build          -> Builds backend and frontend images tagged with ${BUILD_NUMBER}
Stage 6: Deploy                -> Executes 'docker compose up -d' without touching the database volume
Stage 7: Smoke Test            -> Runs 'scripts/smoke-test.js' to verify HTTP 200 on /health and /movies
Stage 8: Post-Build Reporting  -> Displays SUCCESS/FAILURE banner, archives logs, cleans temporary artifacts
```

> [!IMPORTANT]
> **Data Preservation Rule:** The pipeline explicitly executes:
> `docker compose up -d --no-deps --build backend frontend`
> It **never** executes `docker compose down -v`. Existing MongoDB data, movie records, and user-submitted reviews remain safe across deployments.

---

## 8. Automated Testing Guide

Execute tests directly in PowerShell:

```powershell
# Run backend tests only
cd backend
npm test

# Run frontend tests only
cd ../frontend
npm test

# Run smoke test against a running deployment
cd ..
node scripts/smoke-test.js
```

---

## 9. Troubleshooting Guide

### 1. Docker Desktop Daemon Not Running
**Symptom:** `failed to connect to the docker API at npipe:////./pipe/dockerDesktopLinuxEngine`  
**Resolution:** Launch **Docker Desktop** from the Windows Start menu. Wait until the whale icon in the Windows taskbar system tray changes from animated to solid green (*"Docker Desktop is running"*).

### 2. Occupied Ports
- Port 3000 (Frontend) or Port 5000 (Backend) or Port 27017 (MongoDB):
  ```powershell
  # Find PID using port 5000
  Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue | Select-Object OwningProcess
  # Stop the process if necessary
  Stop-Process -Id <PID> -Force
  ```

### 3. Database Connection Failure
**Symptom:** `[MongoDB] Connection error: connect ECONNREFUSED 127.0.0.1:27017`  
**Resolution:** Ensure the MongoDB Docker container is running:
```powershell
docker compose up -d mongodb
```

### 4. Jenkins Permission on Docker
On Windows, if the Jenkins service runs as `Local System`, it may not have access to the user's Docker Desktop named pipe. Run Jenkins under your Windows user account:
1. Open `services.msc` &rarr; Locate **Jenkins**.
2. Right click &rarr; **Properties** &rarr; **Log On** tab.
3. Select **This account** &rarr; Enter your Windows username and password &rarr; Click **OK** &rarr; Restart Jenkins.
