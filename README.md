# CineScope CI/CD Demo

CineScope is a small, static React movie catalogue used to demonstrate a Jenkins CI/CD pipeline. The movie list is part of the frontend source code: there is no backend, database, login service, or runtime API.

## Tools

- React and Vite
- Jenkins Declarative Pipeline
- Vercel CLI
- Docker and Docker Compose (optional local container run)
- Nginx (Docker deployment)

## Run locally

Requirements: Node.js 20 or later and npm.

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

## Jenkins CI/CD and Vercel deployment

The root [`Jenkinsfile`](./Jenkinsfile) runs these stages on each detected change:

1. **Checkout** the repository.
2. **Install** locked frontend dependencies with `npm ci`.
3. **Test** the React app with Vitest.
4. **Build** the production frontend bundle with Vite.
5. **Deploy** the production build to Vercel.
6. **Smoke test** the public site over HTTP.

Tests and the Vercel production build must pass before deployment. The Jenkins job includes a `DEMO_TEST_FAILURE` boolean parameter, enabled by default, which adds a deliberate failing Vitest check to demonstrate the failed Test stage; disable it when you want a successful build to continue to deployment. Jenkins reports the failure in the build status and points to the failed-stage console log. Jenkins polls the configured SCM every five minutes (`H/5 * * * *`). A GitHub webhook can be configured in Jenkins instead. The Jenkins agent needs internet access and Node.js/npm; Docker is not required for this hosted deployment.

### Configure the Jenkins job

1. Create a **Pipeline** job in Jenkins.
2. Under **Pipeline**, select **Pipeline script from SCM** and choose **Git**.
3. Set the repository URL, branch (for example, `*/main`), and script path `Jenkinsfile`.
4. Import this repository into Vercel, set the project **Root Directory** to `frontend`, and make an initial deployment. Note the Vercel team/owner ID, project ID, and production URL.
5. In **Manage Jenkins → Credentials**, add four **Secret text** credentials with these IDs:
   - `vercel-token`: a Vercel access token with access to the project.
   - `vercel-org-id`: the Vercel team/owner ID.
   - `vercel-project-id`: the Vercel project ID.
   - `vercel-site-url`: the public production URL, such as `https://your-project.vercel.app`.
6. Use a Jenkins agent with Node.js 20 or later, Git, internet access, and the Pipeline: Declarative and Credentials Binding plugins.
7. Save and run **Build Now**. Once successful, push a commit to the configured branch; Jenkins polls for it and deploys successful changes to the same Vercel project.

The pipeline uses Windows `bat` and Unix `sh` steps as appropriate. It reads Vercel credentials from Jenkins, not from the repository. It pulls the Vercel project settings, creates a production build, deploys the prebuilt output, and checks the configured production URL.

## Project layout

```text
frontend/              React app, tests, Vite build, and Vercel CLI
scripts/smoke-test.js  HTTP check for the deployed app
docker-compose.yml     Optional local frontend container
Jenkinsfile            CI/CD pipeline
```
