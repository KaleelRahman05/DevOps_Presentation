# CineScope CI/CD Demo

CineScope is a small, static React movie catalogue used to demonstrate a Jenkins CI/CD pipeline. The movie list is part of the frontend source code: there is no backend, database, login service, or runtime API.

## Tools

- React and Vite
- Jenkins Declarative Pipeline
- Docker and Docker Compose
- Nginx

## Run locally

Requirements: Node.js 18 or later and npm.

```powershell
npm --prefix frontend ci
npm run dev
```

Open <http://localhost:3000>.

Run the same checks used by Jenkins:

```powershell
npm test
npm run build
```

## Run with Docker

Start Docker Desktop, then run from the project root:

```powershell
docker compose up -d --build
```

Open <http://localhost:3000>. To stop the app:

```powershell
docker compose down
```

## Jenkins CI/CD

The root [`Jenkinsfile`](./Jenkinsfile) runs these stages on each detected change:

1. **Checkout** the repository.
2. **Install** locked frontend dependencies with `npm ci`.
3. **Test** the React app with Vitest.
4. **Build** the production frontend bundle with Vite.
5. **Deploy** the frontend container with `docker compose up -d --build frontend`.
6. **Smoke test** the running site over HTTP.

Tests and the production build must pass before deployment. Jenkins polls the configured SCM every five minutes (`H/5 * * * *`). A GitHub webhook can be configured in Jenkins instead.

### Configure the Jenkins job

1. Create a **Pipeline** job in Jenkins.
2. Under **Pipeline**, select **Pipeline script from SCM** and choose **Git**.
3. Set the repository URL, branch (for example, `*/main`), and script path `Jenkinsfile`.
4. Use a Jenkins agent with Git, Node.js/npm, Docker, and Docker Compose installed. The agent account must be allowed to access the Docker daemon.
5. Save and run **Build Now**.

The pipeline uses Windows `bat` and Unix `sh` steps as appropriate. Jenkins must be able to bind port 3000 on the agent for deployment and smoke testing.

## Project layout

```text
frontend/            React app, tests, Vite build, and Nginx container
scripts/smoke-test.js  HTTP check for the deployed app
docker-compose.yml   Single frontend service
Jenkinsfile          CI/CD pipeline
```
